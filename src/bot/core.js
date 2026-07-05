const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const logger = require('../utils/logger');
const AIHandler = require('./ai-handler');
const Actions = require('./actions');
const TaskManager = require('./tasks');
const NPCInteraction = require('./npc-interaction');
const NPCBehavior = require('./npc-behavior');
const WorldSystem = require('./world-system');
const EconomySystem = require('./economy-system');
const AchievementSystem = require('./achievement-system');
const DialogueSystem = require('./dialogue-system');
const AdvancedAI = require('./advanced-ai');
const Database = require('../database/db');
const config = require('../utils/config');

class BotCore {
  constructor(settings, io = null) {
    this.settings = settings;
    this.io = io;
    this.bot = null;
    this.username = settings.bot_username || 'AIBot';
    this.aiHandler = new AIHandler(settings);
    this.actions = null;
    this.taskManager = new TaskManager();
    this.npcInteraction = null;
    this.npcBehaviors = new Map();
    this.world = null;
    this.economy = null;
    this.achievements = null;
    this.dialogue = null;
    this.advancedAI = null;
    this.db = global.db;
    this.logs = [];
    this.exploredChunks = [];
    this.health = 20;
    this.food = 20;
    this.foodSaturation = 0;
    this.playerStats = {
      playtime: 0,
      blocks_mined: 0,
      crops_harvested: 0,
      fish_caught: 0,
      mobs_killed: 0,
      distance_traveled: 0,
      money: 0,
      quests_completed: 0,
      high_reputation_npcs: 0,
      buildings_built: 0,
      chunks_explored: 0
    };
  }

  async start() {
    try {
      logger.info('Bot başlatılıyor...');

      this.bot = mineflayer.createBot({
        host: this.settings.mc_server,
        port: this.settings.mc_port || 25565,
        username: this.username,
        password: this.settings.bot_password || undefined,
        auth: this.settings.bot_email ? 'microsoft' : 'offline',
        version: this.settings.mc_version || '1.20.1'
      });

      // Sistemleri başlat
      this.actions = new Actions(this.bot);
      this.npcInteraction = new NPCInteraction(this.bot);
      this.world = new WorldSystem(this.bot);
      this.economy = new EconomySystem(this.db);
      this.achievements = new AchievementSystem(this.db);
      this.dialogue = new DialogueSystem(this.db);
      this.advancedAI = new AdvancedAI(this.bot, this.aiHandler, this.db);

      // Pathfinder Plugin
      this.bot.loadPlugin(pathfinder);
      const mcData = require('minecraft-data')(this.bot.version.minecraftVersion);
      const movements = new Movements(this.bot, mcData);
      this.bot.pathfinder.setMovements(movements);

      // Event Listeners
      this.bot.on('login', () => {
        logger.info(`✅ Bot giriş yaptı: ${this.username}`);
        this.addLog(`Bot giriş yaptı: ${this.username}`);
        this.broadcastStatus();
        this.initializeNPCs();
      });

      this.bot.on('chat', (username, message) => {
        logger.info(`[CHAT] ${username}: ${message}`);
        this.handleChatMessage(username, message);
      });

      this.bot.on('error', (error) => {
        logger.error('Bot hatası:', error);
        this.addLog(`Hata: ${error.message}`, 'error');
      });

      this.bot.on('end', () => {
        logger.info('Bot bağlantısı kesildi');
        this.addLog('Bot bağlantısı kesildi');
      });

      this.bot.on('health', () => {
        this.health = this.bot.health || 20;
        this.food = this.bot.food || 20;
        this.foodSaturation = this.bot.foodSaturation || 0;
      });

      this.bot.on('kicked', (reason) => {
        logger.warn('Bot atıldı:', reason);
        this.addLog(`Bot atıldı: ${reason}`, 'warning');
      });

      // Otomatik görevleri başlat
      this.startAutomation();
      this.startStatTracking();

      return true;
    } catch (error) {
      logger.error('Bot başlatma hatası:', error);
      throw error;
    }
  }

  async stop() {
    try {
      if (this.bot) {
        this.bot.quit();
        this.bot = null;
        logger.info('Bot durduruldu');
      }
    } catch (error) {
      logger.error('Bot durdurma hatası:', error);
    }
  }

  async initializeNPCs() {
    try {
      // NPC'leri veritabanından yükle
      const npcs = await this.db.getAllNPCs();
      npcs.forEach(npc => {
        this.npcBehaviors.set(npc.name, new NPCBehavior(this.bot, npc, this.db));
      });
      this.addLog(`${npcs.length} NPC yüklendi`);
    } catch (error) {
      logger.error('NPC başlatma hatası:', error);
    }
  }

  async handleChatMessage(username, message) {
    if (username === this.username) return;

    if (message.includes('@bot') || message.includes(`@${this.username}`)) {
      try {
        const response = await this.aiHandler.chat(message);
        this.bot.chat(response);
      } catch (error) {
        logger.error('AI sohbet hatası:', error);
      }
    }

    if (message.startsWith('/')) {
      this.handleCommand(message);
    }
  }

  async handleCommand(command) {
    logger.info(`Komut alındı: ${command}`);
    
    const parts = command.toLowerCase().split(' ');
    const cmd = parts[0].replace('/', '');

    try {
      switch (cmd) {
        case 'mine':
          await this.startMining(parts[1]);
          break;
        case 'farm':
          await this.startFarming(parts[1]);
          break;
        case 'fish':
          await this.startFishing();
          break;
        case 'fight':
          await this.startCombat();
          break;
        case 'explore':
          await this.startExploration();
          break;
        case 'npc':
          await this.interactWithNPC(parts[1]);
          break;
        case 'task':
          this.taskManager.addTask(parts.slice(1).join(' '));
          break;
        case 'status':
          this.reportStatus();
          break;
        case 'inventory':
          this.reportInventory();
          break;
        case 'stop':
          await this.stop();
          break;
        default:
          this.bot.chat(`Bilinmeyen komut: ${cmd}`);
      }
    } catch (error) {
      logger.error(`Komut hatası (${cmd}):`, error);
      this.addLog(`Komut hatası: ${error.message}`, 'error');
    }
  }

  async handleAIChat(message) {
    try {
      const response = await this.aiHandler.chat(message);
      this.bot.chat(response);
      this.addLog(`AI: ${response}`);
    } catch (error) {
      logger.error('AI sohbet hatası:', error);
    }
  }

  async interactWithNPC(npcName) {
    if (!this.npcInteraction) return;
    try {
      this.addLog(`🧑 ${npcName} ile etkileşim başladı`);
      await this.npcInteraction.interactWithNPC(npcName);
    } catch (error) {
      this.addLog(`NPC etkileşim hatası: ${error.message}`, 'error');
    }
  }

  async startMining(block) {
    if (!this.actions) return;
    try {
      this.addLog(`⛏️ Madencilik başladı: ${block || 'tümü'}`);
      await this.actions.mineBlock(block);
      this.playerStats.blocks_mined += 10; // Simülasyon
    } catch (error) {
      this.addLog(`Madencilik hatası: ${error.message}`, 'error');
    }
  }

  async startFarming(crop) {
    if (!this.actions) return;
    try {
      this.addLog(`🌾 Tarım başladı: ${crop || 'buğday'}`);
      await this.actions.farmCrops(crop);
      this.playerStats.crops_harvested += 5;
    } catch (error) {
      this.addLog(`Tarım hatası: ${error.message}`, 'error');
    }
  }

  async startFishing() {
    if (!this.actions) return;
    try {
      this.addLog(`🎣 Balıkçılık başladı`);
      await this.actions.fish();
      this.playerStats.fish_caught += 1;
    } catch (error) {
      this.addLog(`Balıkçılık hatası: ${error.message}`, 'error');
    }
  }

  async startCombat() {
    if (!this.actions) return;
    try {
      this.addLog(`⚔️ Savaş başladı`);
      await this.actions.combat();
      this.playerStats.mobs_killed += 1;
    } catch (error) {
      this.addLog(`Savaş hatası: ${error.message}`, 'error');
    }
  }

  async startExploration() {
    if (!this.actions) return;
    try {
      this.addLog(`🗺️ Harita keşfi başladı`);
      await this.actions.explore();
      this.playerStats.chunks_explored += 1;
    } catch (error) {
      this.addLog(`Keşif hatası: ${error.message}`, 'error');
    }
  }

  async startAutomation() {
    if (!this.bot) return;
    
    this.addLog('🤖 Otomasyonlar başladı');
    
    // Hayatta kalma
    setInterval(() => this.handleSurvival(), 30000);
    
    // Otomatik beslenme
    setInterval(() => this.handleFeeding(), 60000);
    
    // NPC davranışları güncelle
    setInterval(() => this.updateNPCBehaviors(), 5000);
    
    // Başarıları kontrol et
    setInterval(() => this.checkAchievements(), 30000);
  }

  startStatTracking() {
    // Oyuncu istatistikleri izle
    setInterval(() => {
      this.playerStats.playtime += 1;
      this.playerStats.money += Math.random() * 10; // Simülasyon
    }, 60000); // Her dakika
  }

  async updateNPCBehaviors() {
    for (const [name, behavior] of this.npcBehaviors) {
      await behavior.update();
    }
  }

  async checkAchievements() {
    const unlockedAchievements = await this.achievements.unlockAchievements(1, this.playerStats);
    if (unlockedAchievements.length > 0) {
      unlockedAchievements.forEach(ach => {
        this.bot.chat(`🏆 Başarı açıldı: ${ach.name}`);
      });
    }
  }

  async handleSurvival() {
    if (!this.bot) return;
    
    if (this.bot.health < 18) {
      this.addLog('⚠️ Hasar alındı, iyileştirme başladı');
      this.actions?.drinkPotion();
    }
  }

  async handleFeeding() {
    if (!this.bot) return;
    
    if (this.bot.food < 15) {
      this.addLog('🍞 Besleniliyor');
      this.actions?.eat();
    }
  }

  reportStatus() {
    const status = `Status: HP=${this.health}/20, Hunger=${this.food}/20, Pos=${this.bot.entity?.position.x.toFixed(2)},${this.bot.entity?.position.z.toFixed(2)}`;
    this.bot.chat(status);
    this.addLog(status);
  }

  reportInventory() {
    const items = this.bot.inventory.slots
      .filter(item => item)
      .map(item => `${item.name}x${item.count}`)
      .join(', ');
    this.bot.chat(`Envanter: ${items || 'Boş'}`);
  }

  broadcastStatus() {
    if (this.io) {
      this.io.emit('bot-status', {
        online: true,
        username: this.username,
        health: this.health,
        food: this.food,
        stats: this.playerStats
      });
    }
  }

  addLog(message, type = 'info') {
    this.logs.push({ timestamp: new Date(), message, type });
    logger.info(message);
    
    if (this.io) {
      this.io.emit('bot-log', { message, type });
    }
  }

  get entity() {
    return this.bot?.entity;
  }
}

module.exports = BotCore;

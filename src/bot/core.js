const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const logger = require('../utils/logger');
const AIHandler = require('./ai-handler');
const Actions = require('./actions');
const TaskManager = require('./tasks');
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
    this.logs = [];
    this.exploredChunks = [];
    this.health = 20;
    this.food = 20;
    this.foodSaturation = 0;
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

      this.actions = new Actions(this.bot);

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

  async handleChatMessage(username, message) {
    // Eğer kendi mesajıysa göz ardı et
    if (username === this.username) return;

    // AI ile sohbet
    if (message.includes('@bot') || message.includes(`@${this.username}`)) {
      try {
        const response = await this.aiHandler.chat(message);
        this.bot.chat(response);
      } catch (error) {
        logger.error('AI sohbet hatası:', error);
      }
    }

    // Komut kontrolü
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

  async startMining(block) {
    if (!this.actions) return;
    try {
      this.addLog(`🪓 Madencilik başladı: ${block || 'tümü'}`);
      await this.actions.mineBlock(block);
    } catch (error) {
      this.addLog(`Madencilik hatası: ${error.message}`, 'error');
    }
  }

  async startFarming(crop) {
    if (!this.actions) return;
    try {
      this.addLog(`🌾 Tarım başladı: ${crop || 'buğday'}`);
      await this.actions.farmCrops(crop);
    } catch (error) {
      this.addLog(`Tarım hatası: ${error.message}`, 'error');
    }
  }

  async startFishing() {
    if (!this.actions) return;
    try {
      this.addLog(`🎣 Balıkçılık başladı`);
      await this.actions.fish();
    } catch (error) {
      this.addLog(`Balıkçılık hatası: ${error.message}`, 'error');
    }
  }

  async startCombat() {
    if (!this.actions) return;
    try {
      this.addLog(`⚔️ Savaş başladı`);
      await this.actions.combat();
    } catch (error) {
      this.addLog(`Savaş hatası: ${error.message}`, 'error');
    }
  }

  async startExploration() {
    if (!this.actions) return;
    try {
      this.addLog(`🗺️ Harita keşfi başladı`);
      await this.actions.explore();
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
    
    // Otomatik tarım
    if (this.settings.auto_farm) {
      setInterval(() => this.startFarming(), 300000);
    }

    // Otomatik balıkçılık
    if (this.settings.auto_fish) {
      setInterval(() => this.startFishing(), 600000);
    }
  }

  async handleSurvival() {
    if (!this.bot) return;
    
    // Hasar almışsa iyileş
    if (this.bot.health < 18) {
      this.addLog('⚠️ Hasar alındı, iyileştirme başladı');
      this.actions?.drinkPotion();
    }
  }

  async handleFeeding() {
    if (!this.bot) return;
    
    if (this.bot.food < 15) {
      this.addLog('🍖 Besleniliyor');
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
        food: this.food
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
}

module.exports = BotCore;

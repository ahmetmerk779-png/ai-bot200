const logger = require('../utils/logger');
const Database = require('../database/db');

class NPCBehavior {
  constructor(bot, npc, db) {
    this.bot = bot;
    this.npc = npc;
    this.db = db;
    this.state = 'idle';
    this.target = null;
    this.pathfinding = null;
    this.behaviors = this.initializeBehaviors();
  }

  initializeBehaviors() {
    return {
      merchant: {
        name: '📦 Ticaraı',
        trade: true,
        greeting: 'Merhaba! Ne alabilir miyim sana?',
        behaviors: ['wander', 'trade', 'social']
      },
      quest_giver: {
        name: '📜 Görev Verici',
        quests: true,
        greeting: 'Bana yarıdım eder misin?',
        behaviors: ['wander', 'quest', 'social']
      },
      guard: {
        name: '⚔️ Asker',
        combat: true,
        greeting: 'Bu alanı koruyorum!',
        behaviors: ['patrol', 'combat', 'protect']
      },
      healer: {
        name: '👪 İyileştirici',
        heal: true,
        greeting: 'Sağlığın naıl?',
        behaviors: ['wander', 'heal', 'social']
      },
      miner: {
        name: '⛏️ Madençi',
        mine: true,
        greeting: 'Madencilik başarılı mı?',
        behaviors: ['mine', 'wander', 'social']
      },
      farmer: {
        name: '🌾 Çıfçı',
        farm: true,
        greeting: 'Tarım nasıl gidiyor?',
        behaviors: ['farm', 'wander', 'social']
      },
      explorer: {
        name: '🗺️ Keşifçi',
        explore: true,
        greeting: 'Dünyayı keşfetmeye lübih var mı?',
        behaviors: ['explore', 'wander', 'social']
      },
      builder: {
        name: '🎗️ Inşaatçı',
        build: true,
        greeting: 'Bir şeyi inşa etmek ister misin?',
        behaviors: ['build', 'wander', 'social']
      }
    };
  }

  async update() {
    try {
      const behavior = this.behaviors[this.npc.type];
      if (!behavior) return;

      // Rastgele davranış seç
      const randomBehavior = behavior.behaviors[Math.floor(Math.random() * behavior.behaviors.length)];
      
      switch (randomBehavior) {
        case 'wander':
          await this.wander();
          break;
        case 'patrol':
          await this.patrol();
          break;
        case 'trade':
          await this.trade();
          break;
        case 'quest':
          await this.questActivity();
          break;
        case 'combat':
          await this.combatBehavior();
          break;
        case 'mine':
          await this.mineBehavior();
          break;
        case 'farm':
          await this.farmBehavior();
          break;
        case 'heal':
          await this.healBehavior();
          break;
      }
    } catch (error) {
      logger.error('NPC davranış hatası:', error);
    }
  }

  async wander() {
    // Rastgele dolaş
    const range = 20;
    const randomX = this.npc.position_x + (Math.random() - 0.5) * range;
    const randomZ = this.npc.position_z + (Math.random() - 0.5) * range;
    
    this.state = 'wandering';
    // Pathfinding burada yapılacak
  }

  async patrol() {
    // Belirli bir alanda devriye gezme
    this.state = 'patrolling';
  }

  async trade() {
    this.state = 'trading';
  }

  async questActivity() {
    this.state = 'quest_activity';
  }

  async combatBehavior() {
    const enemies = this.findNearbyEnemies();
    if (enemies.length > 0) {
      this.state = 'combat';
      this.target = enemies[0];
    }
  }

  async mineBehavior() {
    this.state = 'mining';
  }

  async farmBehavior() {
    this.state = 'farming';
  }

  async healBehavior() {
    this.state = 'healing';
  }

  findNearbyEnemies() {
    // Düşman bulma lojiği
    return [];
  }

  getState() {
    return this.state;
  }
}

module.exports = NPCBehavior;

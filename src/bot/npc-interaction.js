const logger = require('../utils/logger');
const Vec3 = require('vec3');

class NPCInteraction {
  constructor(bot) {
    this.bot = bot;
    this.nearbyNPCs = [];
    this.activeGUI = null;
    this.interactionHistory = [];
    this.setupNPCTracking();
  }

  setupNPCTracking() {
    setInterval(() => {
      this.updateNearbyNPCs();
    }, 1000);
  }

  updateNearbyNPCs() {
    try {
      this.nearbyNPCs = this.bot.players
        .filter(player => {
          const dist = this.bot.entity.position.distanceTo(player.entity.position);
          return dist < 50 && player.username !== this.bot.username;
        })
        .map(player => ({
          username: player.username,
          position: player.entity.position,
          skin: player.skin,
          uuid: player.uuid,
          distance: this.bot.entity.position.distanceTo(player.entity.position)
        }));

      if (this.nearbyNPCs.length > 0 && global.io) {
        global.io.emit('npcs-nearby', this.nearbyNPCs);
      }
    } catch (error) {
      logger.error('NPC güncelleme hatası:', error);
    }
  }

  async interactWithNPC(npcName) {
    try {
      const npc = this.nearbyNPCs.find(n => n.username === npcName);
      if (!npc) {
        logger.warn(`NPC bulunamadı: ${npcName}`);
        return false;
      }

      // NPC'ye doğru yürü
      const distance = this.bot.entity.position.distanceTo(npc.position);
      if (distance > 5) {
        await this.walkToNPC(npc);
      }

      // Etkileşim GUI'sini aç
      this.openNPCGUI(npc);
      logger.info(`${npcName} ile etkileşim başladı`);

      return true;
    } catch (error) {
      logger.error('NPC etkileşim hatası:', error);
      return false;
    }
  }

  async walkToNPC(npc) {
    try {
      const targetPos = npc.position.offset(0, 0, 0);
      await this.bot.pathfinder.goto(targetPos);
    } catch (error) {
      logger.error('NPC yürüyüş hatası:', error);
    }
  }

  openNPCGUI(npc) {
    this.activeGUI = {
      type: 'npc-interaction',
      npc: npc.username,
      options: this.generateNPCOptions(npc),
      timestamp: Date.now()
    };

    if (global.io) {
      global.io.emit('npc-gui-open', {
        npc: npc.username,
        position: npc.position,
        options: this.activeGUI.options,
        dialog: this.generateDialog(npc)
      });
    }
  }

  generateNPCOptions(npc) {
    return [
      {
        id: 'talk',
        label: '💬 Konuş',
        icon: 'chat',
        description: 'NPC ile sohbet et'
      },
      {
        id: 'trade',
        label: '💰 Ticaret',
        icon: 'trade',
        description: 'Eşya al/sat'
      },
      {
        id: 'quest',
        label: '📜 Görev',
        icon: 'quest',
        description: 'Görev kabul et/tamamla'
      },
      {
        id: 'follow',
        label: '👣 Takip',
        icon: 'follow',
        description: 'NPC\'yi takip et'
      },
      {
        id: 'info',
        label: 'ℹ️ Bilgi',
        icon: 'info',
        description: 'NPC hakkında bilgi'
      },
      {
        id: 'close',
        label: '✖️ Kapat',
        icon: 'close',
        description: 'Penceyi kapat'
      }
    ];
  }

  generateDialog(npc) {
    const dialogs = {
      'Ticara': {
        greeting: 'Merhaba! Size ne satabilir miyim?',
        options: ['Satın Al', 'Sat', 'Ayrıl']
      },
      'Görevli': {
        greeting: 'Bana yardım eder misin?',
        options: ['Görev Kabul Et', 'Görevler Listesi', 'Ayrıl']
      },
      'Rehber': {
        greeting: 'Seni nereden tanıdığını merak ediyorum!',
        options: ['Bilgi İste', 'Takip Et', 'Ayrıl']
      },
      'default': {
        greeting: `Merhaba! Ben ${npc.username}.`,
        options: ['Konuş', 'Bilgi İste', 'Ayrıl']
      }
    };

    const npcType = Object.keys(dialogs).find(key => npc.username.includes(key)) || 'default';
    return dialogs[npcType];
  }

  async handleNPCAction(npcName, action) {
    try {
      switch (action) {
        case 'talk':
          await this.talkToNPC(npcName);
          break;
        case 'trade':
          await this.openTradeGUI(npcName);
          break;
        case 'quest':
          await this.openQuestGUI(npcName);
          break;
        case 'follow':
          await this.followNPC(npcName);
          break;
        case 'info':
          await this.showNPCInfo(npcName);
          break;
        case 'close':
          this.closeNPCGUI();
          break;
      }
    } catch (error) {
      logger.error(`NPC aksiyon hatası (${action}):`, error);
    }
  }

  async talkToNPC(npcName) {
    const npc = this.nearbyNPCs.find(n => n.username === npcName);
    if (!npc) return;

    const dialog = this.generateDialog(npc);
    const aiResponse = await this.getAIResponse(`Selamla: ${npc.username}`);

    const response = {
      type: 'npc-dialog',
      npc: npcName,
      message: aiResponse || dialog.greeting,
      options: dialog.options,
      timestamp: Date.now()
    };

    if (global.io) {
      global.io.emit('npc-dialog', response);
    }

    this.interactionHistory.push(response);
  }

  async openTradeGUI(npcName) {
    const tradeData = {
      type: 'trade-gui',
      npc: npcName,
      items: [
        { id: 1, name: 'Elmas', icon: 'diamond', price: 100, quantity: 5 },
        { id: 2, name: 'Altın', icon: 'gold', price: 50, quantity: 10 },
        { id: 3, name: 'Demir', icon: 'iron', price: 25, quantity: 20 },
        { id: 4, name: 'Bakır', icon: 'copper', price: 15, quantity: 30 },
        { id: 5, name: 'Kömür', icon: 'coal', price: 5, quantity: 50 }
      ],
      playerInventory: this.getInventoryForTrade(),
      balance: 1000
    };

    if (global.io) {
      global.io.emit('trade-gui-open', tradeData);
    }

    this.activeGUI = tradeData;
  }

  async openQuestGUI(npcName) {
    const quests = [
      {
        id: 1,
        title: 'Elmas Toplayıcı',
        description: '10 adet elmas topla',
        reward: 500,
        progress: 5,
        total: 10,
        status: 'in_progress'
      },
      {
        id: 2,
        title: 'Canavar Avcısı',
        description: '5 zombie öldür',
        reward: 300,
        progress: 0,
        total: 5,
        status: 'available'
      },
      {
        id: 3,
        title: 'Yapı Ustası',
        description: 'Bir ev inşa et',
        reward: 1000,
        progress: 0,
        total: 1,
        status: 'available'
      }
    ];

    const questData = {
      type: 'quest-gui',
      npc: npcName,
      quests: quests
    };

    if (global.io) {
      global.io.emit('quest-gui-open', questData);
    }

    this.activeGUI = questData;
  }

  async followNPC(npcName) {
    const npc = this.nearbyNPCs.find(n => n.username === npcName);
    if (!npc) return;

    logger.info(`${npcName} takip ediliyor`);
    let isFollowing = true;

    const followInterval = setInterval(() => {
      if (!isFollowing) {
        clearInterval(followInterval);
        return;
      }

      const npc = this.nearbyNPCs.find(n => n.username === npcName);
      if (npc) {
        this.bot.pathfinder.goto(npc.position);
      }
    }, 1000);

    if (global.io) {
      global.io.emit('npc-follow-started', { npc: npcName });
    }
  }

  async showNPCInfo(npcName) {
    const npc = this.nearbyNPCs.find(n => n.username === npcName);
    if (!npc) return;

    const info = {
      type: 'npc-info',
      username: npc.username,
      position: {
        x: Math.round(npc.position.x),
        y: Math.round(npc.position.y),
        z: Math.round(npc.position.z)
      },
      distance: Math.round(npc.distance),
      uuid: npc.uuid,
      description: this.getNPCDescription(npc),
      achievements: this.getNPCAchievements(npc)
    };

    if (global.io) {
      global.io.emit('npc-info', info);
    }
  }

  getNPCDescription(npc) {
    const descriptions = {
      'Ticara': '📦 Deneyimli bir tüccar. Her zaman iyi fiyatlar bulabilir.',
      'Görevli': '📜 Maceralar severim ve sana yardım etmek isterim.',
      'Rehber': '🗺️ Dünyayı keşfetmek benim tutkum.',
      'Asker': '⚔️ Dünyayı düşmanlardan korurum.',
      'default': '🙂 Beni tanımıyorum ama merhaba!'
    };

    const key = Object.keys(descriptions).find(k => npc.username.includes(k)) || 'default';
    return descriptions[key];
  }

  getNPCAchievements(npc) {
    return [
      { name: '🏆 İlk Buluşma', unlocked: true },
      { name: '💬 Konuşkan', unlocked: true },
      { name: '💰 Ticaret Ustası', unlocked: false },
      { name: '🎯 Görev Tamamlayıcı', unlocked: false }
    ];
  }

  getInventoryForTrade() {
    const items = this.bot.inventory.slots
      .filter(slot => slot !== null)
      .map((item, index) => ({
        id: index,
        name: item.name,
        count: item.count,
        icon: item.name.toLowerCase()
      }));
    return items;
  }

  async getAIResponse(message) {
    try {
      const bot = global.botInstance;
      if (bot && bot.aiHandler) {
        return await bot.aiHandler.chat(message);
      }
    } catch (error) {
      logger.error('AI yanıt hatası:', error);
    }
    return null;
  }

  closeNPCGUI() {
    this.activeGUI = null;
    if (global.io) {
      global.io.emit('npc-gui-close');
    }
  }

  getNearbyNPCs() {
    return this.nearbyNPCs;
  }

  getInteractionHistory() {
    return this.interactionHistory;
  }
}

module.exports = NPCInteraction;

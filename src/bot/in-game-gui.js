const logger = require('../utils/logger');

class InGameGUI {
  constructor(bot) {
    this.bot = bot;
    this.activeGUI = null;
    this.menuState = 'main';
    this.playerMenus = new Map();
  }

  // Ana menüyü aç
  openMainMenu() {
    const menu = {
      title: '🤖 AI-Bot200',
      options: [
        { id: '1', label: '🗣️ Sohbet', action: 'chat' },
        { id: '2', label: '⛏️ Madencilik', action: 'mining' },
        { id: '3', label: '🌾 Tarım', action: 'farming' },
        { id: '4', label: '🐟 Balıkçılık', action: 'fishing' },
        { id: '5', label: '⚔️ Savaş', action: 'combat' },
        { id: '6', label: '👥 NPC', action: 'npc' },
        { id: '7', label: '📋 Görevler', action: 'quests' },
        { id: '8', label: '💰 Ekonomi', action: 'economy' },
        { id: '9', label: '🏆 Başarılar', action: 'achievements' },
        { id: '0', label: '❌ Kapat', action: 'close' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Chat menüsü
  openChatMenu() {
    const menu = {
      title: '💬 Sohbet',
      subtitle: 'NPC veya oyunculara mesaj gönder',
      options: [
        { id: '1', label: 'Merhaba!', message: 'Merhaba!' },
        { id: '2', label: 'Nasılsın?', message: 'Nasılsın?' },
        { id: '3', label: 'Bana yardım eder misin?', message: 'Bana yardım eder misin?' },
        { id: '4', label: 'Ticaret yapalım', message: 'Ticaret yapalım' },
        { id: '5', label: 'Görev var mı?', message: 'Görev var mı?' },
        { id: '6', label: 'Teşekkürler!', message: 'Teşekkürler!' },
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Madencilik menüsü
  openMiningMenu() {
    const menu = {
      title: '⛏️ Madencilik',
      subtitle: 'Madencilik türünü seç',
      options: [
        { id: '1', label: 'Taş', resource: 'stone' },
        { id: '2', label: 'Demir', resource: 'iron' },
        { id: '3', label: 'Bakır', resource: 'copper' },
        { id: '4', label: 'Altın', resource: 'gold' },
        { id: '5', label: 'Elmas', resource: 'diamond' },
        { id: '6', label: 'Emerald', resource: 'emerald' },
        { id: '7', label: 'Otomatik Madencilik', auto: true },
        { id: '8', label: 'Durdur', stop: true },
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Tarım menüsü
  openFarmingMenu() {
    const menu = {
      title: '🌾 Tarım',
      subtitle: 'Tarım türünü seç',
      options: [
        { id: '1', label: 'Buğday', crop: 'wheat' },
        { id: '2', label: 'Mısır', crop: 'corn' },
        { id: '3', label: 'Patates', crop: 'potato' },
        { id: '4', label: 'Havuç', crop: 'carrot' },
        { id: '5', label: 'Domatesler', crop: 'tomato' },
        { id: '6', label: 'Otomatik Tarım', auto: true },
        { id: '7', label: 'Durdur', stop: true },
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Balıkçılık menüsü
  openFishingMenu() {
    const menu = {
      title: '🐟 Balıkçılık',
      subtitle: 'Balık tutmaya başla',
      options: [
        { id: '1', label: '🎣 Balık Tut', action: 'start_fishing' },
        { id: '2', label: '⏸️ Durdur', action: 'stop_fishing' },
        { id: '3', label: '📊 İstatistikler', action: 'fishing_stats' },
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Savaş menüsü
  openCombatMenu() {
    const menu = {
      title: '⚔️ Savaş',
      subtitle: 'Savaş modu seç',
      options: [
        { id: '1', label: '🧟 Zombie Av', target: 'zombie' },
        { id: '2', label: '💀 Skeleton Av', target: 'skeleton' },
        { id: '3', label: '💥 Creeper Av', target: 'creeper' },
        { id: '4', label: '🕷️ Spider Av', target: 'spider' },
        { id: '5', label: '⚔️ Tüm Düşmanlar', target: 'all' },
        { id: '6', label: '⏸️ Savaşı Durdur', stop: true },
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // NPC menüsü
  openNPCMenu(npcs) {
    const npcOptions = npcs.map((npc, index) => ({
      id: String(index + 1),
      label: `${npc.username} (${Math.round(npc.distance)}m)`,
      npc: npc.username
    }));

    const menu = {
      title: '👥 NPC İşlemleri',
      subtitle: 'Bir NPC seç',
      options: [
        ...npcOptions,
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Görev menüsü
  openQuestMenu(quests) {
    const questOptions = quests.map((quest, index) => ({
      id: String(index + 1),
      label: `${quest.title} (${quest.progress}/${quest.total})`,
      quest: quest.id
    }));

    const menu = {
      title: '📋 Görevler',
      subtitle: 'Görev seç',
      options: [
        ...questOptions,
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Ekonomi menüsü
  openEconomyMenu(balance) {
    const menu = {
      title: '💰 Ekonomi',
      subtitle: `Bakiye: ${balance} 🪙`,
      options: [
        { id: '1', label: '🏪 Pazaryeri', action: 'market' },
        { id: '2', label: '💸 Para Transferi', action: 'transfer' },
        { id: '3', label: '🏦 Banka', action: 'bank' },
        { id: '4', label: '📊 Fiyat Listesi', action: 'prices' },
        { id: '5', label: '📈 Grafik', action: 'chart' },
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Başarılar menüsü
  openAchievementsMenu(achievements) {
    const achOptions = achievements.map((ach, index) => ({
      id: String(index + 1),
      label: `${ach.unlocked ? '✅' : '🔒'} ${ach.name}`,
      achievement: ach.id
    }));

    const menu = {
      title: '🏆 Başarılar',
      subtitle: `${achievements.filter(a => a.unlocked).length}/${achievements.length} Açıldı`,
      options: [
        ...achOptions,
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Pazaryeri menüsü
  openMarketMenu(items) {
    const itemOptions = items.map((item, index) => ({
      id: String(index + 1),
      label: `${item.name} - ${item.price}🪙 (Stok: ${item.stock})`,
      item: item.id
    }));

    const menu = {
      title: '🏪 Pazaryeri',
      subtitle: 'Ürün seç',
      options: [
        ...itemOptions,
        { id: '0', label: '← Geri', action: 'back' }
      ]
    };
    this.activeGUI = menu;
    this.broadcastMenu(menu);
  }

  // Menüyü yayınla
  broadcastMenu(menu) {
    if (global.io) {
      global.io.emit('gui-menu', menu);
    }
    logger.info(`GUI Menüsü Açıldı: ${menu.title}`);
  }

  // Oyuncu seçimini işle
  async handleSelection(playerId, selectionId) {
    try {
      const menu = this.activeGUI;
      if (!menu) return;

      const option = menu.options.find(opt => opt.id === selectionId);
      if (!option) return;

      if (option.action) {
        this.handleAction(option.action);
      } else if (option.message) {
        this.handleMessage(option.message);
      } else if (option.resource) {
        this.handleMining(option.resource);
      } else if (option.crop) {
        this.handleFarming(option.crop);
      } else if (option.npc) {
        this.handleNPCInteraction(option.npc);
      } else if (option.target) {
        this.handleCombat(option.target);
      } else if (option.item) {
        this.handleMarketItem(option.item);
      } else if (option.auto) {
        this.handleAutoMode(menu.title);
      } else if (option.stop) {
        this.handleStop(menu.title);
      }
    } catch (error) {
      logger.error('Seçim işleme hatasında:', error);
    }
  }

  handleAction(action) {
    const bot = global.botInstance;
    if (!bot) return;

    switch (action) {
      case 'back':
        this.openMainMenu();
        break;
      case 'close':
        this.closeGUI();
        break;
      case 'chat':
        this.openChatMenu();
        break;
      case 'mining':
        this.openMiningMenu();
        break;
      case 'farming':
        this.openFarmingMenu();
        break;
      case 'fishing':
        this.openFishingMenu();
        break;
      case 'combat':
        this.openCombatMenu();
        break;
      case 'npc':
        if (bot.npcInteraction) {
          this.openNPCMenu(bot.npcInteraction.getNearbyNPCs());
        }
        break;
      case 'quests':
        if (bot.taskManager) {
          this.openQuestMenu(bot.taskManager.getPendingTasks());
        }
        break;
      case 'economy':
        if (bot.economy) {
          this.openEconomyMenu(0);
        }
        break;
      case 'achievements':
        this.openAchievementsMenu([]);
        break;
    }
  }

  handleMessage(message) {
    const bot = global.botInstance;
    if (bot) {
      bot.bot.chat(message);
      logger.info(`Mesaj gönderildi: ${message}`);
    }
  }

  handleMining(resource) {
    const bot = global.botInstance;
    if (bot) {
      bot.startMining(resource);
      this.closeGUI();
    }
  }

  handleFarming(crop) {
    const bot = global.botInstance;
    if (bot) {
      bot.startFarming(crop);
      this.closeGUI();
    }
  }

  handleNPCInteraction(npcName) {
    const bot = global.botInstance;
    if (bot) {
      bot.interactWithNPC(npcName);
      this.closeGUI();
    }
  }

  handleCombat(target) {
    const bot = global.botInstance;
    if (bot) {
      bot.startCombat();
      this.closeGUI();
    }
  }

  handleAutoMode(menuTitle) {
    const bot = global.botInstance;
    if (!bot) return;

    if (menuTitle.includes('Madencilik')) {
      bot.startMining('all');
    } else if (menuTitle.includes('Tarım')) {
      bot.startFarming('all');
    }
    this.closeGUI();
  }

  handleStop(menuTitle) {
    const bot = global.botInstance;
    if (!bot) return;

    if (bot.actions) {
      if (menuTitle.includes('Madencilik')) bot.actions.stopMining();
      if (menuTitle.includes('Tarım')) bot.actions.stopFarming();
      if (menuTitle.includes('Balık')) bot.actions.stopFishing();
      if (menuTitle.includes('Savaş')) bot.actions.isMining = false;
    }
    this.closeGUI();
  }

  handleMarketItem(itemId) {
    logger.info(`Pazaryeri ürünü seçildi: ${itemId}`);
    this.openMainMenu();
  }

  closeGUI() {
    this.activeGUI = null;
    if (global.io) {
      global.io.emit('gui-close');
    }
    logger.info('GUI Kapatıldı');
  }

  // Chat komutu ile menüyü aç
  async handleChatCommand(username, message) {
    if (!message.startsWith('!menu')) return;

    const args = message.slice(5).trim().split(' ');
    const command = args[0];

    switch (command) {
      case 'main':
      case '':
        this.openMainMenu();
        break;
      case 'mine':
        this.openMiningMenu();
        break;
      case 'farm':
        this.openFarmingMenu();
        break;
      case 'chat':
        this.openChatMenu();
        break;
      case 'npc':
        const bot = global.botInstance;
        if (bot && bot.npcInteraction) {
          this.openNPCMenu(bot.npcInteraction.getNearbyNPCs());
        }
        break;
    }
  }
}

module.exports = InGameGUI;

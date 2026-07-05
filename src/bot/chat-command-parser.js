const logger = require('../utils/logger');

class ChatCommandParser {
  constructor(bot, inGameGUI) {
    this.bot = bot;
    this.inGameGUI = inGameGUI;
    this.commands = this.registerCommands();
  }

  registerCommands() {
    return {
      'menu': this.handleMenuCommand.bind(this),
      'msg': this.handleMessageCommand.bind(this),
      'select': this.handleSelectCommand.bind(this),
      'status': this.handleStatusCommand.bind(this),
      'help': this.handleHelpCommand.bind(this)
    };
  }

  async parseCommand(message) {
    if (!message.startsWith('/')) return false;

    const parts = message.slice(1).split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.commands[command]) {
      await this.commands[command](args);
      return true;
    }

    return false;
  }

  async handleMenuCommand(args) {
    const menuType = args[0] || 'main';
    
    switch (menuType) {
      case 'main':
        this.inGameGUI.openMainMenu();
        break;
      case 'mine':
        this.inGameGUI.openMiningMenu();
        break;
      case 'farm':
        this.inGameGUI.openFarmingMenu();
        break;
      case 'chat':
        this.inGameGUI.openChatMenu();
        break;
      case 'npc':
        const npcs = this.bot.npcInteraction?.getNearbyNPCs() || [];
        this.inGameGUI.openNPCMenu(npcs);
        break;
      case 'quests':
        const quests = this.bot.taskManager?.getPendingTasks() || [];
        this.inGameGUI.openQuestMenu(quests);
        break;
      case 'economy':
        this.inGameGUI.openEconomyMenu(0);
        break;
      case 'achievements':
        this.inGameGUI.openAchievementsMenu([]);
        break;
      default:
        this.inGameGUI.openMainMenu();
    }
  }

  async handleMessageCommand(args) {
    const message = args.join(' ');
    if (this.bot.bot) {
      this.bot.bot.chat(message);
      logger.info(`Chat message sent: ${message}`);
    }
  }

  async handleSelectCommand(args) {
    const selectionId = args[0];
    if (this.inGameGUI.activeGUI) {
      await this.inGameGUI.handleSelection(null, selectionId);
    }
  }

  async handleStatusCommand(args) {
    if (!this.bot.bot) return;
    
    const status = `[BOT] Level: ${this.bot.playerStats.playtime || 0} | Health: ${this.bot.health}/20 | Hunger: ${this.bot.food}/20`;
    this.bot.bot.chat(status);
  }

  async handleHelpCommand(args) {
    const helpText = [
      '=== AI-BOT200 COMMANDS ===',
      '/menu [type] - Open menu (main/mine/farm/chat/npc/quests/economy)',
      '/msg [text] - Send chat message',
      '/status - Show bot status',
      '/help - Show this help',
      '!menu - Toggle main menu'
    ];

    if (this.bot.bot) {
      helpText.forEach(line => this.bot.bot.chat(line));
    }
  }
}

module.exports = ChatCommandParser;

const logger = require('../utils/logger');

class ProxyHandler {
  constructor(proxyType, bot) {
    this.proxyType = proxyType;
    this.bot = bot;
    this.setupProxy();
  }

  setupProxy() {
    switch (this.proxyType.toLowerCase()) {
      case 'velocity':
        logger.info('Velocity proxy modu yüklendi');
        break;
      case 'bungeecord':
        logger.info('BungeeCord proxy modu yüklendi');
        break;
      case 'waterfall':
        logger.info('Waterfall proxy modu yüklendi');
        break;
      default:
        logger.warn('Bilinmeyen proxy türü');
    }
  }

  async joinServer(serverName) {
    try {
      this.bot.chat(`/server ${serverName}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      logger.info(`Sunucuya bağlandı: ${serverName}`);
    } catch (error) {
      logger.error('Sunucu bağlantısı hatası:', error);
    }
  }

  async listServers() {
    this.bot.chat('/server');
  }
}

module.exports = ProxyHandler;

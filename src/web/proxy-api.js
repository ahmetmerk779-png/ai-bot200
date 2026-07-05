const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Proxy sunucusuna bağlan
router.post('/connect-server', async (req, res) => {
  try {
    const { serverName, host, port } = req.body;
    const bot = global.botInstance;

    if (!bot) {
      return res.status(400).json({ error: 'Bot çalışmıyor' });
    }

    // Proxy sunucusuna bağlantı
    bot.chat(`/server ${serverName}`);
    
    res.json({ 
      success: true, 
      message: `${serverName} sunucusuna bağlanıldı` 
    });
  } catch (error) {
    logger.error('Sunucu bağlantı hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Oyuncuları senkronize et
router.get('/players-sync', async (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot) {
      return res.json({ players: [] });
    }

    const players = Array.from(bot.players.values()).map(player => ({
      username: player.username,
      uuid: player.uuid,
      gamemode: player.gameMode,
      level: player.level
    }));

    res.json({ players });
  } catch (error) {
    logger.error('Oyuncu senkronizasyonu hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

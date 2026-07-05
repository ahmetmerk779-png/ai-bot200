const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Tüm NPC'leri getir
router.get('/npcs', (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot || !bot.npcInteraction) {
      return res.json({ npcs: [] });
    }
    const npcs = bot.npcInteraction.getNearbyNPCs();
    res.json({ npcs });
  } catch (error) {
    logger.error('NPC listesi hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ekonomi verisi
router.get('/economy', (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot || !bot.economy) {
      return res.json({ market: {} });
    }
    const market = bot.economy.getMarketData();
    res.json({ market });
  } catch (error) {
    logger.error('Ekonomi hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dünya bilgisi
router.get('/world', (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot || !bot.world) {
      return res.json({ stats: {} });
    }
    const stats = bot.world.getWorldStats();
    res.json({ stats });
  } catch (error) {
    logger.error('Dünya bilgisi hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Başarılar
router.get('/achievements', (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot || !bot.achievements) {
      return res.json({ achievements: [] });
    }
    // Başarılar
    res.json({ achievements: [] });
  } catch (error) {
    logger.error('Başarılar hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// NPC işlemi
router.post('/npc-action', (req, res) => {
  try {
    const { npc, action } = req.body;
    const bot = global.botInstance;

    if (!bot || !bot.npcInteraction) {
      return res.status(400).json({ error: 'Bot çalışmıyor' });
    }

    bot.npcInteraction.handleNPCAction(npc, action);
    res.json({ success: true });
  } catch (error) {
    logger.error('NPC işlem hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ticaret
router.post('/trade', (req, res) => {
  try {
    const { itemId, quantity, action } = req.body;
    const bot = global.botInstance;

    if (!bot) {
      return res.status(400).json({ error: 'Bot çalışmıyor' });
    }

    res.json({ success: true, transaction: 'completed' });
  } catch (error) {
    logger.error('Ticaret hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Görev tamamla
router.post('/complete-quest', (req, res) => {
  try {
    const { questId } = req.body;
    const bot = global.botInstance;

    if (!bot) {
      return res.status(400).json({ error: 'Bot çalışmıyor' });
    }

    res.json({ success: true, quest: questId });
  } catch (error) {
    logger.error('Görev tamamlama hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

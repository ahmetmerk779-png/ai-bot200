const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Status Endpoint
router.get('/status', (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot) {
      return res.json({
        status: 'offline',
        message: 'Bot çalışmıyor'
      });
    }

    res.json({
      status: 'online',
      username: bot.username,
      position: bot.entity ? {
        x: bot.entity.position.x,
        y: bot.entity.position.y,
        z: bot.entity.position.z
      } : null,
      health: bot.health || 0,
      hunger: bot.food || 0,
      dimension: bot.dimension || 'unknown'
    });
  } catch (error) {
    logger.error('Status endpoint hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Inventory Endpoint
router.get('/inventory', (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot || !bot.inventory) {
      return res.json({ items: [] });
    }

    const items = bot.inventory.slots
      .filter(slot => slot !== null)
      .map(item => ({
        name: item.name,
        count: item.count,
        metadata: item.metadata
      }));

    res.json({ items });
  } catch (error) {
    logger.error('Inventory endpoint hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health Endpoint
router.get('/health', (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot) {
      return res.json({ health: 0, food: 0 });
    }

    res.json({
      health: bot.health || 0,
      maxHealth: bot.maxHealth || 20,
      food: bot.food || 0,
      maxFood: 20,
      saturation: bot.foodSaturation || 0
    });
  } catch (error) {
    logger.error('Health endpoint hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tasks Endpoint
router.get('/tasks', (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot || !bot.tasks) {
      return res.json({ tasks: [] });
    }
    res.json({ tasks: bot.tasks });
  } catch (error) {
    logger.error('Tasks endpoint hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Command Endpoint
router.post('/command', (req, res) => {
  try {
    const { command } = req.body;
    const bot = global.botInstance;

    if (!bot) {
      return res.status(400).json({ error: 'Bot çalışmıyor' });
    }

    bot.handleCommand(command);
    res.json({ success: true, command });
  } catch (error) {
    logger.error('Command endpoint hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat Endpoint
router.post('/chat', (req, res) => {
  try {
    const { message } = req.body;
    const bot = global.botInstance;

    if (!bot) {
      return res.status(400).json({ error: 'Bot çalışmıyor' });
    }

    bot.handleAIChat(message);
    res.json({ success: true, message });
  } catch (error) {
    logger.error('Chat endpoint hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logs Endpoint
router.get('/logs', (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const bot = global.botInstance;

    if (!bot || !bot.logs) {
      return res.json({ logs: [] });
    }

    const logs = bot.logs.slice(-limit);
    res.json({ logs });
  } catch (error) {
    logger.error('Logs endpoint hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Map Endpoint
router.get('/map', (req, res) => {
  try {
    const bot = global.botInstance;
    if (!bot || !bot.entity) {
      return res.json({ 
        currentPos: null,
        explored: []
      });
    }

    res.json({
      currentPos: {
        x: bot.entity.position.x,
        y: bot.entity.position.y,
        z: bot.entity.position.z
      },
      explored: bot.exploredChunks || []
    });
  } catch (error) {
    logger.error('Map endpoint hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

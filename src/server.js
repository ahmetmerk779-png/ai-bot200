const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const logger = require('./utils/logger');
const config = require('./utils/config');
const BotCore = require('./bot/core');
const Database = require('./database/db');
const apiRouter = require('./web/api');
const apiExtended = require('./web/api-extended');
const proxyApi = require('./web/proxy-api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

// Güvenlik Middleware
app.use(helmet());
app.use(cors());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'web/public')));

// Database
const db = new Database();
global.db = db;

// API Routes
app.use('/api', apiRouter);
app.use('/api/extended', apiExtended);
app.use('/api/proxy', proxyApi);

// Dashboard Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web/dashboard.html'));
});

app.get('/advanced', (req, res) => {
  res.sendFile(path.join(__dirname, 'web/advanced-dashboard.html'));
});

app.get('/npc', (req, res) => {
  res.sendFile(path.join(__dirname, 'web/npc-dashboard.html'));
});

// Socket.io Bağlantıları
let botInstance = null;

io.on('connection', (socket) => {
  logger.info('Web dashboard bağlandı');

  socket.on('start-bot', async (data) => {
    try {
      if (!botInstance) {
        botInstance = new BotCore(config, io);
        await botInstance.start();
        global.botInstance = botInstance;
        socket.emit('bot-started', { success: true });
        io.emit('bot-status-changed', { status: 'online' });
      }
    } catch (error) {
      logger.error('Bot başlatılırken hata:', error);
      socket.emit('bot-error', { message: error.message });
    }
  });

  socket.on('stop-bot', async () => {
    try {
      if (botInstance) {
        await botInstance.stop();
        botInstance = null;
        global.botInstance = null;
        socket.emit('bot-stopped', { success: true });
        io.emit('bot-status-changed', { status: 'offline' });
      }
    } catch (error) {
      logger.error('Bot durdurulurken hata:', error);
      socket.emit('bot-error', { message: error.message });
    }
  });

  socket.on('send-command', (command) => {
    if (botInstance) {
      botInstance.handleCommand(command);
    }
  });

  socket.on('interact-npc', async (npcName) => {
    if (botInstance && botInstance.npcInteraction) {
      await botInstance.npcInteraction.interactWithNPC(npcName);
    }
  });

  socket.on('npc-action', async (data) => {
    if (botInstance && botInstance.npcInteraction) {
      await botInstance.npcInteraction.handleNPCAction(data.npc, data.action);
    }
  });

  socket.on('buy-item', async (data) => {
    if (botInstance && botInstance.economy) {
      const result = botInstance.economy.buyItem(data.itemId, 1);
      socket.emit('transaction-result', result);
    }
  });

  socket.on('accept-quest', async (data) => {
    if (botInstance && botInstance.taskManager) {
      botInstance.taskManager.addTask(`Quest #${data.questId}`);
      socket.emit('quest-accepted', { questId: data.questId });
    }
  });

  socket.on('disconnect', () => {
    logger.info('Web dashboard bağlantısı kesildi');
  });
});

// Global bot instance erişimi
global.botInstance = botInstance;
global.io = io;

const PORT = process.env.WEB_PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Web Dashboard ${PORT} portunda başladı`);
  logger.info(`http://localhost:${PORT}`);
  logger.info(`Geliştirilmiş Dashboard: http://localhost:${PORT}/advanced`);
  logger.info(`NPC Dashboard: http://localhost:${PORT}/npc`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  logger.info('Sunucu kapatılıyor...');
  if (botInstance) {
    await botInstance.stop();
  }
  await db.close();
  process.exit(0);
});

module.exports = { app, server, io };

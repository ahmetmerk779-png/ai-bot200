const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const config = require('./utils/config');
const BotCore = require('./bot/core');
const apiRouter = require('./web/api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'web/public')));

// API Routes
app.use('/api', apiRouter);

// Ana sayfayı sunma
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web/dashboard.html'));
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
        socket.emit('bot-started', { success: true });
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
        socket.emit('bot-stopped', { success: true });
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
});

module.exports = { app, server, io };

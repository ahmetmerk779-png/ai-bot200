require('dotenv').config();

const config = {
  // Bot Ayarları
  bot_username: process.env.BOT_USERNAME || 'AIBot',
  bot_password: process.env.BOT_PASSWORD || undefined,
  bot_email: process.env.BOT_EMAIL || undefined,

  // Minecraft Server
  mc_server: process.env.MC_SERVER || 'localhost',
  mc_port: parseInt(process.env.MC_PORT || '25565'),
  mc_version: process.env.MC_VERSION || '1.20.1',

  // AI API
  ai_provider: process.env.AI_PROVIDER || 'openai',
  openai_api_key: process.env.OPENAI_API_KEY || '',
  groq_api_key: process.env.GROQ_API_KEY || '',

  // Web Dashboard
  web_port: parseInt(process.env.WEB_PORT || '3000'),
  dashboard_secret: process.env.DASHBOARD_SECRET || 'secret-key',

  // Proxy
  proxy_type: process.env.PROXY_TYPE || 'velocity',
  proxy_server: process.env.PROXY_SERVER || 'proxy.example.com',
  proxy_port: parseInt(process.env.PROXY_PORT || '25577'),

  // Bot Davranışı
  auto_mine: process.env.AUTO_MINE === 'true',
  auto_farm: process.env.AUTO_FARM === 'true',
  auto_fish: process.env.AUTO_FISH === 'true',
  auto_fight: process.env.AUTO_FIGHT === 'true',
  survival_mode: process.env.SURVIVAL_MODE === 'true',
  map_exploration: process.env.MAP_EXPLORATION === 'true',

  // Logging
  log_level: process.env.LOG_LEVEL || 'info',
  log_file: process.env.LOG_FILE || 'logs/bot.log'
};

module.exports = config;

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.db = null;
    this.initialize();
  }

  initialize() {
    const dbPath = path.join(__dirname, '../../data/bot.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Database bağlantı hatası:', err);
      } else {
        logger.info('Database bağlantı başarılı');
        this.createTables();
      }
    });
  }

  createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
        username TEXT UNIQUE,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        money INTEGER DEFAULT 0,
        health INTEGER DEFAULT 20,
        hunger INTEGER DEFAULT 20,
        playtime INTEGER DEFAULT 0,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS npcs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        type TEXT,
        description TEXT,
        position_x REAL,
        position_y REAL,
        position_z REAL,
        behavior TEXT,
        dialogue_tree TEXT,
        personality TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        npc_id INTEGER,
        reputation INTEGER DEFAULT 0,
        interaction_count INTEGER DEFAULT 0,
        last_interaction TIMESTAMP,
        FOREIGN KEY(player_id) REFERENCES players(id),
        FOREIGN KEY(npc_id) REFERENCES npcs(id)
      )`,

      `CREATE TABLE IF NOT EXISTS quests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        giver_id INTEGER,
        title TEXT,
        description TEXT,
        reward_xp INTEGER,
        reward_money INTEGER,
        difficulty TEXT,
        objectives TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(giver_id) REFERENCES npcs(id)
      )`,

      `CREATE TABLE IF NOT EXISTS player_quests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        quest_id INTEGER,
        status TEXT,
        progress TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY(player_id) REFERENCES players(id),
        FOREIGN KEY(quest_id) REFERENCES quests(id)
      )`,

      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_player INTEGER,
        to_player INTEGER,
        amount INTEGER,
        transaction_type TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        description TEXT,
        icon TEXT,
        hidden INTEGER DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS player_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        achievement_id INTEGER,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(player_id) REFERENCES players(id),
        FOREIGN KEY(achievement_id) REFERENCES achievements(id)
      )`,

      `CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        item_name TEXT,
        quantity INTEGER,
        durability INTEGER,
        FOREIGN KEY(player_id) REFERENCES players(id)
      )`,

      `CREATE TABLE IF NOT EXISTS world_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chunk_x INTEGER,
        chunk_z INTEGER,
        data TEXT,
        last_loaded TIMESTAMP,
        UNIQUE(chunk_x, chunk_z)
      )`,

      `CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        action TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    tables.forEach(table => {
      this.db.run(table, (err) => {
        if (err) logger.error('Tablo oluşturma hatası:', err);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Oyuncu işlemleri
  async createPlayer(uuid, username) {
    return this.run(
      'INSERT INTO players (uuid, username) VALUES (?, ?)',
      [uuid, username]
    );
  }

  async getPlayer(username) {
    return this.get('SELECT * FROM players WHERE username = ?', [username]);
  }

  async updatePlayerStats(username, stats) {
    const updates = Object.keys(stats)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(stats), username];
    return this.run(
      `UPDATE players SET ${updates} WHERE username = ?`,
      values
    );
  }

  // NPC işlemleri
  async createNPC(name, type, description, behavior) {
    return this.run(
      'INSERT INTO npcs (name, type, description, behavior) VALUES (?, ?, ?, ?)',
      [name, type, description, behavior]
    );
  }

  async getNPC(name) {
    return this.get('SELECT * FROM npcs WHERE name = ?', [name]);
  }

  async getAllNPCs() {
    return this.all('SELECT * FROM npcs');
  }

  // İlişki işlemleri
  async setRelationship(playerId, npcId, reputation) {
    const existing = await this.get(
      'SELECT * FROM relationships WHERE player_id = ? AND npc_id = ?',
      [playerId, npcId]
    );

    if (existing) {
      return this.run(
        'UPDATE relationships SET reputation = ?, interaction_count = interaction_count + 1, last_interaction = CURRENT_TIMESTAMP WHERE player_id = ? AND npc_id = ?',
        [reputation, playerId, npcId]
      );
    } else {
      return this.run(
        'INSERT INTO relationships (player_id, npc_id, reputation, interaction_count, last_interaction) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
        [playerId, npcId, reputation]
      );
    }
  }

  async getRelationship(playerId, npcId) {
    return this.get(
      'SELECT * FROM relationships WHERE player_id = ? AND npc_id = ?',
      [playerId, npcId]
    );
  }

  // Görev işlemleri
  async createQuest(giverId, title, description, rewardXp, rewardMoney, difficulty) {
    return this.run(
      'INSERT INTO quests (giver_id, title, description, reward_xp, reward_money, difficulty) VALUES (?, ?, ?, ?, ?, ?)',
      [giverId, title, description, rewardXp, rewardMoney, difficulty]
    );
  }

  async getQuests(giverId) {
    return this.all('SELECT * FROM quests WHERE giver_id = ?', [giverId]);
  }

  async addPlayerQuest(playerId, questId) {
    return this.run(
      'INSERT INTO player_quests (player_id, quest_id, status, started_at) VALUES (?, ?, "in_progress", CURRENT_TIMESTAMP)',
      [playerId, questId]
    );
  }

  async completeQuest(playerId, questId) {
    return this.run(
      'UPDATE player_quests SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE player_id = ? AND quest_id = ?',
      [playerId, questId]
    );
  }

  // Para işlemleri
  async addMoney(playerId, amount, description) {
    await this.run(
      'UPDATE players SET money = money + ? WHERE id = ?',
      [amount, playerId]
    );
    return this.run(
      'INSERT INTO transactions (from_player, amount, transaction_type, description) VALUES (?, ?, "income", ?)',
      [playerId, amount, description]
    );
  }

  async removeMoney(playerId, amount, description) {
    await this.run(
      'UPDATE players SET money = money - ? WHERE id = ?',
      [amount, playerId]
    );
    return this.run(
      'INSERT INTO transactions (to_player, amount, transaction_type, description) VALUES (?, ?, "expense", ?)',
      [playerId, amount, description]
    );
  }

  // Başarı işlemleri
  async unlockAchievement(playerId, achievementId) {
    return this.run(
      'INSERT OR IGNORE INTO player_achievements (player_id, achievement_id) VALUES (?, ?)',
      [playerId, achievementId]
    );
  }

  async getAchievements(playerId) {
    return this.all(
      'SELECT a.* FROM achievements a JOIN player_achievements pa ON a.id = pa.achievement_id WHERE pa.player_id = ?',
      [playerId]
    );
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;

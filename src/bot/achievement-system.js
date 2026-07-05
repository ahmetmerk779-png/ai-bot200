const logger = require('../utils/logger');

class AchievementSystem {
  constructor(db) {
    this.db = db;
    this.achievements = this.defineAchievements();
  }

  defineAchievements() {
    return [
      {
        id: 1,
        name: 'İlk Adım',
        description: 'Botu ilk kez başlat',
        icon: '🚀',
        hidden: false,
        condition: (player) => player.playtime > 60
      },
      {
        id: 2,
        name: 'Madenci',
        description: '100 blok çıkar',
        icon: '⛏️',
        hidden: false,
        condition: (player) => player.blocks_mined > 100
      },
      {
        id: 3,
        name: 'Çiftçi',
        description: '50 tarım ürünü topla',
        icon: '🌾',
        hidden: false,
        condition: (player) => player.crops_harvested > 50
      },
      {
        id: 4,
        name: 'Balıkçı',
        description: '10 balık tut',
        icon: '🎣',
        hidden: false,
        condition: (player) => player.fish_caught > 10
      },
      {
        id: 5,
        name: 'Savaşçı',
        description: '20 canavar öldür',
        icon: '⚔️',
        hidden: false,
        condition: (player) => player.mobs_killed > 20
      },
      {
        id: 6,
        name: 'Gezgin',
        description: '1000 blok yürü',
        icon: '🧭',
        hidden: false,
        condition: (player) => player.distance_traveled > 1000
      },
      {
        id: 7,
        name: 'Ticari Başarı',
        description: '1000 altın kazan',
        icon: '💰',
        hidden: false,
        condition: (player) => player.money > 1000
      },
      {
        id: 8,
        name: 'Görev Tamamlayıcı',
        description: '10 görev tamamla',
        icon: '📋',
        hidden: false,
        condition: (player) => player.quests_completed > 10
      },
      {
        id: 9,
        name: 'NPC Dostluğu',
        description: '5 NPC ile iyi ilişki kur',
        icon: '👥',
        hidden: false,
        condition: (player) => player.high_reputation_npcs > 5
      },
      {
        id: 10,
        name: 'Kurucusu',
        description: 'İlk yapıyı inşa et',
        icon: '🏗️',
        hidden: false,
        condition: (player) => player.buildings_built > 0
      },
      {
        id: 11,
        name: 'Çok Hızlı',
        description: '5 saniyede bir görev tamamla',
        icon: '⚡',
        hidden: true,
        condition: (player) => player.fastest_quest_time < 5
      },
      {
        id: 12,
        name: 'Dünya Keşfçi',
        description: '100 chunk keşfet',
        icon: '🗺️',
        hidden: false,
        condition: (player) => player.chunks_explored > 100
      }
    ];
  }

  async unlockAchievements(playerId, playerStats) {
    const unlockedAchievements = [];

    for (const achievement of this.achievements) {
      try {
        if (achievement.condition(playerStats)) {
          await this.db.unlockAchievement(playerId, achievement.id);
          unlockedAchievements.push(achievement);
          logger.info(`🏆 Başarı açıldı: ${achievement.name}`);
        }
      } catch (error) {
        logger.error('Başarı açma hatası:', error);
      }
    }

    return unlockedAchievements;
  }

  async getPlayerAchievements(playerId) {
    return this.db.getAchievements(playerId);
  }

  getAchievementStats(achievements) {
    const stats = {
      total: this.achievements.length,
      unlocked: achievements.length,
      hidden: this.achievements.filter(a => a.hidden).length,
      percentage: Math.round((achievements.length / this.achievements.length) * 100)
    };
    return stats;
  }
}

module.exports = AchievementSystem;

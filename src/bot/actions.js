const logger = require('../utils/logger');

class Actions {
  constructor(bot) {
    this.bot = bot;
    this.isMining = false;
    this.isFarming = false;
    this.isFishing = false;
    this.isExploring = false;
  }

  async mineBlock(blockName = 'stone') {
    this.isMining = true;
    try {
      while (this.isMining) {
        const blocks = this.bot.findBlocks({
          matching: (block) => block.name.includes(blockName),
          count: 1,
          maxDistance: 32
        });

        if (blocks.length === 0) {
          logger.warn(`${blockName} bulunamadı`);
          break;
        }

        const blockPos = blocks[0];
        const block = this.bot.blockAt(blockPos);
        
        if (block) {
          await this.bot.dig(block);
          await this.sleep(500);
        }
      }
    } catch (error) {
      logger.error('Mining hatası:', error);
    }
    this.isMining = false;
  }

  async farmCrops(cropType = 'wheat') {
    this.isFarming = true;
    try {
      while (this.isFarming) {
        const crops = this.bot.findBlocks({
          matching: (block) => block.name.includes(cropType),
          count: 10,
          maxDistance: 32
        });

        if (crops.length === 0) break;

        for (const cropPos of crops) {
          const block = this.bot.blockAt(cropPos);
          if (block) {
            await this.bot.dig(block);
            await this.sleep(300);
          }
        }
        
        await this.sleep(5000);
      }
    } catch (error) {
      logger.error('Farm hatası:', error);
    }
    this.isFarming = false;
  }

  async fish() {
    this.isFishing = true;
    try {
      // Balık tutma simülasyonu
      const rods = this.bot.inventory.slots.filter(s => s && s.name === 'fishing_rod');
      
      if (rods.length === 0) {
        logger.warn('Olta bulunamadı');
        return;
      }

      await this.bot.equip(rods[0], 'hand');
      
      while (this.isFishing) {
        await this.sleep(30000); // 30 saniyede bir kontrol
      }
    } catch (error) {
      logger.error('Balıkçılık hatası:', error);
    }
    this.isFishing = false;
  }

  async combat() {
    try {
      const enemies = this.bot.nearestEntity((entity) => {
        return entity.type === 'mob' && entity.mobType !== 'armor_stand';
      });

      if (!enemies) {
        logger.info('Düşman bulunamadı');
        return;
      }

      const weapon = this.bot.inventory.slots.find(s => s && s.name === 'diamond_sword');
      if (weapon) {
        await this.bot.equip(weapon, 'hand');
      }

      // Savaş AI
      while (enemies && this.bot.health > 5) {
        await this.bot.attack(enemies);
        await this.sleep(500);
      }
    } catch (error) {
      logger.error('Savaş hatası:', error);
    }
  }

  async explore() {
    this.isExploring = true;
    try {
      const range = 100;
      
      while (this.isExploring) {
        const randomX = this.bot.entity.position.x + (Math.random() - 0.5) * range;
        const randomZ = this.bot.entity.position.z + (Math.random() - 0.5) * range;
        
        await this.bot.pathfinder.goto(new (require('vec3'))(randomX, this.bot.entity.position.y, randomZ));
        await this.sleep(5000);
      }
    } catch (error) {
      logger.error('Keşif hatası:', error);
    }
    this.isExploring = false;
  }

  async eat() {
    try {
      const food = this.bot.inventory.slots.find(s => 
        s && (s.name.includes('bread') || s.name.includes('apple') || s.name.includes('meat'))
      );

      if (food) {
        await this.bot.equip(food, 'hand');
        await this.bot.consume();
      }
    } catch (error) {
      logger.error('Yeme hatası:', error);
    }
  }

  async drinkPotion() {
    try {
      const potion = this.bot.inventory.slots.find(s => s && s.name.includes('potion'));
      
      if (potion) {
        await this.bot.equip(potion, 'hand');
        await this.bot.consume();
      }
    } catch (error) {
      logger.error('İksir hatası:', error);
    }
  }

  stopMining() { this.isMining = false; }
  stopFarming() { this.isFarming = false; }
  stopFishing() { this.isFishing = false; }
  stopExploring() { this.isExploring = false; }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Actions;

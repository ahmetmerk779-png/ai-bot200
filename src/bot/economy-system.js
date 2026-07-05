const logger = require('../utils/logger');
const Database = require('../database/db');

class EconomySystem {
  constructor(db) {
    this.db = db;
    this.marketPrices = new Map();
    this.playerMoney = new Map();
    this.initializeMarket();
  }

  initializeMarket() {
    const items = [
      { name: 'Elmas', basePrice: 100 },
      { name: 'Altın', basePrice: 50 },
      { name: 'Demir', basePrice: 25 },
      { name: 'Bakır', basePrice: 15 },
      { name: 'Kömür', basePrice: 5 },
      { name: 'Buğday', basePrice: 2 },
      { name: 'Et', basePrice: 3 },
      { name: 'Yazı', basePrice: 10 }
    ];

    items.forEach(item => {
      this.marketPrices.set(item.name, {
        basePrice: item.basePrice,
        currentPrice: item.basePrice,
        supply: 100,
        demand: 50,
        history: []
      });
    });
  }

  async getPlayerBalance(playerId) {
    const player = await this.db.get('SELECT money FROM players WHERE id = ?', [playerId]);
    return player ? player.money : 0;
  }

  async transferMoney(fromId, toId, amount, description) {
    try {
      const fromPlayer = await this.db.get('SELECT money FROM players WHERE id = ?', [fromId]);
      if (!fromPlayer || fromPlayer.money < amount) {
        return { success: false, message: 'Yetersiz bakiye' };
      }

      await this.db.removeMoney(fromId, amount, description);
      await this.db.addMoney(toId, amount, description);

      return { success: true, message: 'Para transferi başarılı' };
    } catch (error) {
      logger.error('Para transferi hatası:', error);
      return { success: false, message: 'Transfer hatası' };
    }
  }

  buyItem(playerMoney, itemName, quantity) {
    const price = this.marketPrices.get(itemName);
    if (!price) return { success: false, message: 'Ürün bulunamadı' };

    const totalCost = price.currentPrice * quantity;
    if (playerMoney < totalCost) {
      return { success: false, message: 'Yetersiz bakiye' };
    }

    // Arz-talep güncellemesi
    this.updateSupplyDemand(itemName, quantity);

    return {
      success: true,
      cost: totalCost,
      itemName,
      quantity
    };
  }

  sellItem(itemName, quantity) {
    const price = this.marketPrices.get(itemName);
    if (!price) return { success: false, message: 'Ürün bulunamadı' };

    const totalEarnings = price.currentPrice * quantity;
    
    // Arz-talep güncellemesi
    this.updateSupplyDemand(itemName, -quantity);

    return {
      success: true,
      earnings: totalEarnings,
      itemName,
      quantity
    };
  }

  updateSupplyDemand(itemName, quantityChange) {
    const item = this.marketPrices.get(itemName);
    if (!item) return;

    item.supply -= quantityChange;
    item.demand += quantityChange;

    // Fiyat güncellemesi (basit arz-talep modeli)
    const ratio = item.supply / item.demand;
    item.currentPrice = Math.round(item.basePrice * ratio);
    item.currentPrice = Math.max(1, item.currentPrice); // Minimum fiyat

    item.history.push({
      price: item.currentPrice,
      timestamp: Date.now()
    });
  }

  getMarketData() {
    const data = {};
    this.marketPrices.forEach((value, key) => {
      data[key] = {
        price: value.currentPrice,
        basePrice: value.basePrice,
        supply: value.supply,
        demand: value.demand
      };
    });
    return data;
  }

  getPriceHistory(itemName, hours = 24) {
    const item = this.marketPrices.get(itemName);
    if (!item) return [];

    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return item.history.filter(h => h.timestamp > cutoff);
  }

  getBankBalance(playerId) {
    return this.playerMoney.get(playerId) || 0;
  }

  depositMoney(playerId, amount) {
    const current = this.getBankBalance(playerId);
    this.playerMoney.set(playerId, current + amount);
    return current + amount;
  }

  withdrawMoney(playerId, amount) {
    const current = this.getBankBalance(playerId);
    if (current < amount) return null;
    this.playerMoney.set(playerId, current - amount);
    return current - amount;
  }
}

module.exports = EconomySystem;

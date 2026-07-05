const logger = require('../utils/logger');

class WorldSystem {
  constructor(bot) {
    this.bot = bot;
    this.chunks = new Map();
    this.biomes = new Map();
    this.explored = new Set();
    this.worldBounds = {
      minX: -30000000,
      maxX: 30000000,
      minZ: -30000000,
      maxZ: 30000000
    };
  }

  loadChunk(x, z) {
    const key = `${x},${z}`;
    if (!this.chunks.has(key)) {
      this.chunks.set(key, {
        x, z,
        blocks: new Uint8Array(65536),
        entities: [],
        loadedAt: Date.now()
      });
    }
    return this.chunks.get(key);
  }

  unloadChunk(x, z) {
    const key = `${x},${z}`;
    this.chunks.delete(key);
  }

  setBiome(x, z, biome) {
    const key = `${x},${z}`;
    this.biomes.set(key, biome);
  }

  getBiome(x, z) {
    const key = `${x},${z}`;
    return this.biomes.get(key) || 'plains';
  }

  markExplored(x, z) {
    this.explored.add(`${x},${z}`);
  }

  isExplored(x, z) {
    return this.explored.has(`${x},${z}`);
  }

  getExplorationProgress() {
    return {
      explored: this.explored.size,
      total: this.chunks.size
    };
  }

  getChunkData(x, z) {
    return this.loadChunk(x, z);
  }

  saveChunk(x, z, data) {
    const chunk = this.loadChunk(x, z);
    chunk.blocks = data;
    chunk.savedAt = Date.now();
  }

  getNearbyStructures(x, z, radius = 100) {
    const structures = [];
    for (let i = -radius; i < radius; i++) {
      for (let j = -radius; j < radius; j++) {
        if (this.isExplored(x + i, z + j)) {
          structures.push({ x: x + i, z: z + j });
        }
      }
    }
    return structures;
  }

  getWorldStats() {
    return {
      loadedChunks: this.chunks.size,
      exploredChunks: this.explored.size,
      biomeDiversity: this.biomes.size,
      memoryUsage: this.chunks.size * 65536 / 1024 / 1024 // MB
    };
  }
}

module.exports = WorldSystem;

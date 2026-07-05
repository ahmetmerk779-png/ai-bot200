const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class TaskManager {
  constructor() {
    this.tasks = [];
  }

  addTask(description) {
    const task = {
      id: uuidv4(),
      description,
      status: 'pending',
      createdAt: new Date(),
      completedAt: null
    };

    this.tasks.push(task);
    logger.info(`Görev eklendi: ${description}`);
    return task;
  }

  completeTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date();
      logger.info(`Görev tamamlandı: ${task.description}`);
    }
    return task;
  }

  removeTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }

  getTasks() {
    return this.tasks;
  }

  getPendingTasks() {
    return this.tasks.filter(t => t.status === 'pending');
  }
}

module.exports = TaskManager;

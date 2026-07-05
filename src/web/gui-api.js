const express = require('express');
const router = express.Router();

// ChatCraft UI route
router.get('/chatcraft', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'chatcraft-ui.html'));
});

// GUI Kontrol
router.post('/gui/open', (req, res) => {
  try {
    const { type } = req.body;
    const bot = global.botInstance;

    if (!bot || !bot.inGameGUI) {
      return res.status(400).json({ error: 'Bot running required' });
    }

    switch (type) {
      case 'main':
        bot.inGameGUI.openMainMenu();
        break;
      case 'mining':
        bot.inGameGUI.openMiningMenu();
        break;
      case 'farming':
        bot.inGameGUI.openFarmingMenu();
        break;
      case 'chat':
        bot.inGameGUI.openChatMenu();
        break;
      case 'npc':
        bot.inGameGUI.openNPCMenu(bot.npcInteraction?.getNearbyNPCs() || []);
        break;
      case 'quests':
        bot.inGameGUI.openQuestMenu(bot.taskManager?.getPendingTasks() || []);
        break;
      case 'economy':
        bot.inGameGUI.openEconomyMenu(0);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/gui/select', (req, res) => {
  try {
    const { optionId } = req.body;
    const bot = global.botInstance;

    if (!bot || !bot.inGameGUI) {
      return res.status(400).json({ error: 'Bot running required' });
    }

    bot.inGameGUI.handleSelection(null, optionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

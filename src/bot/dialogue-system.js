const logger = require('../utils/logger');

class DialogueSystem {
  constructor(db) {
    this.db = db;
    this.dialogueTrees = this.createDialogueTrees();
    this.playerStates = new Map();
  }

  createDialogueTrees() {
    return {
      merchant: {
        greeting: 'Merhaba! Size nasıl yardımcı olabilirim?',
        options: [
          {
            id: 'buy',
            text: 'Satın Al',
            response: 'Ne almak istiyorsunuz?',
            nextNode: 'shopping'
          },
          {
            id: 'sell',
            text: 'Sat',
            response: 'Ne satmak istiyorsunuz?',
            nextNode: 'selling'
          },
          {
            id: 'info',
            text: 'Bilgi',
            response: 'Mağazam 5 yıldır faaliyet gösteriyor.',
            nextNode: 'greeting'
          },
          {
            id: 'goodbye',
            text: 'Hoşça kalın',
            response: 'Tekrar görüşmek üzere!',
            end: true
          }
        ]
      },
      questGiver: {
        greeting: 'Bana yardım eder misin?',
        options: [
          {
            id: 'accept',
            text: 'Görev Kabul Et',
            response: 'Harika! İşte senin görevin...',
            nextNode: 'questDetails'
          },
          {
            id: 'decline',
            text: 'Şimdi Değil',
            response: 'Tamam, sonra geliş.',
            nextNode: 'greeting'
          },
          {
            id: 'complete',
            text: 'Görev Tamamladım',
            response: 'Başarılı mısın? Ödülü al!',
            reward: true,
            end: true
          },
          {
            id: 'goodbye',
            text: 'Hoşça kalın',
            response: 'Hoşça kal!',
            end: true
          }
        ]
      },
      guard: {
        greeting: 'Bu alanı koruyorum. İşin var mı?',
        options: [
          {
            id: 'pass',
            text: 'Geçebilir miyim?',
            response: 'Tamam, ama dikkat et.',
            nextNode: 'greeting'
          },
          {
            id: 'quest',
            text: 'Görev Var mı?',
            response: 'Evet, canavar avı görev',
            nextNode: 'questDetails'
          },
          {
            id: 'goodbye',
            text: 'Hoşça kalın',
            response: 'Güvenli ol!',
            end: true
          }
        ]
      },
      npc_generic: {
        greeting: 'Merhaba! Nasılsın?',
        options: [
          {
            id: 'talk',
            text: 'Konu Konuş',
            response: 'Bugün güzel bir gün!',
            nextNode: 'greeting'
          },
          {
            id: 'goodbye',
            text: 'Hoşça kalın',
            response: 'Tekrar görüşmek üzere!',
            end: true
          }
        ]
      }
    };
  }

  getDialogue(npcType) {
    return this.dialogueTrees[npcType] || this.dialogueTrees['npc_generic'];
  }

  async processDialogue(playerId, npcId, choiceId) {
    try {
      const playerState = this.playerStates.get(playerId) || { currentNode: 'greeting' };
      const npc = await this.db.getNPC(npcId);
      const dialogue = this.getDialogue(npc.type);

      let currentNode = dialogue[playerState.currentNode] || dialogue.greeting;
      const selectedOption = currentNode.options.find(opt => opt.id === choiceId);

      if (!selectedOption) return { error: 'Geçersiz seçim' };

      const response = {
        npcResponse: selectedOption.response,
        playerChoice: selectedOption.text,
        nextOptions: selectedOption.end ? null : dialogue[selectedOption.nextNode].options
      };

      if (selectedOption.reward) {
        response.reward = true;
      }

      // Oyuncu durumunu güncelle
      if (!selectedOption.end) {
        playerState.currentNode = selectedOption.nextNode;
        this.playerStates.set(playerId, playerState);
      } else {
        this.playerStates.delete(playerId);
      }

      return response;
    } catch (error) {
      logger.error('Diyalog işleme hatası:', error);
      return { error: 'Diyalog hatası' };
    }
  }

  getGreeting(npcType) {
    const dialogue = this.getDialogue(npcType);
    return {
      greeting: dialogue.greeting,
      options: dialogue.options
    };
  }
}

module.exports = DialogueSystem;

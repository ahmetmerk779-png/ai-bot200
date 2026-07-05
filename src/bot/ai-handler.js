const logger = require('../utils/logger');

class AIHandler {
  constructor(settings) {
    this.settings = settings;
    this.provider = settings.ai_provider || 'openai';
    this.conversationHistory = [];
    this.initializeClient();
  }

  initializeClient() {
    try {
      if (this.provider === 'openai') {
        const { OpenAI } = require('openai');
        this.client = new OpenAI({
          apiKey: this.settings.openai_api_key
        });
      } else if (this.provider === 'groq') {
        const Groq = require('groq-sdk');
        this.client = new Groq({
          apiKey: this.settings.groq_api_key
        });
      } else {
        logger.warn('AI provider belirtilmedi, çevrimdışı mod');
      }
    } catch (error) {
      logger.error('AI client başlatma hatası:', error);
    }
  }

  async chat(userMessage) {
    try {
      if (!this.client) {
        return this.getOfflineResponse(userMessage);
      }

      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Konuşma geçmişini sınırla
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      const response = await this.client.chat.completions.create({
        model: this.provider === 'openai' ? 'gpt-3.5-turbo' : 'mixtral-8x7b-32768',
        messages: this.conversationHistory,
        max_tokens: 100,
        temperature: 0.7
      });

      const assistantMessage = response.choices[0].message.content;
      
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return assistantMessage;
    } catch (error) {
      logger.error('AI sohbet hatası:', error);
      return this.getOfflineResponse(userMessage);
    }
  }

  getOfflineResponse(userMessage) {
    const responses = {
      'merhaba': 'Merhaba! Ben bir Minecraft AI botuyum.',
      'kim': 'Ben AIBot200, yardımcı olmaya hazırım!',
      'ne yap': 'Madencilik, tarım, balıkçılık yapabilirim!',
      'hayır': 'Tamam, başka nasıl yardımcı olabilirim?',
      'evet': 'Harika! Hemen başlıyorum.',
    };

    const msg = userMessage.toLowerCase();
    for (const [key, value] of Object.entries(responses)) {
      if (msg.includes(key)) {
        return value;
      }
    }

    return 'Anlamadım, tekrar söyler misin?';
  }

  async analyzeTask(taskDescription) {
    try {
      if (!this.client) return null;

      const response = await this.client.chat.completions.create({
        model: this.provider === 'openai' ? 'gpt-3.5-turbo' : 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'Sen bir Minecraft görev analisti sın. Verilen görevi analiz et ve hangi eylemleri alması gerektiğini söyle. Cevabını JSON formatında ver: {"actions": ["action1", "action2"]}'
          },
          {
            role: 'user',
            content: taskDescription
          }
        ]
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error('Görev analiz hatası:', error);
      return null;
    }
  }
}

module.exports = AIHandler;

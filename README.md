# AI-Bot200 - Minecraft AI Bot

Mineflayer + Baritone + ChatGPT kombinasyonunda geliştirilmiş, tüm proxy sunuculara uyumlu, web dashboard'lu Minecraft AI botu.

## 🎯 Özellikler

- ✅ **Yapay Zeka Sohbeti** - ChatGPT/Groq ile akıllı konuşma
- ✅ **Otomatik Madencilik** - Mineralleri otomatik olarak çıkarma
- ✅ **Yapı İnşaatı** - AI tarafından tasarlanan yapılar
- ✅ **Envanter Yönetimi** - Eşyaları akıllıca organize etme
- ✅ **Harita Keşfi** - Dünyayı otomatik olarak keşfetme
- ✅ **Savaşma** - Düşmanlara otomatik savaş
- ✅ **Farm Yönetimi** - Ürün toplama ve ekim
- ✅ **Balıkçılık** - Otomatik balık tutma
- ✅ **Görev Tamamlama** - Kullanıcı komutlarını yerine getirme
- ✅ **Hayatta Kalma** - Otomatik beslenme ve iyileştirme
- ✅ **Proxy Uyumu** - Velocity, BungeeCord, Waterfall
- ✅ **Web Dashboard** - Uzaktan kontrol ve izleme

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- OpenAI API Key (veya Groq)
- Minecraft Server

### Adımlar

```bash
# Repository'yi klonla
git clone https://github.com/ahmetmerk779-png/ai-bot200.git
cd ai-bot200

# Bağımlılıkları yükle
npm install

# .env dosyasını düzenle
cp .env.example .env
# Editörde .env dosyasını açarak API key ve sunucu bilgilerini gir

# Botu çalıştır
npm start

# Web Dashboard'a erişim
# http://localhost:3000
```

## 📋 Konfigürasyon

`.env` dosyasında şu ayarları yapın:

```env
BOT_USERNAME=AIBot
MC_SERVER=localhost
MC_PORT=25565
OPENAI_API_KEY=sk-...
WEB_PORT=3000
```

## 🎮 Komutlar

### Sohbet
```
/ask [soru] - AI'ya soru sor
/chat [mesaj] - Sohbet et
```

### Madencilik
```
/mine [blok] - Belirtilen bloğu çıkar
/mine auto - Otomatik madencilik
/mine stop - Madenciliği durdur
```

### Farm
```
/farm [ürün] - Belirtilen ürünü yönet
/farm auto - Otomatik farm
```

### Balıkçılık
```
/fish - Balık tutmaya başla
/fish stop - Balıkçılığı durdur
```

### Savaş
```
/fight - Savaşmaya başla
/fight stop - Savaşı durdur
```

### Harita
```
/explore - Haritayı keşfet
/explore stop - Keşfi durdur
```

### Görevler
```
/task [görev] - Yeni görev ekle
/tasks - Görevleri listele
/task complete [id] - Görevi tamamla
```

### Sistem
```
/status - Bot durumunu göster
/inventory - Envanteri göster
/health - Sağlık ve açlık
/stop - Botu durdur
```

## 🌐 Web Dashboard

http://localhost:3000 adresinde web arayüzüne erişebilirsiniz.

**Özellikler:**
- Real-time bot durumu
- Envanter görüntüleme
- Görev yönetimi
- Komut gönderme
- Sohbet arayüzü
- Harita görüntüleme
- Log izleme

## 🔧 API Endpoints

```
GET  /api/status          - Bot durumu
GET  /api/inventory       - Envanter
GET  /api/health          - Sağlık bilgisi
GET  /api/tasks           - Görevler
POST /api/command         - Komut gönder
POST /api/chat            - Sohbet
GET  /api/map             - Harita
GET  /api/logs            - Loglar
```

## 🚀 Render Deployment

1. GitHub'a push et
2. Render.com'da yeni web servisi oluştur
3. Repository'yi bağla
4. Environment variables'ı ayarla
5. Deploy et

## 📁 Proje Yapısı

```
ai-bot200/
├── src/
│   ├── bot/
│   │   ├── core.js           - Bot ana motoru
│   │   ├── ai-handler.js     - AI entegrasyonu
│   │   ├── actions.js        - Bot aksiyonları
│   │   └── tasks.js          - Görev sistemi
│   ├── web/
│   │   ├── server.js         - Express sunucusu
│   │   ├── api.js            - API endpoints
│   │   └── dashboard.html    - Web arayüzü
│   ├── proxy/
│   │   ├── handler.js        - Proxy yönetimi
│   │   └── adapters.js       - Proxy adaptörleri
│   └── utils/
│       ├── logger.js         - Logging
│       └── config.js         - Konfigürasyon
├── config/
│   └── settings.json
├── logs/
├── .env.example
├── .gitignore
├── package.json
├── render.yaml
└── README.md
```

## 📝 Lisans

MIT License - Detaylar için LICENSE dosyasına bakın

## 👤 Geliştirici

**ahmetmerk779-png**

## 🤝 Katkıda Bulunma

Pull request'ler açıktır. Büyük değişiklikler için önce bir issue açın.

## ⚠️ Dikkat

- Sunucu sahibinin izni olmadan bot kullanmayın
- Minecraft EULA'sına uygun davranın
- API key'lerinizi asla paylaşmayın

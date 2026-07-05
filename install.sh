#!/bin/bash

# AI-Bot200 kurulum ve başlatma scripti

echo "🤖 AI-Bot200 Yükleniyor..."

# Klasörleri oluştur
mkdir -p data
mkdir -p logs
mkdir -p config

# .env dosyasını kontrol et
if [ ! -f .env ]; then
    echo "⚠️ .env dosyası bulunamadı!"
    echo "📋 .env.example dosyasından .env oluşturuluyor..."
    cp .env.example .env
    echo "✅ .env dosyası oluşturuldu. Lütfen API key'inizi ekleyin!"
    exit 1
fi

echo "📦 Bağımlılıklar yükleniyor..."
npm install

echo "✅ Kurulum tamamlandı!"
echo ""
echo "🚀 Botu başlatmak için:"
echo "   npm start"
echo ""
echo "📊 Dashboards:"
echo "   Genel: http://localhost:3000"
echo "   Geliştirilmiş: http://localhost:3000/advanced"
echo "   NPC: http://localhost:3000/npc"

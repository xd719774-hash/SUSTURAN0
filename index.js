const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot aktif ve çalışıyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

// --- AYARLAR ---
const token = process.env.TOKEN;
// Render Environment Variables kısmına virgülle ayırarak birden fazla kanal ID yazabilirsin örn: ID1,ID2,ID3
const channelsEnv = process.env.CHANNELS || "";
const channels = channelsEnv.split(',').map(id => id.trim()).filter(Boolean);

let channelIndex = 0;
let messageIndex = 0;

// Mesajları dosyadan oku
function getMessages() {
  try {
    const filePath = path.join(__dirname, 'mesajlar.txt');
    const data = fs.readFileSync(filePath, 'utf8');
    // Satır satır ayır, boş satırları ve başındaki/sonundaki boşlukları temizle
    return data.split('\n').map(m => m.trim()).filter(Boolean);
  } catch (err) {
    console.error("HATA: mesajlar.txt okunamadı!", err.message);
    return [];
  }
}

if (!token || channels.length === 0) {
  console.error("HATA: TOKEN veya CHANNELS (Kanal ID'leri) eksik!");
} else {
  // 3 saniyede bir çalıştır (3000 milisaniye)
  setInterval(handleCycle, 3000);
}

async function handleCycle() {
  const messages = getMessages();
  if (messages.length === 0) {
    console.error("HATA: Gönderilecek mesaj bulunamadı (mesajlar.txt boş).");
    return;
  }

  const currentChannelId = channels[channelIndex];
  const currentMessage = messages[messageIndex];

  try {
    // 1. "Yazıyor..." animasyonu gönder
    await axios.post(`https://discord.com/api/v9/channels/${currentChannelId}/typing`, {}, {
      headers: { "Authorization": token }
    });

    // 2. Kısa bir gecikme (1 saniye) sonra mesajı gönder
    setTimeout(() => {
      sendActualMessage(currentChannelId, currentMessage, messages.length);
    }, 1000);

  } catch (err) {
    console.error(`❌ Typing hatası (${currentChannelId}):`, err.response?.status || err.message);
    // Hata olsa bile sırayı kaydır ki takılmasın
    channelIndex = (channelIndex + 1) % channels.length;
  }
}

function sendActualMessage(channelId, messageContent, totalMessages) {
  axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
    content: messageContent
  }, {
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    }
  }).then(() => {
    console.log(`✅ Gönderildi -> Kanal: ${channelId} | Mesaj: "${messageContent}"`);
    
    // Sıradaki kanal ve mesaja geç (ikisi de bağımsız veya sırayla döner)
    channelIndex = (channelIndex + 1) % channels.length;
    messageIndex = (messageIndex + 1) % totalMessages;
  }).catch((err) => {
    console.error(`❌ Mesaj Hatası (${channelId}):`, err.response?.status || err.message);
    channelIndex = (channelIndex + 1) % channels.length;
    messageIndex = (messageIndex + 1) % totalMessages;
  });
}

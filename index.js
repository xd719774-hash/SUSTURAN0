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
const channelsEnv = process.env.CHANNELS || "";
const channels = channelsEnv.split(',').map(id => id.trim()).filter(Boolean);

let channelIndex = 0;
let messageIndex = 0;

function getMessages() {
  try {
    const filePath = path.join(__dirname, 'mesajlar.txt');
    const data = fs.readFileSync(filePath, 'utf8');
    return data.split('\n').map(m => m.trim()).filter(Boolean);
  } catch (err) {
    console.error("HATA: mesajlar.txt okunamadı!", err.message);
    return [];
  }
}

if (!token || channels.length === 0) {
  console.error("HATA: TOKEN veya CHANNELS eksik!");
} else {
  // 3 saniyede bir doğrudan mesaj gönderimini başlat
  setInterval(handleCycle, 3000);
}

function handleCycle() {
  const messages = getMessages();
  if (messages.length === 0) {
    console.error("HATA: Gönderilecek mesaj bulunamadı (mesajlar.txt boş).");
    return;
  }

  const currentChannelId = channels[channelIndex];
  const currentMessage = messages[messageIndex];

  // Self-token kullanıldığı için 'Bot ' öneki EKlenmez, doğrudan token yazılır.
  // Yazıyor isteği tamamen kaldırıldı, doğrudan mesaj atılıyor.
  axios.post(`https://discord.com/api/v9/channels/${currentChannelId}/messages`, {
    content: currentMessage
  }, {
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    }
  }).then(() => {
    console.log(`✅ Gönderildi -> Kanal: ${currentChannelId} | Mesaj: "${currentMessage}"`);
    
    channelIndex = (channelIndex + 1) % channels.length;
    messageIndex = (messageIndex + 1) % messages.length;
  }).catch((err) => {
    console.error(`❌ Mesaj Hatası (${currentChannelId}):`, err.response?.status || err.message);
    channelIndex = (channelIndex + 1) % channels.length;
    messageIndex = (messageIndex + 1) % messages.length;
  });
}

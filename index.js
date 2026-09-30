const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot yazma özelliğiyle aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

// --- AYARLAR ---
const token = process.env.TOKEN;
const message = process.env.MESSAGE;
const channels = [
  "1490372219912716351",
  "1490372219912716351",
  "1490372219912716351"
];

let currentIndex = 0;

if (!token || !message) {
    console.error("HATA: TOKEN veya MESSAGE eksik!");
} else {
    // Döngüyü başlat
    setInterval(handleCycle, 5000);
}

async function handleCycle() {
  const currentChannelId = channels[currentIndex];

  try {
    // 1. Önce "Yazıyor..." animasyonunu gönder
    await axios.post(`https://discord.com/api/v9/channels/${currentChannelId}/typing`, {}, {
      headers: { "Authorization": token }
    });

    // 2. Kısa bir gecikme (Gerçekçi görünmesi için 1.5 saniye bekle ve mesajı at)
    setTimeout(() => {
      sendActualMessage(currentChannelId);
    }, 1500);

  } catch (err) {
    console.error(`❌ Typing hatası (${currentChannelId}):`, err.response?.status);
    // Hata olsa bile sırayı kaydır ki takılmasın
    currentIndex = (currentIndex + 1) % channels.length;
  }
}

function sendActualMessage(channelId) {
  // Mesajı olduğu gibi gönder (büyük/küçük harf dönüşümü yok)
  const formattedMessage = message;
  
  axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
    content: formattedMessage
  }, {
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    }
  }).then(() => {
    console.log(`✅ Mesaj Gönderildi: ${channelId} - İçerik: "${formattedMessage}"`);
    
    // Mesaj başarılıysa bir sonraki kanala geç
    currentIndex = (currentIndex + 1) % channels.length;
  }).catch((err) => {
    console.error(`❌ Mesaj Hatası (${channelId}):`, err.response?.status);
    currentIndex = (currentIndex + 1) % channels.length;
  });
}

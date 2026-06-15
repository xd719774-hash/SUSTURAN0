package main

import (
	"log"
	"os"
	"time"

	"github.com/bwmarrin/discordgo"
)

func main() {
	// Render Environment Variables'dan değerleri al
	token := os.Getenv("TOKEN")
	channelID := os.Getenv("CHANNEL_ID")
	// Güncellenmiş mesaj
	mesaj := "1NATL AS1N AN AN1ZIN AM 1NA KOYULA CAK XD"

	if token == "" || channelID == "" {
		log.Fatal("TOKEN veya CHANNEL_ID ortam değişkenleri ayarlanmamış!")
	}

	dg, err := discordgo.New(token)
	if err != nil {
		log.Fatal("Discord bağlantısı kurulamadı: ", err)
	}

	err = dg.Open()
	if err != nil {
		log.Fatal("Bağlantı açılamadı: ", err)
	}

	log.Println("Bot başlatıldı, 5 saniyede bir mesaj gönderiliyor...")

	for {
		dg.ChannelTyping(channelID)
		_, err := dg.ChannelMessageSend(channelID, mesaj)
		if err != nil {
			log.Println("Mesaj gönderilemedi: ", err)
		}
		
		// 5 saniyelik döngü
		time.Sleep(5 * time.Second)
	}
}

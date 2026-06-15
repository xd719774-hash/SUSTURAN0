package main

import (
	"log"
	"os"
	"time"

	"github.com/bwmarrin/discordgo"
)

func main() {
	// Render'ın Environment kısmından çektiği değişkenler
	token := os.Getenv("TOKEN")
	channelID := os.Getenv("CHANNEL_ID")
	// Mesaj
	mesaj := "1NATL AS1N AN AN1ZIN AM 1NA KOYULA CAK XD"

	// TOKEN veya CHANNEL_ID tanımlı değilse botu başlatma
	if token == "" || channelID == "" {
		log.Fatal("HATA: TOKEN veya CHANNEL_ID environment değişkenleri eksik!")
	}

	dg, err := discordgo.New(token)
	if err != nil {
		log.Fatal("Discord bağlantı hatası: ", err)
	}

	err = dg.Open()
	if err != nil {
		log.Fatal("Bot açılamadı: ", err)
	}

	log.Println("Bot aktif, 5 saniyede bir mesaj gönderiliyor...")

	for {
		dg.ChannelTyping(channelID)
		_, err := dg.ChannelMessageSend(channelID, mesaj)
		if err != nil {
			log.Println("Mesaj gönderilemedi, tekrar deneniyor...")
		}
		
		// 5 saniye bekleme süresi
		time.Sleep(5 * time.Second)
	}
}

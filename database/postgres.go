package database

import (
	"fmt"
	"log"
	"os"

	"aiapply/models"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

func InitDB() *gorm.DB {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	db, err := gorm.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	db.AutoMigrate(&models.User{}, &models.JobApplication{}, &models.Analytics{}, &models.PlatformBreakdown{}, &models.MonthlyStat{})

	fmt.Println("Successfully connected to the database")
	return db
}
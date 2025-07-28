package main

import (
	"aiapply/database"
	"aiapply/handler"
	"aiapply/middleware"
	"aiapply/models"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	database.InitDB()
	db := database.DB
	db.AutoMigrate(&models.User{}, &models.JobApplication{}, &models.Analytics{}, &models.PlatformBreakdown{}, &models.MonthlyStat{}, &models.ColdEmail{})

	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Public
	r.POST("/login", handler.Login(db))
	r.POST("/register", handler.Register(db))
	r.POST("/google", handler.GoogleLogin(db))

	// Protected
	api := r.Group("/api")
	api.Use(middleware.JWTAuth())

	// Profile routes
	api.GET("/profile", handler.GetProfile(db))
	api.PUT("/profile", handler.UpdateProfile(db))

	// Analytics routes
	api.GET("/analytics", handler.GetAnalytics(db))

	// User routes
	api.GET("/users", handler.ListUsers(db))
	api.GET("/users/:id", handler.GetUser(db))
	api.PUT("/users/:id", handler.UpdateUser(db))
	api.DELETE("/users/:id", handler.DeleteUser(db))

	// Scraper routes
	api.POST("/scrape/:platform", handler.ScrapeJobs(db))

	// Application routes
	api.POST("/applications", middleware.JWTAuth(), handler.CreateApplication(db))
	api.GET("/applications", middleware.JWTAuth(), handler.GetApplications(db))

	log.Println("Starting HTTP server on :8090")
	if err := r.Run(":8090"); err != nil {
		log.Fatal(err)
	}
}

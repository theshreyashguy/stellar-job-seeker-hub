package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	"aiapply/models"
)

func CreateApplication(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var application models.JobApplication
		if err := c.ShouldBindJSON(&application); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Save(&application).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating application"})
			return
		}

		c.JSON(http.StatusOK, application)
	}
}

func GetApplications(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var applications []models.JobApplication
		userID := c.Query("user_id")

		if err := db.Where("user_id = ?", userID).Find(&applications).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching applications"})
			return
		}

		c.JSON(http.StatusOK, applications)
	}
}

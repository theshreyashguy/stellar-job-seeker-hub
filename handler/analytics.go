package handler

import (
	"aiapply/database"
	"aiapply/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

// GetAnalytics returns analytics data
func GetAnalytics(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		analytics, err := database.GetAnalytics(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, analytics)
	}
}

// UpdateAnalytics updates the analytics data
func UpdateAnalytics(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Type     string `json:"type"`
			Platform string `json:"platform"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		analytics, err := database.GetAnalytics(db)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		analytics.TotalApplications++

		if req.Type == "cold_email" {
			analytics.ColdEmailsSent++
		}

		// Find the platform and update its stats
		found := false
		for i, p := range analytics.PlatformBreakdown {
			if p.Platform == req.Platform {
				analytics.PlatformBreakdown[i].Applications++
				if req.Type == "cold_email" {
					analytics.PlatformBreakdown[i].ColdEmails++
				}
				found = true
				break
			}
		}

		// If the platform is not found, add it
		if !found {
			newPlatform := models.PlatformBreakdown{
				Platform:     req.Platform,
				Applications: 1,
			}
			if req.Type == "cold_email" {
				newPlatform.ColdEmails = 1
			}
			analytics.PlatformBreakdown = append(analytics.PlatformBreakdown, newPlatform)
		}

		if err := database.UpdateAnalytics(db, analytics); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, analytics)
	}
}

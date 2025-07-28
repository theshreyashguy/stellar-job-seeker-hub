package handler

import (
	"aiapply/database"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetAnalytics returns analytics data for the authenticated user
func GetAnalytics(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rawUserID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Normalize userID into an int
		var userID int
		switch v := rawUserID.(type) {
		case string:
			id, err := strconv.Atoi(v)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
				return
			}
			userID = id
		case float64:
			userID = int(v)
		case int:
			userID = v
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unsupported user ID type"})
			return
		}

		analytics, err := database.GetAnalyticsByUserID(db, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get analytics data"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"total_applications":  analytics.TotalApplications,
			"cold_emails_sent":    analytics.ColdEmailsSent,
			"platform_breakdown":  analytics.PlatformBreakdown,
			"monthly_stats":       analytics.MonthlyStats,
		})
	}
}

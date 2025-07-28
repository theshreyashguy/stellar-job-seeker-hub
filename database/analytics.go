package database

import (
	"aiapply/models"
	"time"

	"gorm.io/gorm"
)

// GetAnalyticsByUserID retrieves analytics for a specific user
func GetAnalyticsByUserID(db *gorm.DB, userID int) (*models.Analytics, error) {
	var analytics models.Analytics
	err := db.Preload("PlatformBreakdown").Preload("MonthlyStats").First(&analytics, "user_id = ?", userID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return &models.Analytics{UserID: userID}, nil
		}
		return nil, err
	}
	return &analytics, nil
}

// UpdateAnalytics updates the analytics data for a user
func UpdateAnalytics(db *gorm.DB, userID int, platform string, isColdEmail bool) error {
	return db.Transaction(func(tx *gorm.DB) error {
		var analytics models.Analytics
		if err := tx.FirstOrCreate(&analytics, models.Analytics{UserID: userID}).Error; err != nil {
			return err
		}

		analytics.TotalApplications++
		if isColdEmail {
			analytics.ColdEmailsSent++
		}

		if err := tx.Save(&analytics).Error; err != nil {
			return err
		}

		// Update platform breakdown
		var platformBreakdown models.PlatformBreakdown
		if err := tx.FirstOrCreate(&platformBreakdown, models.PlatformBreakdown{AnalyticsID: analytics.ID, Platform: platform}).Error; err != nil {
			return err
		}

		platformBreakdown.Applications++
		if isColdEmail {
			platformBreakdown.ColdEmails++
		}

		if err := tx.Save(&platformBreakdown).Error; err != nil {
			return err
		}

		// Update monthly stats
		month := time.Now().Format("2006-01")
		var monthlyStat models.MonthlyStat
		if err := tx.FirstOrCreate(&monthlyStat, models.MonthlyStat{AnalyticsID: analytics.ID, Month: month}).Error; err != nil {
			return err
		}

		monthlyStat.Applications++
		if isColdEmail {
			monthlyStat.Emails++
		}

		if err := tx.Save(&monthlyStat).Error; err != nil {
			return err
		}

		return nil
	})
}
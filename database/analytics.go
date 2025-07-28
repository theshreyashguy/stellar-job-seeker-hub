package database

import (
	"aiapply/models"
	"log"
	"time"

	"gorm.io/gorm"
)

func GetAnalyticsByUserID(db *gorm.DB, userID int) (*models.Analytics, error) {
	var analytics models.Analytics
	if err := db.Where("user_id = ?", userID).First(&analytics).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return &models.Analytics{UserID: userID}, nil // Return empty analytics if not found
		}
		return nil, err
	}

	if err := db.Where("analytics_id = ?", analytics.ID).Find(&analytics.PlatformBreakdown).Error; err != nil {
		return nil, err
	}

	if err := db.Where("analytics_id = ?", analytics.ID).Find(&analytics.MonthlyStats).Error; err != nil {
		return nil, err
	}

	return &analytics, nil
}

func CreateUserAnalytics(db *gorm.DB, userID int) (*models.Analytics, error) {
	analytics := &models.Analytics{
		UserID:            userID,
		TotalApplications: 0,
		ColdEmailsSent:    0,
	}
	if err := db.Create(analytics).Error; err != nil {
		return nil, err
	}
	return analytics, nil
}

func UpdateAnalytics(db *gorm.DB, userID int, application models.JobApplication) {
	go func() {
		db.Transaction(func(tx *gorm.DB) error {
			var analytics models.Analytics
			if err := tx.Where(models.Analytics{UserID: userID}).Attrs(models.Analytics{UserID: userID}).FirstOrCreate(&analytics).Error; err != nil {
				log.Printf("Error finding or creating analytics: %v", err)
				return err
			}

			analytics.TotalApplications++

			// Update platform breakdown
			var platformBreakdown models.PlatformBreakdown
			if err := tx.Where(models.PlatformBreakdown{AnalyticsID: analytics.ID, Platform: application.Platform}).FirstOrCreate(&platformBreakdown).Error; err != nil {
				log.Printf("Error finding or creating platform breakdown: %v", err)
				return err
			}
			platformBreakdown.Applications++
			if application.ApplicationType == "cold_email" {
				platformBreakdown.ColdEmails++
			}
			if err := tx.Save(&platformBreakdown).Error; err != nil {
				log.Printf("Error saving platform breakdown: %v", err)
				return err
			}

			// Update monthly stats
			month := time.Now().Format("2006-01")
			var monthlyStat models.MonthlyStat
			if err := tx.Where(models.MonthlyStat{AnalyticsID: analytics.ID, Month: month}).FirstOrCreate(&monthlyStat).Error; err != nil {
				log.Printf("Error finding or creating monthly stat: %v", err)
				return err
			}
			monthlyStat.Applications++
			if application.ApplicationType == "cold_email" {
				monthlyStat.Emails++
			}
			if err := tx.Save(&monthlyStat).Error; err != nil {
				log.Printf("Error saving monthly stat: %v", err)
				return err
			}

			if application.ApplicationType == "cold_email" {
				analytics.ColdEmailsSent++
			}

			if err := tx.Save(&analytics).Error; err != nil {
				log.Printf("Error saving analytics: %v", err)
				return err
			}

			return nil
		})
	}()
}
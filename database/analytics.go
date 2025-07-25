
package database

import (
	"aiapply/models"

	"github.com/jinzhu/gorm"
)

func GetAnalytics(db *gorm.DB) (*models.Analytics, error) {
	var analytics models.Analytics
	if err := db.First(&analytics).Error; err != nil {
		if gorm.IsRecordNotFoundError(err) {
			// Create a new record if one doesn't exist
			return &models.Analytics{}, nil
		}
		return nil, err
	}
	return &analytics, nil
}

func UpdateAnalytics(db *gorm.DB, analytics *models.Analytics) error {
	return db.Save(analytics).Error
}

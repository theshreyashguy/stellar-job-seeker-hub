package database

import (
	"aiapply/models"

	"github.com/jinzhu/gorm"
)

func CreateUser(db *gorm.DB, user *models.User) (*models.User, error) {
	if err := db.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByEmail(db *gorm.DB, email string) (*models.User, error) {
	var user models.User
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
package models

import "github.com/jinzhu/gorm"

type ColdEmail struct {
	gorm.Model
	UserID      uint   `json:"user_id"`
	ApplicationID uint   `json:"application_id"`
	Status      string `json:"status"` // e.g., "sent", "opened", "replied"
}

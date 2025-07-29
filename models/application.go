package models

import "time"

type JobApplication struct {
	ID              uint      `json:"id" gorm:"primary_key"`
	UserID          uint      `json:"user_id"`
	JobTitle        string    `json:"job_title"`
	CompanyName     string    `json:"company_name"`
	Platform        string    `json:"platform"`
	DateApplied     time.Time `json:"date_applied"`
	Status          string    `json:"status"` // e.g., Applied, Interviewing, Offer, Rejected
	ApplicationType string    `json:"application_type"`
	EmployeeNames   []string  `json:"employee_names" gorm:"-"`
	Domain          string    `json:"domain" gorm:"-"`
}

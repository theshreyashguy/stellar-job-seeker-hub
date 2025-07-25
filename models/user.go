package models

import "gorm.io/gorm"

// User represents a user in the database
type User struct {
	gorm.Model
	Username          string `json:"username"`
	Email             string `json:"email" gorm:"unique"`
	Password          string `json:"-"` // Omit password from JSON responses
	ProfileTitle      string `json:"profile_title"`
	Profile           string `json:"profile"`
	Phone             string `json:"phone"`
	GitHubURL         string `json:"github_url"`
	LinkedInURL       string `json:"linkedin_url"`
	ResumeURL         string `json:"resume_url"`
	ColdEmailTemplate string `json:"cold_email_template"`
}

// Token represents a JWT token
type Token struct {
	Token string `json:"token"`
}

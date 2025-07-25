package models

// Analytics represents user analytics data
type Analytics struct {
	TotalApplications int64               `json:"total_applications"`
	ColdEmailsSent    int64               `json:"cold_emails_sent"`
	PlatformBreakdown []PlatformBreakdown `json:"platform_breakdown"`
	MonthlyStats      []MonthlyStat       `json:"monthly_stats"`
}

// PlatformBreakdown represents a breakdown of applications and emails by platform
type PlatformBreakdown struct {
	Platform     string `json:"platform"`
	Applications int64  `json:"applications"`
	ColdEmails   int64  `json:"cold_emails"`
}

// MonthlyStat represents monthly application and email statistics
type MonthlyStat struct {
	Month        string `json:"month"`
	Applications int64  `json:"applications"`
	Emails       int64  `json:"emails"`
}
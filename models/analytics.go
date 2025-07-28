package models

// Analytics represents user analytics data
// Analytics represents user analytics data
type Analytics struct {
  ID                int                 `gorm:"primaryKey" json:"id"`
  UserID            int                 `gorm:"unique"      json:"user_id"`
  TotalApplications int64               `json:"total_applications"`
  ColdEmailsSent    int64               `json:"cold_emails_sent"`

  // specify foreign key + cascade rules as you like:
  PlatformBreakdown []PlatformBreakdown `gorm:"foreignKey:AnalyticsID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
  MonthlyStats      []MonthlyStat       `gorm:"foreignKey:AnalyticsID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

type PlatformBreakdown struct {
	AnalyticsID  int       `gorm:"primaryKey" json:"analytics_id"`
	Analytics    Analytics `gorm:"foreignKey:AnalyticsID"`
	Platform     string    `gorm:"primaryKey" json:"platform"`
	Applications int64     `json:"applications"`
	ColdEmails   int64     `json:"cold_emails"`
}

type MonthlyStat struct {
	AnalyticsID  int       `gorm:"primaryKey" json:"analytics_id"`
	Analytics    Analytics `gorm:"foreignKey:AnalyticsID"`
	Month        string    `gorm:"primaryKey" json:"month"`
	Applications int64     `json:"applications"`
	Emails       int64     `json:"emails"`
}

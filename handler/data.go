package handler

import "aiapply/models"

var AnalyticsData = models.Analytics{
	TotalApplications: 47,
	ColdEmailsSent:    23,
	PlatformBreakdown: []models.PlatformBreakdown{
		{Platform: "LinkedIn", Applications: 18, ColdEmails: 12},
		{Platform: "Cuvette", Applications: 15, ColdEmails: 6},
		{Platform: "Wellfound", Applications: 14, ColdEmails: 5},
	},
	MonthlyStats: []models.MonthlyStat{
		{Month: "Jan", Applications: 8, Emails: 4},
		{Month: "Feb", Applications: 12, Emails: 7},
		{Month: "Mar", Applications: 15, Emails: 8},
		{Month: "Apr", Applications: 12, Emails: 4},
	},
}

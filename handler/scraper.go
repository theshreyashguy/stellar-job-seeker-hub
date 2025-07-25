package handler

import (
	"fmt"
	"io"
	"net/http"
	"strings"

	"aiapply/cuvette"
	"aiapply/linkedin"
	"aiapply/wellfound"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

func ScrapeJobs(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		platform := c.Param("platform")

		file, _, err := c.Request.FormFile("html")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "HTML file is required"})
			return
		}
		defer file.Close()

		content, err := io.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read uploaded file"})
			return
		}

		var jobs interface{}
		var scrapeErr error

		switch platform {
		case "linkedin":
			jobs, scrapeErr = linkedin.Jobscrapper(strings.NewReader(string(content)))
		case "wellfound":
			jobs, scrapeErr = wellfound.ScrapeFromReader(strings.NewReader(string(content)))
		case "cuvette":
			jobs, scrapeErr = cuvette.ScrapeJobDetailsFromReader(strings.NewReader(string(content)))
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Platform '%s' not supported", platform)})
			return
		}

		if scrapeErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to scrape jobs: %v", scrapeErr)})
			return
		}

		c.JSON(http.StatusOK, jobs)
	}
}
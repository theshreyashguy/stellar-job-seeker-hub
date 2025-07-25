package wellfound

import (
	"aiapply/linkedin"
	"fmt"
	"io"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// ScrapeFromReader scrapes job listings from a Wellfound HTML file.
func ScrapeFromReader(reader io.Reader) ([]linkedin.Job, error) {
	doc, err := goquery.NewDocumentFromReader(reader)
	if err != nil {
		return nil, fmt.Errorf("could not parse HTML: %w", err)
	}

	var jobs []linkedin.Job
	doc.Find(".job-listings .job-listing").Each(func(i int, s *goquery.Selection) {
		jobTitle := s.Find(".job-title").Text()
		companyName := s.Find(".company-name").Text()
		location := s.Find(".job-location").Text()
		salary := s.Find(".job-salary").Text()

		jobs = append(jobs, linkedin.Job{
			Role:     strings.TrimSpace(jobTitle),
			Company:  strings.TrimSpace(companyName),
			Location: strings.TrimSpace(location),
			Salary:   strings.TrimSpace(salary),
		})
	})

	return jobs, nil
}

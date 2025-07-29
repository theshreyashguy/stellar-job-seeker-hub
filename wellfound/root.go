package wellfound

import (
	"fmt"
	"io"

	"github.com/PuerkitoBio/goquery"
)

// JobDetail holds enriched data for each job listing, including company info.
type JobDetail struct {
	ID              string
	Role            string
	CompanyName     string
	CompanyURL      string
	CompanyPhotoURL string
	Location        string
	Salary          string
}

// ScrapeJobDetailsFromReader scrapes job listings from a Wellfound HTML file and returns detailed info.
func ScrapeJobDetailsFromReader(reader io.Reader) ([]JobDetail, error) {
	doc, err := goquery.NewDocumentFromReader(reader)
	if err != nil {
		return nil, fmt.Errorf("could not parse HTML: %w", err)
	}

	var details []JobDetail

	// Find each job listing inside the listings container
	doc.Find(`[data-test="StartupResult"]`).Each(func(i int, s *goquery.Selection) {
		companyName := s.Find("h2").Text()
		companyURL, _ := s.Find("a").Attr("href")
		companyPhotoURL, _ := s.Find("img").Attr("src")

		s.Find(`[data-testid="job-listing-list"] > div`).Each(func(j int, job *goquery.Selection) {
			id, _ := job.Attr("data-id")
			role := job.Find("[class*='styles_title']").Text()
			location := job.Find("[class*='styles_locations']").Text()
			salary := job.Find("[class*='styles_compensation']").Text()

			details = append(details, JobDetail{
				ID:              id,
				Role:            role,
				CompanyName:     companyName,
				CompanyURL:      companyURL,
				CompanyPhotoURL: companyPhotoURL,
				Location:        location,
				Salary:          salary,
			})
		})
	})

	return details, nil
}

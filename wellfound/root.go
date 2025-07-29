package wellfound

import (
	"fmt"
	"io"
	"strings"

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
	doc.Find(`div[data-testid="job-listing-list"] .styles_component__Ey28k`).Each(func(i int, s *goquery.Selection) {
		// ID attribute if present
		id, _ := s.Attr("data-id")

		// Role/Title
		role := strings.TrimSpace(s.Find("span.styles_title__xpQDw").Text())

		// Locations: multiple spans
		tmpLocs := []string{}
		s.Find("span.styles_location__O9Z62").Each(func(_ int, l *goquery.Selection) {
			tmpLocs = append(tmpLocs, strings.TrimSpace(l.Text()))
		})
		location := strings.Join(tmpLocs, ", ")

		// Salary/Compensation
		salary := strings.TrimSpace(s.Find("span.styles_compensation__3JnvU").Text())

		// Company info: find the corresponding header container by index
		headerSel := doc.Find("div.styles_headerContainer__GfbYF").Eq(i)
		companyName := strings.TrimSpace(headerSel.Find("h2").Text())
		companyURL, _ := headerSel.Find("a").Attr("href")
		companyPhotoURL, _ := headerSel.Find("img").Attr("src")

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

	return details, nil
}

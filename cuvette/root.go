package cuvette

import (
	"fmt"
	"io"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// JobDetail holds enriched data for each internship listing.
type JobDetail struct {
	Role            string
	CompanyName     string
	CompanyPhotoURL string
	Location        string
	Salary          string
	Duration        string
	Mode            string
	StartDate       string
	OfficeLocation  string
	ApplyBy         string
	PostedAgo       string
}

// ScrapeCuvetteInternships reads HTML from reader and returns a slice of JobDetail.
func ScrapeCuvetteInternships(reader io.Reader) ([]JobDetail, error) {
	doc, err := goquery.NewDocumentFromReader(reader)
	if err != nil {
		return nil, fmt.Errorf("could not parse HTML: %w", err)
	}

	var out []JobDetail

	// Each card container
	doc.Find("div.StudentInternshipCard_container__3fPjn").Each(func(i int, s *goquery.Selection) {
		// Title / Role
		role := strings.TrimSpace(s.Find("h3").Text())

		// Company + Location (in same <p>, separated by “|”)
		rawHeader := strings.TrimSpace(
			s.Find("div.StudentInternshipCard_heading__1JfH4 > p").Text(),
		)
		parts := strings.Split(rawHeader, "|")
		companyName := strings.TrimSpace(parts[0])
		location := ""
		if len(parts) > 1 {
			location = strings.TrimSpace(parts[1])
		}

		// Company logo/photo
		companyPhotoURL, _ := s.Find("img").Attr("src")

		// Stipend / Salary (first info‐value)
		salary := strings.TrimSpace(
			s.Find(".StudentInternshipCard_intenrshipInfo__17c2v .StudentInternshipCard_infoValue__E3Alf").
				First().
				Text(),
		)

		// Other details: Duration, Mode, Start Date, Office Location
		var duration, mode, startDate, officeLocation string
		s.Find(".StudentInternshipCard_intenrshipInfo__17c2v .StudentInternshipCard_info__1HW16").Each(
			func(_ int, info *goquery.Selection) {
				label := strings.TrimSpace(info.Find(".StudentInternshipCard_infoTop__3yl8o").Text())
				value := strings.TrimSpace(info.Find(".StudentInternshipCard_infoValue__E3Alf").Text())
				switch label {
				case "Duration":
					duration = value
				case "Mode":
					mode = value
				case "Start Date":
					startDate = value
				case "Office Location":
					officeLocation = value
				}
			},
		)

		// Apply by & Posted
		var applyBy, postedAgo string
		infoPs := s.Find(".StudentInternshipCard_currentInfoLeft__1jLNL p")
		if infoPs.Length() > 0 {
			applyLine := strings.TrimSpace(infoPs.First().Text())
			parts := strings.Split(applyLine, "•")
			applyBy = strings.TrimSpace(parts[0])
			if len(parts) > 1 {
				postedAgo = strings.TrimSpace(parts[1])
			}
		}

		out = append(out, JobDetail{
			Role:            role,
			CompanyName:     companyName,
			CompanyPhotoURL: companyPhotoURL,
			Location:        location,
			Salary:          salary,
			Duration:        duration,
			Mode:            mode,
			StartDate:       startDate,
			OfficeLocation:  officeLocation,
			ApplyBy:         applyBy,
			PostedAgo:       postedAgo,
		})
	})

	return out, nil
}

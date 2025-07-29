package cuvette

import (
	"fmt"
	"io"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// JobDetail holds enriched data for each internship or job listing.
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
	Type            string // "job" or "internship"
	ID              string
	ApplyURL        string
	Skills          []string
	Level           string
}

// ScrapeCuvetteListings reads HTML from reader and returns a slice of JobDetail.
func ScrapeCuvetteListings(reader io.Reader) ([]JobDetail, error) {
	doc, err := goquery.NewDocumentFromReader(reader)
	if err != nil {
		return nil, fmt.Errorf("could not parse HTML: %w", err)
	}

	var listings []JobDetail

	doc.Find("div[class*='StudentInternshipCard_container']").Each(func(_ int, s *goquery.Selection) {
		// Role, header, company, location, photo, salary
		role := strings.TrimSpace(s.Find("h3").Text())
		rawHeader := strings.TrimSpace(s.Find("div[class*='StudentInternshipCard_heading'] > p").Text())
		parts := strings.Split(rawHeader, "|")
		companyName := strings.TrimSpace(parts[0])
		location := ""
		if len(parts) > 1 {
			location = strings.TrimSpace(parts[1])
		}
		companyPhotoURL, _ := s.Find("img").Attr("src")
		salary := strings.TrimSpace(s.Find("div[class*='StudentInternshipCard_infoValue']").First().Text())

		// Other info fields
		var duration, mode, startDate, officeLocation string
		s.Find("div[class*='StudentInternshipCard_info']").Each(func(_ int, info *goquery.Selection) {
			label := strings.TrimSpace(info.Find("div[class*='StudentInternshipCard_infoTop']").Text())
			value := strings.TrimSpace(info.Find("div[class*='StudentInternshipCard_infoValue']").Text())
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
		})

		// ApplyBy and PostedAgo
		var applyBy, postedAgo string
		if infoPs := s.Find("div[class*='StudentInternshipCard_currentInfoLeft'] p"); infoPs.Length() > 0 {
			line := strings.TrimSpace(infoPs.First().Text())
			parts := strings.Split(line, "•")
			if len(parts) > 0 {
				applyBy = strings.TrimSpace(parts[0])
			}
			if len(parts) > 1 {
				postedAgo = strings.TrimSpace(parts[1])
			}
		}

		// Extract type and ID from the "View Details" link href
		var typ, id string
		if link := s.Find("p[class*='StudentInternshipCard_outline']").Closest("div").Find("button").First(); link.Length() > 0 {
			// The ID and type are not available in the provided HTML for the "Apply Now" button.
			// This will be left blank, and the frontend will need to handle it.
		}
		applyURL := "" // No apply URL available from the button.

		// Skills
		var skills []string
		s.Find("div[class*='StudentInternshipCard_skill']").Each(func(_ int, skill *goquery.Selection) {
			skills = append(skills, strings.TrimSpace(skill.Text()))
		})

		// Level
		level := strings.TrimSpace(s.Find("p[class*='sc-iUuxjF']").Text())

		listings = append(listings, JobDetail{
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
			Type:            typ,
			ID:              id,
			ApplyURL:        applyURL,
			Skills:          skills,
			Level:           level,
		})
	})

	return listings, nil
}

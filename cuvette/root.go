package cuvette

import (
	"fmt"
	"io"
	"log"
	"net/url"
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

	doc.Find("div[class^='StudentInternshipCard_container']").Each(func(_ int, s *goquery.Selection) {
		// Basic header
		role := strings.TrimSpace(s.Find("h3").Text())

		// Company | Location
		rawHeader := strings.TrimSpace(
			s.Find("div[class^='StudentInternshipCard_heading'] > p").Text(),
		)
		parts := strings.Split(rawHeader, "|")
		companyName := strings.TrimSpace(parts[0])
		location := ""
		if len(parts) > 1 {
			location = strings.TrimSpace(parts[1])
		}

		// Logo
		companyPhotoURL, _ := s.Find("img").Attr("src")

		// Salary (first infoValue)
		salary := strings.TrimSpace(
			s.Find("div[class^='StudentInternshipCard_infoValue']").First().Text(),
		)

		// Duration / Mode / Start Date / Office Location
		var duration, mode, startDate, officeLocation string
		s.Find("div[class^='StudentInternshipCard_info']").Each(
			func(_ int, info *goquery.Selection) {
				label := strings.TrimSpace(
					info.Find("div[class^='StudentInternshipCard_infoTop']").Text(),
				)
				value := strings.TrimSpace(
					info.Find("div[class^='StudentInternshipCard_infoValue']").Text(),
				)
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

		// ApplyBy & PostedAgo
		var applyBy, postedAgo string
		if p := s.Find("div[class^='StudentInternshipCard_currentInfoLeft'] p").First(); p.Length() > 0 {
			line := strings.TrimSpace(p.Text())
			parts := strings.Split(line, "•")
			if len(parts) > 0 {
				applyBy = strings.TrimSpace(parts[0])
			}
			if len(parts) > 1 {
				postedAgo = strings.TrimSpace(parts[1])
			}
		}

		// Try to pull out the <a href> around “View Details” or “Apply Now”
		var applyURL, typ, id string
		if linkSel := s.Find("p[class^='StudentInternshipCard_outline']").Closest("a"); linkSel.Length() > 0 {
			if href, ok := linkSel.Attr("href"); ok {
				applyURL = href
				log.Printf("Found apply URL: %s", applyURL)

				// parse query parameters to get type & id, if present
				if u, err := url.Parse(href); err == nil {
					q := u.Query()
					typ = q.Get("type")
					id = q.Get("id")
				}
			}
		}

		// Skills
		var skills []string
		s.Find("div[class^='StudentInternshipCard_skill']").Each(func(_ int, skill *goquery.Selection) {
			skills = append(skills, strings.TrimSpace(skill.Text()))
		})

		// Level badge
		level := strings.TrimSpace(
			s.Find("p[class^='sc-iUuxjF']").First().Text(),
		)

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

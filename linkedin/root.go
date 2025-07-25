package linkedin

import (
	"fmt"
	"io"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func Jobscrapper(r io.Reader) ([]Job, error) {
	doc, err := goquery.NewDocumentFromReader(r)
	if err != nil {
		return nil, fmt.Errorf("could not parse HTML: %w", err)
	}

	var jobs []Job
	doc.Find("li[data-job-id], li[data-occludable-job-id]").Each(func(_ int, li *goquery.Selection) {
		id, ok := li.Attr("data-job-id")
		if !ok {
			id, _ = li.Attr("data-occludable-job-id")
		}

		role := strings.TrimSpace(li.Find("a.job-card-list__title--link strong").First().Text())
		company := strings.TrimSpace(li.Find(".artdeco-entity-lockup__subtitle span").First().Text())
		location := strings.TrimSpace(li.Find(".artdeco-entity-lockup__caption .job-card-container__metadata-wrapper li").First().Text())
		salary := strings.TrimSpace(li.Find(".artdeco-entity-lockup__metadata .job-card-container__metadata-wrapper li").First().Text())

		if id != "" {
			jobs = append(jobs, Job{
				ID:       id,
				Role:     strings.Join(strings.Fields(role), " "),
				Company:  company,
				Location: location,
				Salary:   salary,
			})
		}
	})

	return jobs, nil
}


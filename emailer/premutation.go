package emailer

import (
	"fmt"
	"strings"
)

// Generate permutations as per your 10 templates
func GeneratePermutations(first, last, domain string) []string {
	firstLower := strings.ToLower(first)
	lastLower := strings.ToLower(last)
	firstInitial := strings.ToLower(string(first[0]))

	return []string{
		fmt.Sprintf("%s.%s@%s", firstLower, lastLower, domain),
		fmt.Sprintf("%s@%s", firstLower, domain),
		fmt.Sprintf("%s.%s@%s", firstInitial, lastLower, domain),
		fmt.Sprintf("%s.%s@%s", firstLower, string(last[0]), domain),
		fmt.Sprintf("%s%s@%s", firstLower, lastLower, domain),
		fmt.Sprintf("%s.%s@%s", lastLower, firstLower, domain),
		fmt.Sprintf("%s%s42@%s", firstLower, lastLower, domain),
		fmt.Sprintf("%s%s@%s", firstLower, string(last[0]), domain),
		fmt.Sprintf("%s_%s@%s", firstLower, lastLower, domain),
		fmt.Sprintf("%s%s@%s", lastLower, firstInitial, domain),
	}
}

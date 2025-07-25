package emailer

import (
	"errors"
	"fmt"
	"net"
	"net/mail"
	"net/smtp"
	"strings"
	"time"
)

// disposableDomains holds a sample set of disposable email domains.
var disposableDomains = map[string]struct{}{
	"mailinator.com":   {},
	"tempmail.com":     {},
	"10minutemail.com": {},
}

// ValidateEmail performs a multi-step validation:
// 1. Syntax check
// 2. Domain validity
// 3. Disposable domain check
// 4. MX record lookup
// 5. SMTP mailbox check
func ValidateEmail(address string) error {
	// 1. Syntax check
	email, err := mail.ParseAddress(address)
	if err != nil {
		return errors.New("invalid email format")
	}

	parts := strings.Split(email.Address, "@")
	domain := parts[1]

	// 2. Domain validity (basic)
	if len(domain) == 0 || !strings.Contains(domain, ".") {
		return errors.New("invalid domain")
	}

	// 3. Disposable domain check
	if _, found := disposableDomains[strings.ToLower(domain)]; found {
		return errors.New("disposable email addresses are not allowed")
	}

	// 4. MX record lookup
	mxRecords, err := net.LookupMX(domain)
	if err != nil || len(mxRecords) == 0 {
		return fmt.Errorf("no MX records found for domain %s", domain)
	}

	// pick the first MX host
	mxHost := mxRecords[0].Host

	// 5. SMTP mailbox check
	return verifySMTP(mxHost, email.Address)
}

// verifySMTP dials the SMTP server and issues a RCPT TO command
// to check if mailbox exists.
func verifySMTP(mxHost, address string) error {
	// connect to SMTP server
	addr := fmt.Sprintf("%s:25", mxHost)
	conn, err := net.DialTimeout("tcp", addr, 10*time.Second)
	if err != nil {
		return fmt.Errorf("unable to connect to SMTP server: %w", err)
	}
	defer conn.Close()

	c, err := smtp.NewClient(conn, strings.TrimRight(mxHost, "."))
	if err != nil {
		return fmt.Errorf("SMTP handshake failed: %w", err)
	}
	defer c.Quit()

	// use a fake sender
	sender := "noreply@example.com"
	if err := c.Mail(sender); err != nil {
		return fmt.Errorf("SMTP MAIL FROM failed: %w", err)
	}

	if err := c.Rcpt(address); err != nil {
		// some servers reject RCPT TO for unknown users
		return fmt.Errorf("email address rejected by server: %w", err)
	}

	return nil
}

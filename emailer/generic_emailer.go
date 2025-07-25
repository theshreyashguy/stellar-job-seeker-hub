package emailer

import (
	"fmt"
	"net/smtp"
)

// SendGenericEmail sends a simple plain text email.
func SendGenericEmail(to, subject, body string) error {
	auth := smtp.PlainAuth("", username, password, smtpHost)

	msg := "To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" +
		body

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, username, []string{to}, []byte(msg))
	if err != nil {
		return fmt.Errorf("sendMail: %w", err)
	}
	return nil
}


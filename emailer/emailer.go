package emailer

import (
	"aiapply/models"
	"bytes"
	"encoding/base64"
	"fmt"
	"log"
	"net/smtp"
	"os"
	"path/filepath"
)

const (
	smtpHost      = "smtp.gmail.com"
	smtpPort      = "587"
	username      = "jadhaoshreyash31@gmail.com" // your Gmail address
	password      = "ttcubeiowzfeyebv"           // app password or OAuth token
	mixedBoundary = "MIXED-BOUNDARY-123456"
	altBoundary   = "ALT-BOUNDARY-654321"
)

// SendApplicationEmail sends your application (plain+HTML) and attaches resume & presentation.
func SendApplicationEmail(to, position string, user models.User) error {

	// 1) Headers
	subj := fmt.Sprintf("Subject: Application for %s - %s\r\n", position, user.Username)
	headers := subj +
		"MIME-Version: 1.0\r\n" +
		fmt.Sprintf("Content-Type: multipart/mixed; boundary=%s\r\n", mixedBoundary) +
		"\r\n"

	var buf bytes.Buffer
	buf.WriteString(headers)

	// 2) multipart/alternative part
	buf.WriteString(fmt.Sprintf("--%s\r\n", mixedBoundary))
	buf.WriteString(fmt.Sprintf("Content-Type: multipart/alternative; boundary=%s\r\n", altBoundary))
	buf.WriteString("\r\n")

	// 2a) Plain text version
	buf.WriteString(fmt.Sprintf("--%s\r\n", altBoundary))
	buf.WriteString("Content-Type: text/plain; charset=utf-8\r\n")
	buf.WriteString("Content-Transfer-Encoding: 7bit\r\n")
	buf.WriteString("\r\n")
	buf.WriteString(plainBody(position, user))
	buf.WriteString("\r\n")

	// 2b) HTML version
	buf.WriteString(fmt.Sprintf("--%s\r\n", altBoundary))
	buf.WriteString("Content-Type: text/html; charset=utf-8\r\n")
	buf.WriteString("Content-Transfer-Encoding: 7bit\r\n")
	buf.WriteString("\r\n")
	buf.WriteString(htmlBody(position, user))
	buf.WriteString("\r\n")

	// end of alternative
	buf.WriteString(fmt.Sprintf("--%s--\r\n", altBoundary))

	// 3) Attach resume.pdf
	if err := attachFile(&buf, "resume.pdf"); err != nil {
		return fmt.Errorf("attach resume: %w", err)
	}

	// 4) Closing mixed boundary
	buf.WriteString(fmt.Sprintf("--%s--\r\n", mixedBoundary))

	// 5) Send!
	auth := smtp.PlainAuth("", username, password, smtpHost)
	if err := smtp.SendMail(smtpHost+":"+smtpPort, auth, username, []string{to}, buf.Bytes()); err != nil {
		log.Printf("Failed to send email to %s: %v", to, err)
		return fmt.Errorf("sendMail: %w", err)
	}
	return nil
}

func plainBody(position string, user models.User) string {
	return fmt.Sprintf(`Hope you're doing well.

I'm reaching out to express my interest in the %s position at your company.

I'm a frontend-focused full-stack developer who loves building scalable applications. As a Codeforces Expert (Top 1%%) and CodeChef 5‑star coder, I ranked 55 out of 40k participants in LeetCode Weekly Contest 148, showcasing my strong problem-solving skills.

In my internships, I optimized API performance, implemented microservice architectures, and improved system efficiency to support growing loads. I believe my background aligns well with the needs of your team.

I’d love to connect and learn more about any opportunities on your team. I've attached my resume and a presentation on my journey for your reference.

Thank you for your time, and I look forward to hearing from you.

Best regards,
%s
%s
%s
%s
`, position, user.Username, user.LinkedInURL, user.GitHubURL, user.ResumeURL)
}

func htmlBody(position string, user models.User) string {
	return fmt.Sprintf(`<html>
  <body>
    <p>Hope you're doing well.</p>
    <p>I'm reaching out to express my interest in the <strong>%s</strong> position at your company.</p>
    <p>I'm a <strong>frontend-focused full-stack developer</strong> who loves building scalable applications. As a <em>Codeforces Expert (Top 1%%)</em> and <em>CodeChef 5‑star coder</em>, I ranked 55 out of 40k participants in LeetCode Weekly Contest 148, showcasing my strong problem-solving skills.</p>
    <p>In my internships, I optimized API performance, implemented microservice architectures, and improved system efficiency to support growing loads. I believe my background aligns well with the needs of your team.</p>
    <p>I’d love to connect and learn more about any opportunities on your team. I've attached my resume and a presentation on my journey for your reference.</p>
    <p>Thank you for your time, and I look forward to hearing from you.</p>
    <p>Best regards,<br/>
       <strong>%s</strong><br/>
       <a href="%s">LinkedIn</a> | <a href="%s">GitHub</a> | <a href="%s">Resume</a>
    </p>
  </body>
</html>`, position, user.Username, user.LinkedInURL, user.GitHubURL, user.ResumeURL)
}

// attachFile reads a file, base64‑encodes it, and appends it as a mixed part.
func attachFile(buf *bytes.Buffer, path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	filename := filepath.Base(path)
	encoded := base64.StdEncoding.EncodeToString(data)

	buf.WriteString(fmt.Sprintf("--%s\r\n", mixedBoundary))
	buf.WriteString("Content-Type: application/pdf; name=\"" + filename + "\"\r\n")
	buf.WriteString("Content-Transfer-Encoding: base64\r\n")
	buf.WriteString("Content-Disposition: attachment; filename=\"" + filename + "\"\r\n")
	buf.WriteString("\r\n")
	for i := 0; i < len(encoded); i += 76 {
		end := i + 76
		if end > len(encoded) {
			end = len(encoded)
		}
		buf.WriteString(encoded[i:end] + "\r\n")
	}
	return nil
}

package emailer

import (
	"bytes"
	"encoding/base64"
	"fmt"
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
func SendApplicationEmail(to, position string) error {
	// 1) Headers
	subj := fmt.Sprintf("Subject: Application: %s applicant\r\n", position)
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

	// 2a) Plain‑text version
	buf.WriteString(fmt.Sprintf("--%s\r\n", altBoundary))
	buf.WriteString("Content-Type: text/plain; charset=utf-8\r\n")
	buf.WriteString("Content-Transfer-Encoding: 7bit\r\n")
	buf.WriteString("\r\n")
	buf.WriteString(plainBody())
	buf.WriteString("\r\n")

	// 2b) HTML version
	buf.WriteString(fmt.Sprintf("--%s\r\n", altBoundary))
	buf.WriteString("Content-Type: text/html; charset=utf-8\r\n")
	buf.WriteString("Content-Transfer-Encoding: 7bit\r\n")
	buf.WriteString("\r\n")
	buf.WriteString(htmlBody())
	buf.WriteString("\r\n")

	// end of alternative
	buf.WriteString(fmt.Sprintf("--%s--\r\n", altBoundary))

	// 3) Attach resume.pdf
	if err := attachFile(&buf, "resume.pdf"); err != nil {
		return fmt.Errorf("attach resume: %w", err)
	}

	// 4) Attach presentation.pdf
	if err := attachFile(&buf, "presentation.pdf"); err != nil {
		return fmt.Errorf("attach presentation: %w", err)
	}

	// 5) Closing mixed boundary
	buf.WriteString(fmt.Sprintf("--%s--\r\n", mixedBoundary))

	// 6) Send!
	auth := smtp.PlainAuth("", username, password, smtpHost)
	if err := smtp.SendMail(smtpHost+":"+smtpPort, auth, username, []string{to}, buf.Bytes()); err != nil {
		return fmt.Errorf("sendMail: %w", err)
	}
	return nil
}

func plainBody() string {
	return `I’m Shreyash,

a software developer passionate about building scalable applications. I have strong frontend experience and full-stack skills. As a Codeforces Expert (Top 1%) and CodeChef 4‑star coder, and in recent leetcode beetweekly 148 I achieved a rank of 55 globally out of 40k participants, I bring solid problem‑solving abilities to every project. In my internships, I delivered measurable impact by optimizing API performance and implementing scalable microservice architectures, improving efficiency and handling growing loads. I would welcome the opportunity to discuss how my background could benefit your team. I have attached my resume and a ppt on my journey for your reference.

Thank you for your time; I look forward to hearing from you. If my experience sounds like a fit, I’d be happy to chat further.

Best regards,
Shreyash Jadhao
LinkedIn: https://www.linkedin.com/in/shreyash-jadhao-02bb5b226/
GitHub:    https://github.com/theshreyashguy
`
}

func htmlBody() string {
	return `<html>
  <body>
    <p>I’m <strong>Shreyash</strong>,</p>
    <p>a software developer passionate about building scalable applications. I have strong frontend experience and full-stack skills. As a <em>Codeforces Expert (Top 1%)</em> and <em>CodeChef 4‑star coder</em>, and in recent leetcode beetweekly 148 I achieved a rank of 55 globally out of 40k participants, I bring solid problem‑solving abilities to every project. In my internships, I delivered measurable impact by optimizing API performance and implementing scalable microservice architectures, improving efficiency and handling growing loads. I would welcome the opportunity to discuss how my background could benefit your team. I have attached my resume and a ppt on my journey for your reference.</p>
    <p>Thank you for your time; I look forward to hearing from you. If my experience sounds like a fit, I’d be happy to chat further.</p>
    <p>Best regards,<br/>
       <strong>Shreyash Jadhao</strong><br/>
       <a href="https://www.linkedin.com/in/shreyash-jadhao-02bb5b226/">LinkedIn</a> |
       <a href="https://github.com/theshreyashguy">GitHub</a>
    </p>
  </body>
</html>`
}

// attachFile reads a file, base64‑encodes it, and appends it as a mixed part.
func attachFile(buf *bytes.Buffer, path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	filename := filepath.Base(path)
	encoded := base64.StdEncoding.EncodeToString(data)

	// header for this attachment
	buf.WriteString(fmt.Sprintf("--%s\r\n", mixedBoundary))
	buf.WriteString("Content-Type: application/pdf; name=\"" + filename + "\"\r\n")
	buf.WriteString("Content-Transfer-Encoding: base64\r\n")
	buf.WriteString("Content-Disposition: attachment; filename=\"" + filename + "\"\r\n")
	buf.WriteString("\r\n")

	// RFC2045: max 76 chars per line
	for i := 0; i < len(encoded); i += 76 {
		end := i + 76
		if end > len(encoded) {
			end = len(encoded)
		}
		buf.WriteString(encoded[i:end] + "\r\n")
	}
	return nil
}

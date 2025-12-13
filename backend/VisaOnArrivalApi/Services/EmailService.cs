using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace VisaOnArrivalApi.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    private (string smtpHost, int smtpPort, string smtpUsername, string smtpPassword, string fromEmail, string fromName) GetEmailConfiguration()
    {
        var emailProvider = Environment.GetEnvironmentVariable("EMAIL_PROVIDER") ?? "GMAIL";

        if (emailProvider.ToUpper() == "GMAIL")
        {
            // Gmail configuration - from environment variables
            return (
                smtpHost: Environment.GetEnvironmentVariable("GMAIL_SMTP_HOST") ?? "smtp.gmail.com",
                smtpPort: int.Parse(Environment.GetEnvironmentVariable("GMAIL_SMTP_PORT") ?? "587"),
                smtpUsername: Environment.GetEnvironmentVariable("GMAIL_USERNAME") ?? "",
                smtpPassword: Environment.GetEnvironmentVariable("GMAIL_PASSWORD") ?? "",
                fromEmail: Environment.GetEnvironmentVariable("GMAIL_FROM_EMAIL") ?? "",
                fromName: Environment.GetEnvironmentVariable("GMAIL_FROM_NAME") ?? "Rwanda Immigration Services"
            );
        }
        else
        {
            // Mailtrap configuration - from environment variables
            return (
                smtpHost: Environment.GetEnvironmentVariable("MAILTRAP_SMTP_HOST") ?? "sandbox.smtp.mailtrap.io",
                smtpPort: int.Parse(Environment.GetEnvironmentVariable("MAILTRAP_SMTP_PORT") ?? "2525"),
                smtpUsername: Environment.GetEnvironmentVariable("MAILTRAP_USERNAME") ?? "",
                smtpPassword: Environment.GetEnvironmentVariable("MAILTRAP_PASSWORD") ?? "",
                fromEmail: Environment.GetEnvironmentVariable("MAILTRAP_FROM_EMAIL") ?? "noreply@visaonarrival.rw",
                fromName: Environment.GetEnvironmentVariable("MAILTRAP_FROM_NAME") ?? "Rwanda Immigration Services"
            );
        }
    }

    public async Task SendVisaConfirmationEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber, DateTime arrivalDate)
    {
        var subject = "Rwanda Visa On Arrival - Registration Confirmed";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #004892; color: white; padding: 40px 30px; text-align: center; }}
        .header h1 {{ margin: 0 0 10px 0; font-size: 28px; font-weight: 700; }}
        .header p {{ margin: 0; font-size: 16px; opacity: 0.95; }}
        .content {{ background: white; padding: 40px 30px; }}
        .reference-box {{ background: #CFE3F7; border: 3px solid #004892; padding: 25px; margin: 25px 0; text-align: center; border-radius: 12px; }}
        .reference-label {{ margin: 0; font-size: 14px; color: #6b7280; font-weight: 600; }}
        .reference-number {{ font-size: 36px; font-weight: bold; color: #004892; letter-spacing: 4px; margin: 10px 0; }}
        .reference-note {{ margin: 10px 0 0 0; font-size: 13px; color: #6b7280; }}
        .info-box {{ background: #f0f9ff; padding: 20px; margin: 20px 0; border-left: 4px solid #004892; border-radius: 4px; }}
        .info-box h4 {{ margin-top: 0; color: #004892; font-size: 16px; }}
        .section-title {{ color: #004892; font-size: 18px; margin-top: 25px; margin-bottom: 15px; }}
        ol, ul {{ color: #1f2937; line-height: 1.8; }}
        .footer {{ text-align: center; margin-top: 30px; padding: 20px; background: #f9fafb; font-size: 12px; color: #6b7280; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>🇷🇼 Welcome to Rwanda</h1>
            <p>Land of a Thousand Hills</p>
        </div>
        <div class=""content"">
            <h2 style=""color: #004892; margin-top: 0;"">Dear {firstName} {lastName},</h2>
            <p>Thank you for registering for your Visa On Arrival to Rwanda. Your registration has been successfully received and confirmed.</p>

            <div class=""reference-box"">
                <p class=""reference-label"">YOUR REFERENCE NUMBER</p>
                <div class=""reference-number"">{referenceNumber}</div>
                <p class=""reference-note"">✓ Present this number at the airport immigration counter</p>
            </div>

            <h3 class=""section-title"">📍 At Kigali International Airport:</h3>
            <ol>
                <li>Proceed to the <strong>Visa On Arrival</strong> counter</li>
                <li>Present your reference number: <strong>{referenceNumber}</strong></li>
                <li>Show your passport and travel documents</li>
                <li>Pay the visa fee of <strong>USD $50</strong></li>
                <li>Receive your visa stamp and entry permit</li>
            </ol>

            <div class=""info-box"">
                <h4>📋 Required Documents at Airport:</h4>
                <ul style=""margin: 10px 0;"">
                    <li>Valid passport (minimum 6 months validity)</li>
                    <li>Reference number: <strong>{referenceNumber}</strong></li>
                    <li>USD $50 cash for visa fee</li>
                    <li>Return or onward ticket</li>
                    <li>Proof of accommodation in Rwanda</li>
                </ul>
            </div>

            <p style=""margin-top: 30px; color: #004892; font-weight: 600; font-size: 16px;"">Welcome to Rwanda!</p>
            <p>We look forward to welcoming you to the Land of a Thousand Hills. Enjoy your stay and experience the beauty and culture of our nation.</p>

            <p style=""margin-top: 30px; color: #1f2937;"">
                <strong>Warm Regards,</strong><br>
                <span style=""color: #004892; font-weight: 600;"">Rwanda Immigration Services</span><br>
                <span style=""color: #6b7280; font-size: 14px;"">Republic of Rwanda</span>
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email from Rwanda Immigration Services. Please do not reply to this message.</p>
            <p style=""margin-top: 10px;"">&copy; {DateTime.Now.Year} Republic of Rwanda Immigration Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    public async Task SendVisaApprovalEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber)
    {
        var subject = "Rwanda Visa On Arrival - Application Approved ✓";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #10b981; color: white; padding: 40px 30px; text-align: center; }}
        .header h1 {{ margin: 0 0 10px 0; font-size: 32px; font-weight: 700; }}
        .header p {{ margin: 0; font-size: 16px; opacity: 0.95; }}
        .content {{ background: white; padding: 40px 30px; }}
        .success-box {{ background: #d1fae5; border: 3px solid #10b981; padding: 30px; margin: 25px 0; text-align: center; border-radius: 12px; }}
        .success-box h2 {{ color: #065f46; margin-top: 0; font-size: 24px; }}
        .success-box p {{ color: #065f46; font-size: 16px; margin: 10px 0; }}
        .reference-number {{ font-size: 36px; font-weight: bold; color: #004892; letter-spacing: 4px; margin: 15px 0; }}
        .info-box {{ background: #CFE3F7; padding: 20px; margin: 20px 0; border-left: 4px solid #004892; border-radius: 4px; }}
        .info-box h4 {{ margin-top: 0; color: #004892; font-size: 16px; }}
        .section-title {{ color: #004892; font-size: 18px; margin-top: 25px; margin-bottom: 15px; }}
        ol, ul {{ color: #1f2937; line-height: 1.8; }}
        .footer {{ text-align: center; margin-top: 30px; padding: 20px; background: #f9fafb; font-size: 12px; color: #6b7280; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✓ Visa Approved</h1>
            <p>Your application has been approved!</p>
        </div>
        <div class=""content"">
            <div class=""success-box"">
                <h2>🎉 Congratulations, {firstName}!</h2>
                <p>Your Visa On Arrival application has been <strong>APPROVED</strong></p>
                <div class=""reference-number"">{referenceNumber}</div>
            </div>

            <h3 class=""section-title"">📍 Next Steps at Kigali International Airport:</h3>
            <ol>
                <li>Proceed to the <strong>Visa On Arrival</strong> counter</li>
                <li>Present your reference number: <strong>{referenceNumber}</strong></li>
                <li>Show your passport and travel documents</li>
                <li>Pay the visa fee of <strong>USD $50</strong></li>
                <li>Receive your visa stamp and entry permit</li>
            </ol>

            <div class=""info-box"">
                <h4>📋 Required Documents at Airport:</h4>
                <ul style=""margin: 10px 0;"">
                    <li>Valid passport (minimum 6 months validity)</li>
                    <li>Reference number: <strong>{referenceNumber}</strong></li>
                    <li>USD $50 cash for visa fee</li>
                    <li>Return or onward ticket</li>
                    <li>Proof of accommodation in Rwanda</li>
                </ul>
            </div>

            <p style=""margin-top: 30px; color: #10b981; font-weight: 600; font-size: 16px;"">🇷🇼 Welcome to Rwanda - Land of a Thousand Hills!</p>
            <p>We look forward to welcoming you and hope you enjoy your stay. Experience the beauty, culture, and warmth of our nation.</p>

            <p style=""margin-top: 30px; color: #1f2937;"">
                <strong>Safe Travels,</strong><br>
                <span style=""color: #004892; font-weight: 600;"">Rwanda Immigration Services</span><br>
                <span style=""color: #6b7280; font-size: 14px;"">Republic of Rwanda</span>
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email from Rwanda Immigration Services. Please do not reply to this message.</p>
            <p style=""margin-top: 10px;"">&copy; {DateTime.Now.Year} Republic of Rwanda Immigration Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    public async Task SendVisaApprovalEmailWithDocumentAsync(string toEmail, string firstName, string lastName, string referenceNumber, byte[] visaPdfBytes)
    {
        var subject = "Rwanda Visa On Arrival - Application Approved ✓";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #10b981; color: white; padding: 40px 30px; text-align: center; }}
        .header h1 {{ margin: 0 0 10px 0; font-size: 32px; font-weight: 700; }}
        .header p {{ margin: 0; font-size: 16px; opacity: 0.95; }}
        .content {{ background: white; padding: 40px 30px; }}
        .success-box {{ background: #d1fae5; border: 3px solid #10b981; padding: 30px; margin: 25px 0; text-align: center; border-radius: 12px; }}
        .success-box h2 {{ color: #065f46; margin-top: 0; font-size: 24px; }}
        .success-box p {{ color: #065f46; font-size: 16px; margin: 10px 0; }}
        .reference-number {{ font-size: 36px; font-weight: bold; color: #004892; letter-spacing: 4px; margin: 15px 0; }}
        .attachment-box {{ background: #f0f9ff; border: 3px solid #004892; padding: 20px; margin: 20px 0; border-radius: 8px; }}
        .attachment-box h4 {{ margin-top: 0; color: #004892; font-size: 16px; }}
        .info-box {{ background: #CFE3F7; padding: 20px; margin: 20px 0; border-left: 4px solid #004892; border-radius: 4px; }}
        .info-box h4 {{ margin-top: 0; color: #004892; font-size: 16px; }}
        .section-title {{ color: #004892; font-size: 18px; margin-top: 25px; margin-bottom: 15px; }}
        ol, ul {{ color: #1f2937; line-height: 1.8; }}
        .footer {{ text-align: center; margin-top: 30px; padding: 20px; background: #f9fafb; font-size: 12px; color: #6b7280; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✓ Visa Approved</h1>
            <p>Your application has been approved!</p>
        </div>
        <div class=""content"">
            <div class=""success-box"">
                <h2>🎉 Congratulations, {firstName}!</h2>
                <p>Your Visa On Arrival application has been <strong>APPROVED</strong></p>
                <div class=""reference-number"">{referenceNumber}</div>
            </div>

            <div class=""attachment-box"">
                <h4>📎 Visa Document Attached</h4>
                <p style=""margin: 10px 0; color: #1f2937;"">Your official temporary visa document is attached to this email. Please:</p>
                <ul style=""margin: 10px 0;"">
                    <li>Download and save the PDF document</li>
                    <li>Print a copy to bring to the airport</li>
                    <li>Keep a digital copy on your mobile device</li>
                </ul>
            </div>

            <h3 class=""section-title"">📍 Next Steps at Kigali International Airport:</h3>
            <ol>
                <li>Proceed to the <strong>Visa On Arrival</strong> counter</li>
                <li>Present your reference number: <strong>{referenceNumber}</strong></li>
                <li>Show your <strong>printed visa document</strong> (attached to this email)</li>
                <li>Show your passport and travel documents</li>
                <li>Pay the visa fee of <strong>USD $50</strong></li>
                <li>Receive your visa stamp and entry permit</li>
            </ol>

            <div class=""info-box"">
                <h4>📋 Required Documents at Airport:</h4>
                <ul style=""margin: 10px 0;"">
                    <li>Valid passport (minimum 6 months validity)</li>
                    <li><strong>Printed visa document</strong> (attached to this email)</li>
                    <li>Reference number: <strong>{referenceNumber}</strong></li>
                    <li>USD $50 cash for visa fee</li>
                    <li>Return or onward ticket</li>
                    <li>Proof of accommodation in Rwanda</li>
                </ul>
            </div>

            <p style=""margin-top: 30px; color: #10b981; font-weight: 600; font-size: 16px;"">🇷🇼 Welcome to Rwanda - Land of a Thousand Hills!</p>
            <p>We look forward to welcoming you and hope you enjoy your stay. Experience the beauty, culture, and warmth of our nation.</p>

            <p style=""margin-top: 30px; color: #1f2937;"">
                <strong>Safe Travels,</strong><br>
                <span style=""color: #004892; font-weight: 600;"">Rwanda Immigration Services</span><br>
                <span style=""color: #6b7280; font-size: 14px;"">Republic of Rwanda</span>
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email from Rwanda Immigration Services. Please do not reply to this message.</p>
            <p style=""margin-top: 10px;"">&copy; {DateTime.Now.Year} Republic of Rwanda Immigration Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailWithAttachmentAsync(toEmail, subject, htmlBody, visaPdfBytes, $"Rwanda-Visa-{referenceNumber}.pdf");
    }

    public async Task SendVisaRejectionEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber, string reason)
    {
        var subject = "Rwanda Visa On Arrival - Application Status Update";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #004892; color: white; padding: 40px 30px; text-align: center; }}
        .header h1 {{ margin: 0 0 10px 0; font-size: 28px; font-weight: 700; }}
        .header p {{ margin: 0; font-size: 14px; opacity: 0.9; }}
        .content {{ background: white; padding: 40px 30px; }}
        .status-box {{ background: #fef3c7; border: 3px solid #f59e0b; padding: 25px; margin: 25px 0; border-radius: 12px; }}
        .status-box h4 {{ margin-top: 0; color: #92400e; font-size: 16px; }}
        .status-box p {{ color: #78350f; margin: 10px 0; }}
        .info-box {{ background: #f0f9ff; padding: 20px; margin: 20px 0; border-left: 4px solid #004892; border-radius: 4px; }}
        .section-title {{ color: #004892; font-size: 18px; margin-top: 25px; margin-bottom: 15px; }}
        ol {{ color: #1f2937; line-height: 1.8; }}
        .footer {{ text-align: center; margin-top: 30px; padding: 20px; background: #f9fafb; font-size: 12px; color: #6b7280; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Visa Application Status</h1>
            <p>Reference: {referenceNumber}</p>
        </div>
        <div class=""content"">
            <h2 style=""color: #004892; margin-top: 0;"">Dear {firstName} {lastName},</h2>
            <p>Thank you for your interest in visiting Rwanda. We have carefully reviewed your Visa On Arrival application with reference number <strong>{referenceNumber}</strong>.</p>

            <div class=""status-box"">
                <h4>⚠️ Application Status: Requires Review</h4>
                <p><strong>Reason for Review:</strong></p>
                <p style=""background: white; padding: 15px; border-radius: 6px; margin-top: 10px;"">{reason}</p>
            </div>

            <h3 class=""section-title"">📋 Next Steps:</h3>
            <ol>
                <li>Carefully review the reason provided above</li>
                <li>Prepare any necessary documentation or corrections</li>
                <li>Submit a new application if required</li>
                <li>Contact Rwanda Immigration Services for clarification if needed</li>
            </ol>

            <div class=""info-box"">
                <p style=""margin: 0; color: #004892;""><strong>Need Assistance?</strong></p>
                <p style=""margin: 10px 0 0 0; color: #1f2937;"">If you believe this decision requires clarification or you need assistance with your application, please contact the Rwanda Immigration Department.</p>
            </div>

            <p style=""margin-top: 30px; color: #1f2937;"">
                <strong>Regards,</strong><br>
                <span style=""color: #004892; font-weight: 600;"">Rwanda Immigration Services</span><br>
                <span style=""color: #6b7280; font-size: 14px;"">Republic of Rwanda</span>
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email from Rwanda Immigration Services. Please do not reply to this message.</p>
            <p style=""margin-top: 10px;"">&copy; {DateTime.Now.Year} Republic of Rwanda Immigration Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(toEmail, subject, htmlBody);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            _logger.LogInformation("=== EMAIL SENDING START ===");
            _logger.LogInformation("Attempting to send email to: {ToEmail}, Subject: {Subject}", toEmail, subject);

            var (smtpHost, smtpPort, smtpUsername, smtpPassword, fromEmail, fromName) = GetEmailConfiguration();

            // Log configuration (mask password)
            _logger.LogInformation("Email Configuration:");
            _logger.LogInformation("  SMTP Host: {SmtpHost}", smtpHost);
            _logger.LogInformation("  SMTP Port: {SmtpPort}", smtpPort);
            _logger.LogInformation("  SMTP Username: {SmtpUsername}", string.IsNullOrEmpty(smtpUsername) ? "[NOT SET]" : smtpUsername);
            _logger.LogInformation("  SMTP Password: {SmtpPassword}", string.IsNullOrEmpty(smtpPassword) ? "[NOT SET]" : "[SET - " + smtpPassword.Length + " chars]");
            _logger.LogInformation("  From Email: {FromEmail}", fromEmail);
            _logger.LogInformation("  From Name: {FromName}", fromName);

            if (string.IsNullOrEmpty(smtpHost))
            {
                _logger.LogWarning("SMTP Host is not configured. Email not sent to {Email}", toEmail);
                return;
            }

            if (string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword))
            {
                _logger.LogWarning("SMTP credentials (username/password) not configured. Email not sent to {Email}", toEmail);
                return;
            }

            _logger.LogInformation("Creating email message...");
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();
            _logger.LogInformation("Email message created successfully");

            using var client = new SmtpClient();

            _logger.LogInformation("Connecting to SMTP server {SmtpHost}:{SmtpPort}...", smtpHost, smtpPort);
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            _logger.LogInformation("Successfully connected to SMTP server");

            _logger.LogInformation("Authenticating with username: {SmtpUsername}...", smtpUsername);
            await client.AuthenticateAsync(smtpUsername, smtpPassword);
            _logger.LogInformation("Successfully authenticated with SMTP server");

            _logger.LogInformation("Sending email to {ToEmail} with subject: {Subject}...", toEmail, subject);
            await client.SendAsync(message);
            _logger.LogInformation("Email message sent to SMTP server");

            await client.DisconnectAsync(true);
            _logger.LogInformation("Disconnected from SMTP server");

            _logger.LogInformation("✅ Email sent successfully to {ToEmail}", toEmail);
            _logger.LogInformation("=== EMAIL SENDING END ===");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ FAILED to send email to {ToEmail}. Error Type: {ErrorType}, Message: {ErrorMessage}",
                toEmail, ex.GetType().Name, ex.Message);
            if (ex.InnerException != null)
            {
                _logger.LogError("Inner Exception: {InnerExceptionType} - {InnerExceptionMessage}",
                    ex.InnerException.GetType().Name, ex.InnerException.Message);
            }
            _logger.LogInformation("=== EMAIL SENDING END (WITH ERRORS) ===");
            // Don't throw - we don't want email failures to break the application flow
        }
    }

    private async Task SendEmailWithAttachmentAsync(string toEmail, string subject, string htmlBody, byte[] attachmentBytes, string attachmentFileName)
    {
        try
        {
            _logger.LogInformation("=== EMAIL WITH ATTACHMENT SENDING START ===");
            _logger.LogInformation("Attempting to send email with attachment to: {ToEmail}, Subject: {Subject}, Attachment: {FileName}", toEmail, subject, attachmentFileName);

            var (smtpHost, smtpPort, smtpUsername, smtpPassword, fromEmail, fromName) = GetEmailConfiguration();

            // Log configuration (mask password)
            _logger.LogInformation("Email Configuration:");
            _logger.LogInformation("  SMTP Host: {SmtpHost}", smtpHost);
            _logger.LogInformation("  SMTP Port: {SmtpPort}", smtpPort);
            _logger.LogInformation("  SMTP Username: {SmtpUsername}", string.IsNullOrEmpty(smtpUsername) ? "[NOT SET]" : smtpUsername);
            _logger.LogInformation("  SMTP Password: {SmtpPassword}", string.IsNullOrEmpty(smtpPassword) ? "[NOT SET]" : "[SET - " + smtpPassword.Length + " chars]");
            _logger.LogInformation("  From Email: {FromEmail}", fromEmail);
            _logger.LogInformation("  From Name: {FromName}", fromName);

            if (string.IsNullOrEmpty(smtpHost))
            {
                _logger.LogWarning("SMTP Host is not configured. Email not sent to {Email}", toEmail);
                return;
            }

            if (string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword))
            {
                _logger.LogWarning("SMTP credentials (username/password) not configured. Email not sent to {Email}", toEmail);
                return;
            }

            _logger.LogInformation("Creating email message with attachment...");
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };

            // Add PDF attachment
            bodyBuilder.Attachments.Add(attachmentFileName, attachmentBytes, new ContentType("application", "pdf"));
            _logger.LogInformation("PDF attachment added: {FileName} ({Size} bytes)", attachmentFileName, attachmentBytes.Length);

            message.Body = bodyBuilder.ToMessageBody();
            _logger.LogInformation("Email message with attachment created successfully");

            using var client = new SmtpClient();

            _logger.LogInformation("Connecting to SMTP server {SmtpHost}:{SmtpPort}...", smtpHost, smtpPort);
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            _logger.LogInformation("Successfully connected to SMTP server");

            _logger.LogInformation("Authenticating with username: {SmtpUsername}...", smtpUsername);
            await client.AuthenticateAsync(smtpUsername, smtpPassword);
            _logger.LogInformation("Successfully authenticated with SMTP server");

            _logger.LogInformation("Sending email with attachment to {ToEmail}...", toEmail);
            await client.SendAsync(message);
            _logger.LogInformation("Email with attachment sent to SMTP server");

            await client.DisconnectAsync(true);
            _logger.LogInformation("Disconnected from SMTP server");

            _logger.LogInformation("✅ Email with attachment sent successfully to {ToEmail}", toEmail);
            _logger.LogInformation("=== EMAIL WITH ATTACHMENT SENDING END ===");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ FAILED to send email with attachment to {ToEmail}. Error Type: {ErrorType}, Message: {ErrorMessage}",
                toEmail, ex.GetType().Name, ex.Message);
            if (ex.InnerException != null)
            {
                _logger.LogError("Inner Exception: {InnerExceptionType} - {InnerExceptionMessage}",
                    ex.InnerException.GetType().Name, ex.InnerException.Message);
            }
            _logger.LogInformation("=== EMAIL WITH ATTACHMENT SENDING END (WITH ERRORS) ===");
            // Don't throw - we don't want email failures to break the application flow
        }
    }

    public async Task SendVisaAcknowledgementEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber, byte[] acknowledgementPdfBytes)
    {
        var subject = $"Visa On Arrival Registration Confirmed - {referenceNumber}";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #10b981; color: white; padding: 40px 30px; text-align: center; }}
        .header h1 {{ margin: 0 0 10px 0; font-size: 32px; font-weight: 700; }}
        .header p {{ margin: 0; font-size: 16px; opacity: 0.95; }}
        .content {{ background: white; padding: 40px 30px; }}
        .reference-box {{ background: #d1fae5; border: 3px solid #10b981; padding: 25px; margin: 25px 0; text-align: center; border-radius: 12px; }}
        .reference-label {{ margin: 0; font-size: 14px; color: #6b7280; font-weight: 600; }}
        .reference-number {{ font-size: 36px; font-weight: bold; color: #004892; letter-spacing: 4px; margin: 10px 0; }}
        .reference-note {{ margin: 10px 0 0 0; font-size: 13px; color: #6b7280; }}
        .attachment-box {{ background: #f0f9ff; border: 3px solid #004892; padding: 20px; margin: 20px 0; border-radius: 8px; }}
        .attachment-box h4 {{ margin-top: 0; color: #004892; font-size: 16px; }}
        .section-title {{ color: #004892; font-size: 18px; margin-top: 25px; margin-bottom: 15px; }}
        ol {{ color: #1f2937; line-height: 1.8; }}
        .footer {{ text-align: center; margin-top: 30px; padding: 20px; background: #f9fafb; font-size: 12px; color: #6b7280; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✓ Registration Confirmed</h1>
            <p>Republic of Rwanda - Immigration Services</p>
        </div>
        <div class=""content"">
            <h2 style=""color: #004892; margin-top: 0;"">Dear {firstName} {lastName},</h2>

            <p>Thank you for registering for your Visa On Arrival to Rwanda. Your registration has been successfully received and confirmed.</p>

            <div class=""reference-box"">
                <p class=""reference-label"">YOUR REFERENCE NUMBER</p>
                <div class=""reference-number"">{referenceNumber}</div>
                <p class=""reference-note"">✓ Present this number at the airport immigration counter</p>
            </div>

            <div class=""attachment-box"">
                <h4>📎 Acknowledgement Document Attached</h4>
                <p style=""margin: 10px 0; color: #1f2937;"">Your acknowledgement document is attached to this email. Please:</p>
                <ul style=""margin: 10px 0; color: #1f2937; line-height: 1.8;"">
                    <li>Download and save the PDF document</li>
                    <li>Print a copy to bring to the airport</li>
                    <li>Keep a digital copy on your mobile device</li>
                </ul>
            </div>

            <h3 class=""section-title"">📍 At Kigali International Airport:</h3>
            <ol>
                <li>Proceed to the <strong>Visa On Arrival</strong> counter</li>
                <li>Present your reference number and the attached document</li>
                <li>Pay the visa fee of <strong>USD $50</strong></li>
                <li>Receive your visa stamp and entry permit</li>
            </ol>

            <p style=""margin-top: 30px; color: #10b981; font-weight: 600; font-size: 16px;"">🇷🇼 Welcome to Rwanda - Land of a Thousand Hills!</p>
            <p>We look forward to welcoming you to our beautiful country.</p>

            <p style=""margin-top: 30px; color: #1f2937;"">
                <strong>Best Regards,</strong><br>
                <span style=""color: #004892; font-weight: 600;"">Rwanda Immigration Services</span><br>
                <span style=""color: #6b7280; font-size: 14px;"">Republic of Rwanda - Ministry of Immigration</span>
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email from Rwanda Immigration Services. Please do not reply to this message.</p>
            <p style=""margin-top: 10px;"">&copy; {DateTime.UtcNow.Year} Republic of Rwanda Immigration Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailWithAttachmentAsync(toEmail, subject, htmlBody, acknowledgementPdfBytes, $"Acknowledgement_{referenceNumber}.pdf");
    }
}

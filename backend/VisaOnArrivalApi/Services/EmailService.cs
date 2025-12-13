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
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #00A1DE 0%, #20603D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .reference-box {{ background: white; border: 3px solid #20603D; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }}
        .reference-number {{ font-size: 32px; font-weight: bold; color: #20603D; letter-spacing: 3px; }}
        .info-box {{ background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FAD201; border-radius: 4px; }}
        .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Welcome to Rwanda</h1>
            <p style=""font-size: 18px; margin: 10px 0 0 0;"">Land of a Thousand Hills</p>
        </div>
        <div class=""content"">
            <h2>Dear {firstName} {lastName},</h2>
            <p>Thank you for registering for your Visa On Arrival to Rwanda.</p>

            <div class=""reference-box"">
                <p style=""margin: 0; font-size: 14px; color: #666;"">Your Reference Number:</p>
                <div class=""reference-number"">{referenceNumber}</div>
                <p style=""margin: 10px 0 0 0; font-size: 12px; color: #666;"">Present this at the airport</p>
            </div>

            <h3 style=""color: #20603D;"">At Kigali International Airport:</h3>
            <ol>
                <li>Proceed to the Visa On Arrival counter</li>
                <li>Present your reference number: <strong>{referenceNumber}</strong></li>
                <li>Show your passport and travel documents</li>
                <li>Pay the visa fee of USD $50</li>
                <li>Receive your visa stamp</li>
            </ol>

            <div class=""info-box"">
                <h4 style=""margin-top: 0; color: #20603D;"">Please Bring:</h4>
                <ul style=""margin: 10px 0;"">
                    <li>Valid passport (6+ months validity)</li>
                    <li>USD $50 for visa fee</li>
                    <li>Return/onward ticket</li>
                    <li>Proof of accommodation</li>
                </ul>
            </div>

            <p>Welcome to Rwanda!</p>

            <p style=""margin-top: 30px;"">
                <strong>Warm Regards,</strong><br>
                Rwanda Immigration Services
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {DateTime.Now.Year} Rwanda Immigration Services. All rights reserved.</p>
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
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #20603D 0%, #00A1DE 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .success-box {{ background: #d1e7dd; border: 3px solid #0f5132; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }}
        .reference-number {{ font-size: 28px; font-weight: bold; color: #20603D; letter-spacing: 3px; }}
        .info-box {{ background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FAD201; border-radius: 4px; }}
        .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✓ Visa Approved</h1>
            <p style=""font-size: 18px; margin: 10px 0 0 0;"">Your application has been approved!</p>
        </div>
        <div class=""content"">
            <div class=""success-box"">
                <h2 style=""color: #0f5132; margin-top: 0;"">Congratulations, {firstName}!</h2>
                <p style=""font-size: 16px; color: #0f5132;"">Your Visa On Arrival application has been <strong>APPROVED</strong></p>
                <div class=""reference-number"">{referenceNumber}</div>
            </div>

            <h3 style=""color: #20603D;"">Next Steps at Kigali International Airport:</h3>
            <ol>
                <li>Proceed to the <strong>Visa On Arrival</strong> counter</li>
                <li>Present your reference number: <strong>{referenceNumber}</strong></li>
                <li>Show your passport and travel documents</li>
                <li>Pay the visa fee of <strong>USD $50</strong></li>
                <li>Receive your visa stamp and entry permit</li>
            </ol>

            <div class=""info-box"">
                <h4 style=""margin-top: 0; color: #20603D;"">Required at Airport</h4>
                <ul style=""margin: 10px 0;"">
                    <li>Valid passport (6+ months validity)</li>
                    <li>Reference number: {referenceNumber}</li>
                    <li>USD $50 for visa fee</li>
                    <li>Return/onward ticket</li>
                    <li>Proof of accommodation</li>
                </ul>
            </div>

            <p><strong>Welcome to Rwanda - Land of a Thousand Hills!</strong></p>
            <p>We hope you enjoy your stay and experience the beauty and culture of our nation.</p>

            <p style=""margin-top: 30px;"">
                <strong>Safe Travels,</strong><br>
                Rwanda Immigration Services
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {DateTime.Now.Year} Rwanda Immigration Services. All rights reserved.</p>
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
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #20603D 0%, #00A1DE 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .success-box {{ background: #d1e7dd; border: 3px solid #0f5132; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }}
        .reference-number {{ font-size: 28px; font-weight: bold; color: #20603D; letter-spacing: 3px; }}
        .info-box {{ background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FAD201; border-radius: 4px; }}
        .attachment-box {{ background: #e8f4f8; border: 2px solid #00A1DE; padding: 15px; margin: 15px 0; border-radius: 4px; }}
        .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✓ Visa Approved</h1>
            <p style=""font-size: 18px; margin: 10px 0 0 0;"">Your application has been approved!</p>
        </div>
        <div class=""content"">
            <div class=""success-box"">
                <h2 style=""color: #0f5132; margin-top: 0;"">Congratulations, {firstName}!</h2>
                <p style=""font-size: 16px; color: #0f5132;"">Your Visa On Arrival application has been <strong>APPROVED</strong></p>
                <div class=""reference-number"">{referenceNumber}</div>
            </div>

            <div class=""attachment-box"">
                <h4 style=""margin-top: 0; color: #00A1DE;"">📎 Visa Document Attached</h4>
                <p>Your official temporary visa document is attached to this email. Please:</p>
                <ul style=""margin: 10px 0;"">
                    <li>Download and save the PDF document</li>
                    <li>Print a copy to bring to the airport</li>
                    <li>Keep a digital copy on your phone</li>
                </ul>
            </div>

            <h3 style=""color: #20603D;"">Next Steps at Kigali International Airport:</h3>
            <ol>
                <li>Proceed to the <strong>Visa On Arrival</strong> counter</li>
                <li>Present your reference number: <strong>{referenceNumber}</strong></li>
                <li>Show your printed visa document (attached)</li>
                <li>Show your passport and travel documents</li>
                <li>Pay the visa fee of <strong>USD $50</strong></li>
                <li>Receive your visa stamp and entry permit</li>
            </ol>

            <div class=""info-box"">
                <h4 style=""margin-top: 0; color: #20603D;"">Required at Airport</h4>
                <ul style=""margin: 10px 0;"">
                    <li>Valid passport (6+ months validity)</li>
                    <li>Printed visa document (attached to this email)</li>
                    <li>Reference number: {referenceNumber}</li>
                    <li>USD $50 for visa fee</li>
                    <li>Return/onward ticket</li>
                    <li>Proof of accommodation</li>
                </ul>
            </div>

            <p><strong>Welcome to Rwanda - Land of a Thousand Hills!</strong></p>
            <p>We hope you enjoy your stay and experience the beauty and culture of our nation.</p>

            <p style=""margin-top: 30px;"">
                <strong>Safe Travels,</strong><br>
                Rwanda Immigration Services
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {DateTime.Now.Year} Rwanda Immigration Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailWithAttachmentAsync(toEmail, subject, htmlBody, visaPdfBytes, $"Rwanda-Visa-{referenceNumber}.pdf");
    }

    public async Task SendVisaRejectionEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber, string reason)
    {
        var subject = "Rwanda Visa On Arrival - Registration Status Update";
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #00A1DE 0%, #20603D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .info-box {{ background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FAD201; border-radius: 4px; }}
        .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Visa Application Status</h1>
            <p style=""font-size: 18px; margin: 10px 0 0 0;"">Reference: {referenceNumber}</p>
        </div>
        <div class=""content"">
            <h2>Dear {firstName} {lastName},</h2>
            <p>Thank you for your interest in visiting Rwanda. We have reviewed your Visa On Arrival application.</p>

            <div class=""info-box"">
                <h4 style=""margin-top: 0; color: #20603D;"">Application Status: Requires Review</h4>
                <p><strong>Reason:</strong> {reason}</p>
            </div>

            <h3 style=""color: #20603D;"">What You Can Do:</h3>
            <ol>
                <li>Review the reason provided above</li>
                <li>Prepare necessary documentation or corrections</li>
                <li>Submit a new application if applicable</li>
                <li>Contact Rwanda Immigration for clarification</li>
            </ol>

            <p>If you believe this decision was made in error or need assistance, please contact the Rwanda Immigration Department.</p>

            <p style=""margin-top: 30px;"">
                <strong>Regards,</strong><br>
                Rwanda Immigration Services
            </p>
        </div>
        <div class=""footer"">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {DateTime.Now.Year} Rwanda Immigration Services. All rights reserved.</p>
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
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #20603D 0%, #00A1DE 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .reference-box {{ background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; }}
        .reference-number {{ font-size: 24px; font-weight: bold; color: #2e7d32; }}
        .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }}
        .check-icon {{ font-size: 48px; color: #4caf50; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✓ Registration Confirmed</h1>
            <p>Republic of Rwanda - Immigration Services</p>
        </div>
        <div class=""content"">
            <p>Dear {firstName} {lastName},</p>

            <p>Thank you for registering for your Visa On Arrival. Your registration has been successfully received.</p>

            <div class=""reference-box"">
                <p style=""margin: 0; font-size: 14px; color: #666;"">Your Reference Number</p>
                <p class=""reference-number"">{referenceNumber}</p>
                <p style=""margin: 0; font-size: 12px; color: #666;"">Present this at the airport immigration counter</p>
            </div>

            <h3>At Kigali International Airport:</h3>
            <ol>
                <li>Proceed to the Visa On Arrival counter</li>
                <li>Present your reference number and the attached document</li>
                <li>Pay the visa fee of USD $50</li>
                <li>Receive your visa stamp</li>
            </ol>

            <p><strong>Your acknowledgement document is attached to this email.</strong> Please print it or save it on your mobile device to present at the airport.</p>

            <p>Welcome to Rwanda - Land of a Thousand Hills!</p>

            <p>Best regards,<br>
            <strong>Rwanda Immigration Services</strong><br>
            Ministry of Immigration</p>
        </div>
        <div class=""footer"">
            <p>This is an automated message from Rwanda Immigration Services</p>
            <p>&copy; {DateTime.UtcNow.Year} Republic of Rwanda. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailWithAttachmentAsync(toEmail, subject, htmlBody, acknowledgementPdfBytes, $"Acknowledgement_{referenceNumber}.pdf");
    }
}

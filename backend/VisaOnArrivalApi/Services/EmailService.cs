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

    public async Task SendVisaConfirmationEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber, DateTime arrivalDate)
    {
        var subject = "Rwanda Visa On Arrival - Application Received";
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
        .btn {{ display: inline-block; background: #00A1DE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }}
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
            <p>Thank you for submitting your Visa On Arrival application for Rwanda. We have successfully received your application.</p>

            <div class=""reference-box"">
                <p style=""margin: 0; font-size: 14px; color: #666;"">Your Reference Number:</p>
                <div class=""reference-number"">{referenceNumber}</div>
                <p style=""margin: 10px 0 0 0; font-size: 12px; color: #666;"">Please save this number for your records</p>
            </div>

            <div class=""info-box"">
                <h3 style=""margin-top: 0; color: #20603D;"">Application Details</h3>
                <p><strong>Name:</strong> {firstName} {lastName}</p>
                <p><strong>Expected Arrival:</strong> {arrivalDate:MMMM dd, yyyy}</p>
                <p><strong>Application Status:</strong> Pending Review</p>
            </div>

            <h3 style=""color: #20603D;"">What's Next?</h3>
            <ol>
                <li><strong>Save Your Reference Number:</strong> Keep the reference number {referenceNumber} safe. You'll need it at the airport.</li>
                <li><strong>Prepare Documents:</strong> Ensure you have your passport, return ticket, and accommodation details.</li>
                <li><strong>At the Airport:</strong> Present your reference number at the Visa On Arrival counter at Kigali International Airport.</li>
                <li><strong>Payment:</strong> The visa fee of USD $50 will be collected at the airport.</li>
            </ol>

            <div class=""info-box"">
                <h4 style=""margin-top: 0; color: #20603D;"">Important Reminders</h4>
                <ul style=""margin: 10px 0;"">
                    <li>Arrive at least 3 hours before your flight</li>
                    <li>Have USD $50 ready for the visa fee</li>
                    <li>Your passport must be valid for at least 6 months</li>
                    <li>Proof of accommodation and return ticket may be requested</li>
                </ul>
            </div>

            <p>If you have any questions, please don't hesitate to contact the Rwanda Immigration Department.</p>

            <p style=""margin-top: 30px;"">
                <strong>Warm Regards,</strong><br>
                Rwanda Immigration Services<br>
                <em>""Rwanda - Remarkable, Rwanda""</em>
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

    public async Task SendVisaRejectionEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber, string reason)
    {
        var subject = "Rwanda Visa On Arrival - Application Status Update";
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

            var emailSettings = _configuration.GetSection("EmailSettings");
            var smtpHost = emailSettings["SmtpHost"];
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");

            // Check environment variables first, then fall back to appsettings
            var smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? emailSettings["SmtpUsername"];
            var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? emailSettings["SmtpPassword"];

            var fromEmail = emailSettings["FromEmail"];
            var fromName = emailSettings["FromName"];

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
}

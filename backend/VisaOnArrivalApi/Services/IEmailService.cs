namespace VisaOnArrivalApi.Services;

public interface IEmailService
{
    Task SendVisaConfirmationEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber, DateTime arrivalDate);
    Task SendVisaApprovalEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber);
    Task SendVisaRejectionEmailAsync(string toEmail, string firstName, string lastName, string referenceNumber, string reason);
}

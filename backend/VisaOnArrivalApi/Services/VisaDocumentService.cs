using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using VisaOnArrivalApi.Models;
using QRCoder;

namespace VisaOnArrivalApi.Services;

public class VisaDocumentService : IVisaDocumentService
{
    private readonly IConfiguration _configuration;

    public VisaDocumentService(IConfiguration configuration)
    {
        _configuration = configuration;
        // Set QuestPDF license - Community license for non-commercial use
        QuestPDF.Settings.License = LicenseType.Community;
    }

    private byte[] GenerateQRCode(string text)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }

    public byte[] GenerateVisaDocument(VisaApplication application)
    {
        // Calculate visa validity (30 days from arrival date)
        var visaValidFrom = application.ArrivalDate;
        var visaValidUntil = application.ExpectedDepartureDate;
        var durationOfStay = (visaValidUntil - visaValidFrom).Days;

        // Generate QR code with verification URL
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var verificationUrl = $"{frontendUrl}/verify/{application.ReferenceNumber}";
        var qrCodeBytes = GenerateQRCode(verificationUrl);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                page.Header()
                    .Height(120)
                    .Background(Colors.Blue.Lighten3)
                    .Padding(20)
                    .Column(column =>
                    {
                        column.Item().AlignCenter().Text("REPUBLIC OF RWANDA")
                            .FontSize(20).Bold().FontColor(Colors.Blue.Darken2);
                        column.Item().AlignCenter().Text("MINISTRY OF IMMIGRATION")
                            .FontSize(14).SemiBold();
                        column.Item().PaddingTop(10).AlignCenter().Text("TEMPORARY VISA ON ARRIVAL")
                            .FontSize(16).Bold().FontColor(Colors.Blue.Darken1);
                    });

                page.Content()
                    .PaddingTop(20)
                    .Column(column =>
                    {
                        // Reference Number Box
                        column.Item().BorderBottom(2).BorderColor(Colors.Blue.Medium).PaddingBottom(10)
                            .Row(row =>
                            {
                                row.RelativeItem().Text($"Reference Number: {application.ReferenceNumber}")
                                    .FontSize(12).Bold();
                                row.RelativeItem().AlignRight().Text($"Issue Date: {DateTime.UtcNow:dd MMM yyyy}")
                                    .FontSize(10);
                            });

                        column.Item().PaddingTop(20).Text("VISA HOLDER INFORMATION")
                            .FontSize(13).Bold().FontColor(Colors.Blue.Darken1);

                        column.Item().PaddingTop(10).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                            });

                            // Personal Information
                            AddTableRow(table, "Full Name:", $"{application.FirstName} {application.LastName}");
                            AddTableRow(table, "Date of Birth:", application.DateOfBirth.ToString("dd MMM yyyy"));
                            AddTableRow(table, "Nationality:", application.Nationality);
                            AddTableRow(table, "Passport Number:", application.PassportNumber);
                            AddTableRow(table, "Contact Number:", application.ContactNumber);
                            AddTableRow(table, "Email Address:", application.Email);
                        });

                        column.Item().PaddingTop(20).Text("VISA DETAILS")
                            .FontSize(13).Bold().FontColor(Colors.Blue.Darken1);

                        column.Item().PaddingTop(10).Background(Colors.Grey.Lighten3).Padding(15)
                            .Column(innerColumn =>
                            {
                                innerColumn.Item().Text($"Visa Type: Temporary Visa on Arrival").SemiBold();
                                innerColumn.Item().PaddingTop(5).Text($"Valid From: {visaValidFrom:dd MMM yyyy}");
                                innerColumn.Item().PaddingTop(5).Text($"Valid Until: {visaValidUntil:dd MMM yyyy}");
                                innerColumn.Item().PaddingTop(5).Text($"Duration of Stay: {durationOfStay} days");
                                innerColumn.Item().PaddingTop(5).Text($"Purpose of Visit: {application.PurposeOfVisit}");
                                innerColumn.Item().PaddingTop(5).Text($"Accommodation: {application.AccommodationAddress}");
                            });

                        column.Item().PaddingTop(20).Text("TERMS AND CONDITIONS")
                            .FontSize(12).Bold().FontColor(Colors.Blue.Darken1);

                        column.Item().PaddingTop(10).Column(termsColumn =>
                        {
                            termsColumn.Item().Text("• This visa is valid only for the dates specified above.").FontSize(9);
                            termsColumn.Item().Text("• The holder must depart Rwanda on or before the expiry date.").FontSize(9);
                            termsColumn.Item().Text("• This visa does not permit the holder to engage in employment.").FontSize(9);
                            termsColumn.Item().Text("• The holder must comply with all Rwandan immigration laws.").FontSize(9);
                            termsColumn.Item().Text("• This visa may be revoked if the holder violates any conditions.").FontSize(9);
                        });

                        column.Item().PaddingTop(30).AlignCenter()
                            .Text($"Generated on: {DateTime.UtcNow:dd MMM yyyy HH:mm} UTC")
                            .FontSize(8).Italic().FontColor(Colors.Grey.Darken1);
                    });

                page.Footer()
                    .Height(80)
                    .Background(Colors.Blue.Lighten3)
                    .Padding(10)
                    .Row(row =>
                    {
                        row.RelativeItem().Column(column =>
                        {
                            column.Item().AlignCenter().Text(text =>
                            {
                                text.Span("This is an official document issued by the Republic of Rwanda. ").FontSize(8);
                                text.Span($"Reference: {application.ReferenceNumber}").FontSize(8).Bold();
                            });
                            column.Item().PaddingTop(5).AlignCenter().Text("Scan QR code to verify this document")
                                .FontSize(7).Italic();
                        });
                        row.ConstantItem(60).AlignRight().AlignMiddle().Image(qrCodeBytes).FitArea();
                    });
            });
        });

        return document.GeneratePdf();
    }

    private static void AddTableRow(TableDescriptor table, string label, string value)
    {
        table.Cell().PaddingVertical(5).Text(label).SemiBold().FontSize(10);
        table.Cell().PaddingVertical(5).Text(value).FontSize(10);
    }

    public byte[] GenerateAcknowledgementDocument(VisaApplication application)
    {
        // Generate QR code with officer action URL
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var officerActionUrl = $"{frontendUrl}/officer/quick-action/{application.ReferenceNumber}";
        var qrCodeBytes = GenerateQRCode(officerActionUrl);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                page.Header()
                    .Height(120)
                    .Background(Colors.Green.Lighten3)
                    .Padding(20)
                    .Column(column =>
                    {
                        column.Item().AlignCenter().Text("REPUBLIC OF RWANDA")
                            .FontSize(20).Bold().FontColor(Colors.Green.Darken2);
                        column.Item().AlignCenter().Text("MINISTRY OF IMMIGRATION")
                            .FontSize(14).SemiBold();
                        column.Item().PaddingTop(10).AlignCenter().Text("VISA APPLICATION ACKNOWLEDGEMENT")
                            .FontSize(16).Bold().FontColor(Colors.Green.Darken1);
                    });

                page.Content()
                    .PaddingTop(20)
                    .Column(column =>
                    {
                        // Success Message
                        column.Item().PaddingBottom(20).AlignCenter()
                            .Column(innerColumn =>
                            {
                                innerColumn.Item().AlignCenter().Text("✓")
                                    .FontSize(48).FontColor(Colors.Green.Medium).Bold();
                                innerColumn.Item().AlignCenter().Text("Registration Received Successfully")
                                    .FontSize(16).Bold().FontColor(Colors.Green.Darken1);
                            });

                        // Reference Number Box
                        column.Item().PaddingVertical(15).Background(Colors.Green.Lighten4).Padding(15)
                            .AlignCenter()
                            .Column(refColumn =>
                            {
                                refColumn.Item().AlignCenter().Text("Your Reference Number")
                                    .FontSize(12).FontColor(Colors.Grey.Darken1);
                                refColumn.Item().AlignCenter().Text(application.ReferenceNumber)
                                    .FontSize(24).Bold().FontColor(Colors.Green.Darken2);
                                refColumn.Item().PaddingTop(5).AlignCenter().Text("Present this at the airport immigration counter")
                                    .FontSize(9).Italic().FontColor(Colors.Grey.Darken1);
                            });

                        column.Item().PaddingTop(20).Text("REGISTRATION DETAILS")
                            .FontSize(13).Bold().FontColor(Colors.Green.Darken1);

                        column.Item().PaddingTop(10).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                            });

                            AddTableRow(table, "Applicant Name:", $"{application.FirstName} {application.LastName}");
                            AddTableRow(table, "Nationality:", application.Nationality);
                            AddTableRow(table, "Passport Number:", application.PassportNumber);
                            AddTableRow(table, "Email:", application.Email);
                            AddTableRow(table, "Contact Number:", application.ContactNumber);
                            AddTableRow(table, "Purpose of Visit:", application.PurposeOfVisit);
                            AddTableRow(table, "Expected Arrival:", application.ArrivalDate.ToString("dd MMM yyyy"));
                            AddTableRow(table, "Expected Departure:", application.ExpectedDepartureDate.ToString("dd MMM yyyy"));
                            AddTableRow(table, "Registration Date:", application.ApplicationDate.ToString("dd MMM yyyy HH:mm"));
                        });

                        column.Item().PaddingTop(20).Text("AT THE AIRPORT")
                            .FontSize(13).Bold().FontColor(Colors.Green.Darken1);

                        column.Item().PaddingTop(10).Column(stepsColumn =>
                        {
                            stepsColumn.Item().PaddingBottom(5).Text("1. Present this document and your reference number at immigration")
                                .FontSize(10);
                            stepsColumn.Item().PaddingBottom(5).Text("2. Pay the visa fee of USD $50")
                                .FontSize(10);
                            stepsColumn.Item().PaddingBottom(5).Text("3. Receive your visa stamp")
                                .FontSize(10);
                        });

                        // Large QR Code Section - Main Focus
                        column.Item().PaddingTop(30).AlignCenter()
                            .Column(qrSection =>
                            {
                                qrSection.Item().AlignCenter().Text("IMMIGRATION OFFICER VERIFICATION")
                                    .FontSize(14).Bold().FontColor(Colors.Blue.Darken2);
                                qrSection.Item().PaddingTop(5).AlignCenter().Text("Scan QR code for quick processing")
                                    .FontSize(11).FontColor(Colors.Grey.Darken1);

                                qrSection.Item().PaddingTop(15).AlignCenter()
                                    .Border(3).BorderColor(Colors.Blue.Medium).Padding(20)
                                    .Width(250).Height(250)
                                    .Image(qrCodeBytes).FitArea();

                                qrSection.Item().PaddingTop(10).AlignCenter().Text("Officer access required")
                                    .FontSize(9).Italic().FontColor(Colors.Grey.Medium);
                            });
                    });

                page.Footer()
                    .Height(50)
                    .Background(Colors.Green.Lighten3)
                    .Padding(10)
                    .AlignCenter()
                    .AlignMiddle()
                    .Column(column =>
                    {
                        column.Item().AlignCenter().Text("Republic of Rwanda - Immigration Services")
                            .FontSize(9).SemiBold();
                        column.Item().AlignCenter().Text($"Generated on: {DateTime.UtcNow:dd MMM yyyy HH:mm} UTC")
                            .FontSize(7).Italic().FontColor(Colors.Grey.Darken1);
                    });
            });
        });

        return document.GeneratePdf();
    }
}

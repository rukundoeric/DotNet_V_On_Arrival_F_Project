using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Services;

public class VisaDocumentService : IVisaDocumentService
{
    public VisaDocumentService()
    {
        // Set QuestPDF license - Community license for non-commercial use
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateVisaDocument(VisaApplication application)
    {
        // Calculate visa validity (30 days from arrival date)
        var visaValidFrom = application.ArrivalDate;
        var visaValidUntil = application.ExpectedDepartureDate;
        var durationOfStay = (visaValidUntil - visaValidFrom).Days;

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
                    .Height(50)
                    .Background(Colors.Blue.Lighten3)
                    .Padding(10)
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("This is an official document issued by the Republic of Rwanda. ").FontSize(8);
                        text.Span($"Reference: {application.ReferenceNumber}").FontSize(8).Bold();
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
}

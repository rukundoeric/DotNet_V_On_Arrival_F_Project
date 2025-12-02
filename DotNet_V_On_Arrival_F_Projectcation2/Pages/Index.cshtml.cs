using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using DotNet_V_On_Arrival_F_Projectcation2.Data;
using DotNet_V_On_Arrival_F_Projectcation2.Models;

namespace DotNet_V_On_Arrival_F_Projectcation2.Pages;

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly ApplicationDbContext _context;

    public IndexModel(ILogger<IndexModel> logger, ApplicationDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [BindProperty]
    public VisaApplicationInput Input { get; set; } = new();

    public string? ReferenceNumber { get; set; }
    public bool ShowSuccess { get; set; }

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            return Page();
        }

        // Generate unique reference number
        var referenceNumber = GenerateReferenceNumber();

        var visaApplication = new VisaApplication
        {
            ReferenceNumber = referenceNumber,
            FirstName = Input.FirstName,
            LastName = Input.LastName,
            Email = Input.Email,
            PassportNumber = Input.PassportNumber,
            Nationality = Input.Nationality,
            DateOfBirth = Input.DateOfBirth,
            ContactNumber = Input.ContactNumber,
            ArrivalDate = Input.ArrivalDate,
            ExpectedDepartureDate = Input.ExpectedDepartureDate,
            PurposeOfVisit = Input.PurposeOfVisit,
            AccommodationAddress = Input.AccommodationAddress,
            ApplicationStatus = ApplicationStatus.Pending,
            ApplicationDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.VisaApplications.Add(visaApplication);
        await _context.SaveChangesAsync();

        ReferenceNumber = referenceNumber;
        ShowSuccess = true;
        ModelState.Clear();
        Input = new();

        return Page();
    }

    private string GenerateReferenceNumber()
    {
        var year = DateTime.UtcNow.ToString("yy");
        var dayOfYear = DateTime.UtcNow.DayOfYear.ToString("D3");
        var random = new Random().Next(100, 999);
        return $"RW{year}{dayOfYear}{random}";
    }
}

public class VisaApplicationInput
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PassportNumber { get; set; } = string.Empty;
    public string Nationality { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string ContactNumber { get; set; } = string.Empty;
    public DateTime ArrivalDate { get; set; }
    public DateTime ExpectedDepartureDate { get; set; }
    public string PurposeOfVisit { get; set; } = string.Empty;
    public string AccommodationAddress { get; set; } = string.Empty;
}
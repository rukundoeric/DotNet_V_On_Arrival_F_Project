using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Data;
using VisaOnArrivalApi.Models;
using VisaOnArrivalApi.DTOs;
using VisaOnArrivalApi.Services;
using VisaOnArrivalApi.Authorization;

namespace VisaOnArrivalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisaApplicationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VisaApplicationsController> _logger;
    private readonly IEmailService _emailService;
    private readonly IVisaDocumentService _visaDocumentService;

    public VisaApplicationsController(ApplicationDbContext context, ILogger<VisaApplicationsController> logger, IEmailService emailService, IVisaDocumentService visaDocumentService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
        _visaDocumentService = visaDocumentService;
    }

    // GET: api/VisaApplications
    [HttpGet]
    [RequirePermission("visa_applications.view")]
    public async Task<ActionResult<IEnumerable<VisaApplicationResponseDto>>> GetVisaApplications()
    {
        try
        {
            _logger.LogInformation("Retrieving all visa applications");
            var applications = await _context.VisaApplications
                .Include(v => v.ArrivalRecord)
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} visa applications", applications.Count);
            return applications.Select(v => MapToDto(v)).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving visa applications");
            return StatusCode(500, "An error occurred while retrieving visa applications");
        }
    }

    // GET: api/VisaApplications/my-applications
    [HttpGet("my-applications")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<ActionResult<IEnumerable<VisaApplicationResponseDto>>> GetMyApplications()
    {
        try
        {
            // Get user ID from JWT claims
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Invalid user claims" });
            }

            _logger.LogInformation("Retrieving applications for user ID: {UserId}", userId);

            // Get applications linked to this user
            var applications = await _context.UserApplications
                .Where(ua => ua.UserId == userId)
                .Include(ua => ua.VisaApplication)
                    .ThenInclude(v => v.ArrivalRecord)
                .Select(ua => ua.VisaApplication)
                .OrderByDescending(v => v.ApplicationDate)
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} applications for user ID: {UserId}", applications.Count, userId);
            return applications.Select(v => MapToDto(v)).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving user applications");
            return StatusCode(500, "An error occurred while retrieving your applications");
        }
    }

    // GET: api/VisaApplications/5
    [HttpGet("{id}")]
    [RequirePermission("visa_applications.view")]
    public async Task<ActionResult<VisaApplicationResponseDto>> GetVisaApplication(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving visa application with ID: {Id}", id);
            var visaApplication = await _context.VisaApplications
                .Include(v => v.ArrivalRecord)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (visaApplication == null)
            {
                _logger.LogWarning("Visa application with ID: {Id} not found", id);
                return NotFound();
            }

            _logger.LogInformation("Successfully retrieved visa application with ID: {Id}", id);
            return MapToDto(visaApplication);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving visa application with ID: {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the visa application");
        }
    }

    // GET: api/VisaApplications/reference/{referenceNumber}
    [HttpGet("reference/{referenceNumber}")]
    [RequirePermission("visa_applications.view")]
    public async Task<ActionResult<VisaApplicationResponseDto>> GetByReferenceNumber(string referenceNumber)
    {
        try
        {
            _logger.LogInformation("Retrieving visa application with reference number: {ReferenceNumber}", referenceNumber);
            var visaApplication = await _context.VisaApplications
                .Include(v => v.ArrivalRecord)
                .FirstOrDefaultAsync(v => v.ReferenceNumber == referenceNumber);

            if (visaApplication == null)
            {
                _logger.LogWarning("Visa application with reference number: {ReferenceNumber} not found", referenceNumber);
                return NotFound();
            }

            _logger.LogInformation("Successfully retrieved visa application with reference number: {ReferenceNumber}", referenceNumber);
            return MapToDto(visaApplication);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving visa application with reference number: {ReferenceNumber}", referenceNumber);
            return StatusCode(500, "An error occurred while retrieving the visa application");
        }
    }

    // GET: api/VisaApplications/verify/{referenceNumber}
    // Public endpoint - no authentication required
    [HttpGet("verify/{referenceNumber}")]
    public async Task<ActionResult<object>> VerifyVisaApplication(string referenceNumber)
    {
        try
        {
            _logger.LogInformation("Public verification request for reference number: {ReferenceNumber}", referenceNumber);
            var visaApplication = await _context.VisaApplications
                .Include(v => v.ArrivalRecord)
                .FirstOrDefaultAsync(v => v.ReferenceNumber == referenceNumber);

            if (visaApplication == null)
            {
                _logger.LogWarning("Verification failed - reference number not found: {ReferenceNumber}", referenceNumber);
                return NotFound(new {
                    found = false,
                    message = "No visa application found with this reference number"
                });
            }

            // Check if visa is still valid based on departure date
            var isValid = false;
            var validityStatus = "Unknown";

            if (visaApplication.ApplicationStatus == ApplicationStatus.Approved)
            {
                // Check if current date is within validity period
                var now = DateTime.UtcNow;

                // If person has actually arrived, use actual arrival date for validation
                var effectiveArrivalDate = visaApplication.ArrivalRecord?.ActualArrivalDate ?? visaApplication.ArrivalDate;

                // If person has departed, they can no longer use the visa
                if (visaApplication.ArrivalRecord?.ActualDepartureDate != null)
                {
                    isValid = false;
                    validityStatus = "Departed - No Longer Valid";
                }
                // Check if within validity period (has arrived or arrival date has passed)
                else if (now >= effectiveArrivalDate && now <= visaApplication.ExpectedDepartureDate)
                {
                    isValid = true;
                    validityStatus = "Valid";
                }
                // Not yet arrival date
                else if (now < visaApplication.ArrivalDate)
                {
                    isValid = true;
                    validityStatus = "Not Yet Active";
                }
                // Past departure date
                else
                {
                    isValid = false;
                    validityStatus = "Expired";
                }
            }
            else if (visaApplication.ApplicationStatus == ApplicationStatus.Pending)
            {
                validityStatus = "Pending Approval";
            }
            else if (visaApplication.ApplicationStatus == ApplicationStatus.Rejected)
            {
                validityStatus = "Rejected";
            }

            var response = new
            {
                found = true,
                isValid = isValid,
                validityStatus = validityStatus,
                referenceNumber = visaApplication.ReferenceNumber,
                firstName = visaApplication.FirstName,
                lastName = visaApplication.LastName,
                nationality = visaApplication.Nationality,
                passportNumber = visaApplication.PassportNumber,
                applicationStatus = visaApplication.ApplicationStatus.ToString(),
                arrivalDate = visaApplication.ArrivalDate,
                expectedDepartureDate = visaApplication.ExpectedDepartureDate,
                purposeOfVisit = visaApplication.PurposeOfVisit,
                applicationDate = visaApplication.ApplicationDate,
                hasArrived = visaApplication.ArrivalRecord?.ActualArrivalDate != null,
                hasDeparted = visaApplication.ArrivalRecord?.ActualDepartureDate != null
            };

            _logger.LogInformation("Verification successful for reference number: {ReferenceNumber}, Status: {Status}",
                referenceNumber, validityStatus);

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during verification for reference number: {ReferenceNumber}", referenceNumber);
            return StatusCode(500, new {
                found = false,
                message = "An error occurred while verifying the visa application"
            });
        }
    }

    // POST: api/VisaApplications
    // Public endpoint - no authentication required for visa application submission
    [HttpPost]
    public async Task<ActionResult<VisaApplicationResponseDto>> CreateVisaApplication(CreateVisaApplicationDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for visa application creation");
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Creating new visa application for {FirstName} {LastName}", dto.FirstName, dto.LastName);
            var referenceNumber = GenerateReferenceNumber();

            var visaApplication = new VisaApplication
            {
                ReferenceNumber = referenceNumber,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PassportNumber = dto.PassportNumber,
                Nationality = dto.Nationality,
                DateOfBirth = dto.DateOfBirth,
                ContactNumber = dto.ContactNumber,
                ArrivalDate = dto.ArrivalDate,
                ExpectedDepartureDate = dto.ExpectedDepartureDate,
                PurposeOfVisit = dto.PurposeOfVisit,
                AccommodationAddress = dto.AccommodationAddress,
                ApplicationStatus = ApplicationStatus.Pending,
                ApplicationDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.VisaApplications.Add(visaApplication);
            await _context.SaveChangesAsync();

            // If user is authenticated, link this application to their account
            if (User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
                {
                    var userApplication = new UserApplication
                    {
                        UserId = userId,
                        VisaApplicationId = visaApplication.Id,
                        LinkedAt = DateTime.UtcNow
                    };
                    _context.UserApplications.Add(userApplication);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Linked application {ApplicationId} to user {UserId}", visaApplication.Id, userId);
                }
            }

            _logger.LogInformation("Successfully created visa application with reference number: {ReferenceNumber}", referenceNumber);

            // Send confirmation email in background (fire-and-forget)
            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendVisaConfirmationEmailAsync(
                        dto.Email,
                        dto.FirstName,
                        dto.LastName,
                        referenceNumber,
                        dto.ArrivalDate
                    );
                    _logger.LogInformation("Confirmation email sent to {Email} for reference number: {ReferenceNumber}", dto.Email, referenceNumber);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send confirmation email to {Email} for reference number: {ReferenceNumber}", dto.Email, referenceNumber);
                }
            });

            return CreatedAtAction(nameof(GetVisaApplication), new { id = visaApplication.Id }, MapToDto(visaApplication));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating visa application for {FirstName} {LastName}", dto.FirstName, dto.LastName);
            return StatusCode(500, "An error occurred while creating the visa application");
        }
    }

    // PUT: api/VisaApplications/5
    [HttpPut("{id}")]
    [RequirePermission("visa_applications.update")]
    public async Task<IActionResult> UpdateVisaApplication(int id, VisaApplication visaApplication)
    {
        try
        {
            if (id != visaApplication.Id)
            {
                _logger.LogWarning("ID mismatch: URL ID {UrlId} does not match body ID {BodyId}", id, visaApplication.Id);
                return BadRequest();
            }

            _logger.LogInformation("Updating visa application with ID: {Id}", id);

            // Get the old status before updating
            var existingApplication = await _context.VisaApplications.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id);
            if (existingApplication == null)
            {
                _logger.LogWarning("Visa application with ID: {Id} not found during update", id);
                return NotFound();
            }

            var oldStatus = existingApplication.ApplicationStatus;
            var newStatus = visaApplication.ApplicationStatus;

            _context.Entry(visaApplication).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully updated visa application with ID: {Id}", id);

                // Send email if status changed to Approved or Rejected (in background)
                if (oldStatus != newStatus)
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            if (newStatus == ApplicationStatus.Approved)
                            {
                                await _emailService.SendVisaApprovalEmailAsync(
                                    visaApplication.Email,
                                    visaApplication.FirstName,
                                    visaApplication.LastName,
                                    visaApplication.ReferenceNumber
                                );
                                _logger.LogInformation("Approval email sent to {Email} for reference number: {ReferenceNumber}",
                                    visaApplication.Email, visaApplication.ReferenceNumber);
                            }
                            else if (newStatus == ApplicationStatus.Rejected)
                            {
                                await _emailService.SendVisaRejectionEmailAsync(
                                    visaApplication.Email,
                                    visaApplication.FirstName,
                                    visaApplication.LastName,
                                    visaApplication.ReferenceNumber,
                                    "Please contact immigration services for more information"
                                );
                                _logger.LogInformation("Rejection email sent to {Email} for reference number: {ReferenceNumber}",
                                    visaApplication.Email, visaApplication.ReferenceNumber);
                            }
                        }
                        catch (Exception emailEx)
                        {
                            _logger.LogWarning(emailEx, "Failed to send status change email to {Email} for reference number: {ReferenceNumber}",
                                visaApplication.Email, visaApplication.ReferenceNumber);
                        }
                    });
                }
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!VisaApplicationExists(id))
                {
                    _logger.LogWarning("Visa application with ID: {Id} not found during update", id);
                    return NotFound();
                }
                else
                {
                    _logger.LogError(ex, "Concurrency error while updating visa application with ID: {Id}", id);
                    throw;
                }
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating visa application with ID: {Id}", id);
            return StatusCode(500, "An error occurred while updating the visa application");
        }
    }

    // DELETE: api/VisaApplications/5
    [HttpDelete("{id}")]
    [RequirePermission("visa_applications.delete")]
    public async Task<IActionResult> DeleteVisaApplication(int id)
    {
        try
        {
            _logger.LogInformation("Deleting visa application with ID: {Id}", id);
            var visaApplication = await _context.VisaApplications.FindAsync(id);
            if (visaApplication == null)
            {
                _logger.LogWarning("Visa application with ID: {Id} not found for deletion", id);
                return NotFound();
            }

            _context.VisaApplications.Remove(visaApplication);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted visa application with ID: {Id}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting visa application with ID: {Id}", id);
            return StatusCode(500, "An error occurred while deleting the visa application");
        }
    }

    // POST: api/VisaApplications/5/approve
    [HttpPost("{id}/approve")]
    [RequirePermission("visa_applications.approve")]
    public async Task<IActionResult> ApproveVisaApplication(int id)
    {
        try
        {
            _logger.LogInformation("Approving visa application with ID: {Id}", id);
            var visaApplication = await _context.VisaApplications.FindAsync(id);

            if (visaApplication == null)
            {
                _logger.LogWarning("Visa application with ID: {Id} not found", id);
                return NotFound(new { message = "Visa application not found" });
            }

            if (visaApplication.ApplicationStatus == ApplicationStatus.Approved)
            {
                return BadRequest(new { message = "Visa application is already approved" });
            }

            visaApplication.ApplicationStatus = ApplicationStatus.Approved;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Visa application with ID: {Id} approved successfully", id);

            // Generate PDF and send approval email with document in background
            _ = Task.Run(async () =>
            {
                try
                {
                    _logger.LogInformation("Generating visa document PDF for reference number: {ReferenceNumber}", visaApplication.ReferenceNumber);

                    // Generate PDF document
                    byte[] visaPdfBytes = _visaDocumentService.GenerateVisaDocument(visaApplication);

                    _logger.LogInformation("PDF generated successfully ({Size} bytes), sending email to {Email}",
                        visaPdfBytes.Length, visaApplication.Email);

                    // Send email with PDF attachment
                    await _emailService.SendVisaApprovalEmailWithDocumentAsync(
                        visaApplication.Email,
                        visaApplication.FirstName,
                        visaApplication.LastName,
                        visaApplication.ReferenceNumber,
                        visaPdfBytes
                    );

                    _logger.LogInformation("Approval email with visa document sent to {Email} for reference number: {ReferenceNumber}",
                        visaApplication.Email, visaApplication.ReferenceNumber);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send approval email with document to {Email} for reference number: {ReferenceNumber}",
                        visaApplication.Email, visaApplication.ReferenceNumber);
                }
            });

            return Ok(new { message = "Visa application approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while approving visa application with ID: {Id}", id);
            return StatusCode(500, "An error occurred while approving the visa application");
        }
    }

    // POST: api/VisaApplications/5/reject
    [HttpPost("{id}/reject")]
    [RequirePermission("visa_applications.reject")]
    public async Task<IActionResult> RejectVisaApplication(int id, [FromBody] RejectVisaApplicationDto rejectDto)
    {
        try
        {
            _logger.LogInformation("Rejecting visa application with ID: {Id}", id);
            var visaApplication = await _context.VisaApplications.FindAsync(id);

            if (visaApplication == null)
            {
                _logger.LogWarning("Visa application with ID: {Id} not found", id);
                return NotFound(new { message = "Visa application not found" });
            }

            if (visaApplication.ApplicationStatus == ApplicationStatus.Rejected)
            {
                return BadRequest(new { message = "Visa application is already rejected" });
            }

            visaApplication.ApplicationStatus = ApplicationStatus.Rejected;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Visa application with ID: {Id} rejected successfully", id);

            // Send rejection email in background
            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendVisaRejectionEmailAsync(
                        visaApplication.Email,
                        visaApplication.FirstName,
                        visaApplication.LastName,
                        visaApplication.ReferenceNumber,
                        rejectDto?.Reason ?? "Please contact immigration services for more information"
                    );
                    _logger.LogInformation("Rejection email sent to {Email} for reference number: {ReferenceNumber}",
                        visaApplication.Email, visaApplication.ReferenceNumber);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning(emailEx, "Failed to send rejection email to {Email} for reference number: {ReferenceNumber}",
                        visaApplication.Email, visaApplication.ReferenceNumber);
                }
            });

            return Ok(new { message = "Visa application rejected successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while rejecting visa application with ID: {Id}", id);
            return StatusCode(500, "An error occurred while rejecting the visa application");
        }
    }

    // GET: api/VisaApplications/5/visa-document
    [HttpGet("{id}/visa-document")]
    [RequirePermission("visa_applications.view")]
    public async Task<IActionResult> DownloadVisaDocument(int id)
    {
        try
        {
            _logger.LogInformation("Generating visa document for application ID: {Id}", id);
            var visaApplication = await _context.VisaApplications.FindAsync(id);

            if (visaApplication == null)
            {
                _logger.LogWarning("Visa application with ID: {Id} not found", id);
                return NotFound(new { message = "Visa application not found" });
            }

            if (visaApplication.ApplicationStatus != ApplicationStatus.Approved)
            {
                _logger.LogWarning("Attempt to download visa document for non-approved application ID: {Id}", id);
                return BadRequest(new { message = "Visa document can only be generated for approved applications" });
            }

            _logger.LogInformation("Generating PDF for approved application with reference number: {ReferenceNumber}", visaApplication.ReferenceNumber);

            // Generate PDF document
            byte[] visaPdfBytes = _visaDocumentService.GenerateVisaDocument(visaApplication);

            _logger.LogInformation("PDF generated successfully ({Size} bytes) for reference number: {ReferenceNumber}",
                visaPdfBytes.Length, visaApplication.ReferenceNumber);

            // Return PDF file
            return File(visaPdfBytes, "application/pdf", $"Rwanda-Visa-{visaApplication.ReferenceNumber}.pdf");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while generating visa document for application ID: {Id}", id);
            return StatusCode(500, "An error occurred while generating the visa document");
        }
    }

    private bool VisaApplicationExists(int id)
    {
        return _context.VisaApplications.Any(e => e.Id == id);
    }

    private string GenerateReferenceNumber()
    {
        var year = DateTime.UtcNow.ToString("yy");
        var dayOfYear = DateTime.UtcNow.DayOfYear.ToString("D3");
        var random = new Random().Next(100, 999);
        return $"RW{year}{dayOfYear}{random}";
    }

    private VisaApplicationResponseDto MapToDto(VisaApplication application)
    {
        return new VisaApplicationResponseDto
        {
            Id = application.Id,
            ReferenceNumber = application.ReferenceNumber,
            FirstName = application.FirstName,
            LastName = application.LastName,
            Email = application.Email,
            PassportNumber = application.PassportNumber,
            Nationality = application.Nationality,
            DateOfBirth = application.DateOfBirth,
            ContactNumber = application.ContactNumber,
            ArrivalDate = application.ArrivalDate,
            ExpectedDepartureDate = application.ExpectedDepartureDate,
            PurposeOfVisit = application.PurposeOfVisit,
            AccommodationAddress = application.AccommodationAddress,
            ApplicationStatus = application.ApplicationStatus.ToString(),
            ApplicationDate = application.ApplicationDate
        };
    }
}

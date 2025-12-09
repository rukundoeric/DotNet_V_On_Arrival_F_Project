using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Data;
using VisaOnArrivalApi.Models;
using VisaOnArrivalApi.DTOs;

namespace VisaOnArrivalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisaApplicationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VisaApplicationsController> _logger;

    public VisaApplicationsController(ApplicationDbContext context, ILogger<VisaApplicationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/VisaApplications
    [HttpGet]
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

    // GET: api/VisaApplications/5
    [HttpGet("{id}")]
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

    // POST: api/VisaApplications
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

            _logger.LogInformation("Successfully created visa application with reference number: {ReferenceNumber}", referenceNumber);
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
            _context.Entry(visaApplication).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully updated visa application with ID: {Id}", id);
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

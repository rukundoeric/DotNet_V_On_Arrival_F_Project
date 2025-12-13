using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VisaOnArrivalApi.Data;
using VisaOnArrivalApi.DTOs.ArrivalRecord;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Controllers;

[ApiController]
[Route("api/private/[controller]")]
public class ArrivalRecordsPrivateController: ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ArrivalRecordsController> _logger;

    public ArrivalRecordsController(ApplicationDbContext context, ILogger<ArrivalRecordsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/ArrivalRecords
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetArrivalRecords()
    {
        try
        {
            _logger.LogInformation("Retrieving all arrival records");
            var records = await _context.ArrivalRecords
                .Include(a => a.VisaApplication)
                .Select(a => new
                {
                    a.Id,
                    a.VisaApplicationId,
                    a.EntryStatus,
                    a.ActualArrivalDate,
                    a.ActualDepartureDate,
                    a.ApprovedByUserId,
                    a.ArrivalProcessedByUserId,
                    a.DepartureProcessedByUserId,
                    a.RejectionReason,
                    a.CreatedAt,
                    a.UpdatedAt,
                    VisaApplication = new
                    {
                        a.VisaApplication.Id,
                        a.VisaApplication.ReferenceNumber,
                        a.VisaApplication.FirstName,
                        a.VisaApplication.LastName,
                        a.VisaApplication.PassportNumber,
                        a.VisaApplication.Nationality,
                        a.VisaApplication.ApplicationStatus
                    }
                })
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} arrival records", records.Count);
            return Ok(records);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving arrival records");
            return StatusCode(500, "An error occurred while retrieving arrival records");
        }
    }

    // GET: api/ArrivalRecords/5
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetArrivalRecord(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving arrival record with ID: {Id}", id);
            var arrivalRecord = await _context.ArrivalRecords
                .Where(a => a.Id == id)
                .Select(a => new
                {
                    a.Id,
                    a.VisaApplicationId,
                    a.EntryStatus,
                    a.ActualArrivalDate,
                    a.ActualDepartureDate,
                    a.ApprovedByUserId,
                    a.ArrivalProcessedByUserId,
                    a.DepartureProcessedByUserId,
                    a.RejectionReason,
                    a.CreatedAt,
                    a.UpdatedAt,
                    VisaApplication = new
                    {
                        a.VisaApplication.Id,
                        a.VisaApplication.ReferenceNumber,
                        a.VisaApplication.FirstName,
                        a.VisaApplication.LastName,
                        a.VisaApplication.PassportNumber,
                        a.VisaApplication.Nationality,
                        a.VisaApplication.ApplicationStatus
                    }
                })
                .FirstOrDefaultAsync();

            if (arrivalRecord == null)
            {
                _logger.LogWarning("Arrival record with ID: {Id} not found", id);
                return NotFound();
            }

            _logger.LogInformation("Successfully retrieved arrival record with ID: {Id}", id);
            return arrivalRecord;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving arrival record with ID: {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the arrival record");
        }
    }

    // POST: api/ArrivalRecords
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ArrivalRecord>> CreateArrivalRecord(CreateArrivalRecordDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for arrival record creation: {Errors}",
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user token");
            }

            _logger.LogInformation("Creating new arrival record for visa application ID: {VisaApplicationId} by user {UserId}", dto.VisaApplicationId, userId);

            // Check if the visa application exists
            var visaApplication = await _context.VisaApplications.FindAsync(dto.VisaApplicationId);
            if (visaApplication == null)
            {
                _logger.LogWarning("Visa application with ID: {VisaApplicationId} not found", dto.VisaApplicationId);
                return NotFound("Visa application not found");
            }

            // Auto-approve the application if it's not already approved
            if (visaApplication.ApplicationStatus != ApplicationStatus.Approved)
            {
                _logger.LogInformation("Auto-approving visa application ID: {VisaApplicationId} as arrival is being recorded", dto.VisaApplicationId);
                visaApplication.ApplicationStatus = ApplicationStatus.Approved;
            }

            var arrivalRecord = new ArrivalRecord
            {
                VisaApplicationId = dto.VisaApplicationId,
                ActualArrivalDate = dto.ActualArrivalDate ?? DateTime.UtcNow,
                EntryStatus = (EntryStatus)dto.EntryStatus,
                ApprovedByUserId = userId,
                ArrivalProcessedByUserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ArrivalRecords.Add(arrivalRecord);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created arrival record with ID: {Id} and auto-approved application", arrivalRecord.Id);

            // Return projected object to avoid circular reference
            var result = new
            {
                arrivalRecord.Id,
                arrivalRecord.VisaApplicationId,
                arrivalRecord.EntryStatus,
                arrivalRecord.ActualArrivalDate,
                arrivalRecord.ActualDepartureDate,
                arrivalRecord.ApprovedByUserId,
                arrivalRecord.ArrivalProcessedByUserId,
                arrivalRecord.DepartureProcessedByUserId,
                arrivalRecord.RejectionReason,
                arrivalRecord.CreatedAt,
                arrivalRecord.UpdatedAt
            };

            return CreatedAtAction(nameof(GetArrivalRecord), new { id = arrivalRecord.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating arrival record for visa application ID: {VisaApplicationId}", dto.VisaApplicationId);
            return StatusCode(500, "An error occurred while creating the arrival record");
        }
    }

    // PUT: api/ArrivalRecords/5
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateArrivalRecord(int id, UpdateArrivalRecordDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user token");
            }

            _logger.LogInformation("Updating arrival record with ID: {Id} by user {UserId}", id, userId);

            var arrivalRecord = await _context.ArrivalRecords.FindAsync(id);
            if (arrivalRecord == null)
            {
                _logger.LogWarning("Arrival record with ID: {Id} not found during update", id);
                return NotFound();
            }

            // Update fields from DTO
            if (dto.ActualArrivalDate.HasValue)
            {
                arrivalRecord.ActualArrivalDate = dto.ActualArrivalDate.Value;
                arrivalRecord.ArrivalProcessedByUserId = userId;
            }

            if (dto.ActualDepartureDate.HasValue)
            {
                arrivalRecord.ActualDepartureDate = dto.ActualDepartureDate.Value;
                arrivalRecord.DepartureProcessedByUserId = userId;
            }

            arrivalRecord.EntryStatus = (EntryStatus)dto.EntryStatus;
            arrivalRecord.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully updated arrival record with ID: {Id}", id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!ArrivalRecordExists(id))
                {
                    _logger.LogWarning("Arrival record with ID: {Id} not found during update", id);
                    return NotFound();
                }
                else
                {
                    _logger.LogError(ex, "Concurrency error while updating arrival record with ID: {Id}", id);
                    throw;
                }
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating arrival record with ID: {Id}", id);
            return StatusCode(500, "An error occurred while updating the arrival record");
        }
    }

    // DELETE: api/ArrivalRecords/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArrivalRecord(int id)
    {
        try
        {
            _logger.LogInformation("Deleting arrival record with ID: {Id}", id);
            var arrivalRecord = await _context.ArrivalRecords.FindAsync(id);
            if (arrivalRecord == null)
            {
                _logger.LogWarning("Arrival record with ID: {Id} not found for deletion", id);
                return NotFound();
            }

            _context.ArrivalRecords.Remove(arrivalRecord);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully deleted arrival record with ID: {Id}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting arrival record with ID: {Id}", id);
            return StatusCode(500, "An error occurred while deleting the arrival record");
        }
    }

    private bool ArrivalRecordExists(int id)
    {
        return _context.ArrivalRecords.Any(e => e.Id == id);
    }
}

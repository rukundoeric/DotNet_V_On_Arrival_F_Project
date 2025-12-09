using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Data;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArrivalRecordsController : ControllerBase
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
    public async Task<ActionResult<IEnumerable<ArrivalRecord>>> GetArrivalRecords()
    {
        try
        {
            _logger.LogInformation("Retrieving all arrival records");
            var records = await _context.ArrivalRecords
                .Include(a => a.VisaApplication)
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} arrival records", records.Count);
            return records;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving arrival records");
            return StatusCode(500, "An error occurred while retrieving arrival records");
        }
    }

    // GET: api/ArrivalRecords/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ArrivalRecord>> GetArrivalRecord(int id)
    {
        try
        {
            _logger.LogInformation("Retrieving arrival record with ID: {Id}", id);
            var arrivalRecord = await _context.ArrivalRecords
                .Include(a => a.VisaApplication)
                .FirstOrDefaultAsync(a => a.Id == id);

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
    public async Task<ActionResult<ArrivalRecord>> CreateArrivalRecord(ArrivalRecord arrivalRecord)
    {
        try
        {
            _logger.LogInformation("Creating new arrival record for visa application ID: {VisaApplicationId}", arrivalRecord.VisaApplicationId);
            _context.ArrivalRecords.Add(arrivalRecord);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created arrival record with ID: {Id}", arrivalRecord.Id);
            return CreatedAtAction(nameof(GetArrivalRecord), new { id = arrivalRecord.Id }, arrivalRecord);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while creating arrival record for visa application ID: {VisaApplicationId}", arrivalRecord.VisaApplicationId);
            return StatusCode(500, "An error occurred while creating the arrival record");
        }
    }

    // PUT: api/ArrivalRecords/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArrivalRecord(int id, ArrivalRecord arrivalRecord)
    {
        try
        {
            if (id != arrivalRecord.Id)
            {
                _logger.LogWarning("ID mismatch: URL ID {UrlId} does not match body ID {BodyId}", id, arrivalRecord.Id);
                return BadRequest();
            }

            _logger.LogInformation("Updating arrival record with ID: {Id}", id);
            _context.Entry(arrivalRecord).State = EntityState.Modified;

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

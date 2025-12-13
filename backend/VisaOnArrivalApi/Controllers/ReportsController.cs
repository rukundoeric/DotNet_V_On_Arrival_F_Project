using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Authorization;
using VisaOnArrivalApi.Data;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(ApplicationDbContext context, ILogger<ReportsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Reports/dashboard-stats
    [HttpGet("dashboard-stats")]
    [RequirePermission("reports.view")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var thisMonth = new DateTime(today.Year, today.Month, 1);
            var thisYear = new DateTime(today.Year, 1, 1);

            var stats = new
            {
                // Total counts
                TotalApplications = await _context.VisaApplications.CountAsync(),
                TotalUsers = await _context.Users.CountAsync(),
                TotalCountries = await _context.Countries.CountAsync(c => c.IsActive),
                TotalArrivals = await _context.ArrivalRecords.CountAsync(ar => ar.ActualArrivalDate != null),

                // Applications by status
                PendingApplications = await _context.VisaApplications.CountAsync(va => va.ApplicationStatus == ApplicationStatus.Pending),
                ApprovedApplications = await _context.VisaApplications.CountAsync(va => va.ApplicationStatus == ApplicationStatus.Approved),
                RejectedApplications = await _context.VisaApplications.CountAsync(va => va.ApplicationStatus == ApplicationStatus.Rejected),

                // Time-based stats
                ApplicationsToday = await _context.VisaApplications.CountAsync(va => va.ApplicationDate >= today),
                ApplicationsThisMonth = await _context.VisaApplications.CountAsync(va => va.ApplicationDate >= thisMonth),
                ApplicationsThisYear = await _context.VisaApplications.CountAsync(va => va.ApplicationDate >= thisYear),

                ArrivalsToday = await _context.ArrivalRecords.CountAsync(ar => ar.ActualArrivalDate.HasValue && ar.ActualArrivalDate.Value.Date == today),
                ArrivalsThisMonth = await _context.ArrivalRecords.CountAsync(ar => ar.ActualArrivalDate.HasValue && ar.ActualArrivalDate.Value >= thisMonth),
                ArrivalsThisYear = await _context.ArrivalRecords.CountAsync(ar => ar.ActualArrivalDate.HasValue && ar.ActualArrivalDate.Value >= thisYear),

                DeparturesToday = await _context.ArrivalRecords.CountAsync(ar => ar.ActualDepartureDate.HasValue && ar.ActualDepartureDate.Value.Date == today),
                DeparturesThisMonth = await _context.ArrivalRecords.CountAsync(ar => ar.ActualDepartureDate.HasValue && ar.ActualDepartureDate.Value >= thisMonth),
                DeparturesThisYear = await _context.ArrivalRecords.CountAsync(ar => ar.ActualDepartureDate.HasValue && ar.ActualDepartureDate.Value >= thisYear),

                // Users by role
                AdminCount = await _context.Users.CountAsync(u => u.Role == UserRole.Admin),
                OfficerCount = await _context.Users.CountAsync(u => u.Role == UserRole.Officer),
                UserCount = await _context.Users.CountAsync(u => u.Role == UserRole.User),

                // Active users
                ActiveUsers = await _context.Users.CountAsync(u => u.IsActive),
                InactiveUsers = await _context.Users.CountAsync(u => !u.IsActive),

                // Currently in country
                CurrentlyInCountry = await _context.ArrivalRecords.CountAsync(ar =>
                    ar.ActualArrivalDate.HasValue &&
                    !ar.ActualDepartureDate.HasValue &&
                    ar.EntryStatus == EntryStatus.Arrived)
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return StatusCode(500, "An error occurred while retrieving dashboard statistics");
        }
    }

    // GET: api/Reports/applications-by-nationality
    [HttpGet("applications-by-nationality")]
    [RequirePermission("reports.view")]
    public async Task<ActionResult<IEnumerable<object>>> GetApplicationsByNationality([FromQuery] int? limit = 10)
    {
        try
        {
            var stats = await _context.VisaApplications
                .GroupBy(va => va.Nationality)
                .Select(g => new
                {
                    Nationality = g.Key,
                    Count = g.Count(),
                    Pending = g.Count(va => va.ApplicationStatus == ApplicationStatus.Pending),
                    Approved = g.Count(va => va.ApplicationStatus == ApplicationStatus.Approved),
                    Rejected = g.Count(va => va.ApplicationStatus == ApplicationStatus.Rejected)
                })
                .OrderByDescending(x => x.Count)
                .Take(limit ?? 10)
                .ToListAsync();

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting applications by nationality");
            return StatusCode(500, "An error occurred while retrieving nationality statistics");
        }
    }

    // GET: api/Reports/applications-by-purpose
    [HttpGet("applications-by-purpose")]
    [RequirePermission("reports.view")]
    public async Task<ActionResult<IEnumerable<object>>> GetApplicationsByPurpose()
    {
        try
        {
            var stats = await _context.VisaApplications
                .GroupBy(va => va.PurposeOfVisit)
                .Select(g => new
                {
                    Purpose = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting applications by purpose");
            return StatusCode(500, "An error occurred while retrieving purpose statistics");
        }
    }

    // GET: api/Reports/applications-timeline
    [HttpGet("applications-timeline")]
    [RequirePermission("reports.view")]
    public async Task<ActionResult<IEnumerable<object>>> GetApplicationsTimeline([FromQuery] int days = 30)
    {
        try
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-days);

            var timeline = await _context.VisaApplications
                .Where(va => va.ApplicationDate >= startDate)
                .GroupBy(va => va.ApplicationDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Total = g.Count(),
                    Pending = g.Count(va => va.ApplicationStatus == ApplicationStatus.Pending),
                    Approved = g.Count(va => va.ApplicationStatus == ApplicationStatus.Approved),
                    Rejected = g.Count(va => va.ApplicationStatus == ApplicationStatus.Rejected)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(timeline);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting applications timeline");
            return StatusCode(500, "An error occurred while retrieving applications timeline");
        }
    }

    // GET: api/Reports/arrivals-timeline
    [HttpGet("arrivals-timeline")]
    [RequirePermission("reports.view")]
    public async Task<ActionResult<IEnumerable<object>>> GetArrivalsTimeline([FromQuery] int days = 30)
    {
        try
        {
            var startDate = DateTime.UtcNow.Date.AddDays(-days);

            var timeline = await _context.ArrivalRecords
                .Where(ar => ar.ActualArrivalDate.HasValue && ar.ActualArrivalDate.Value >= startDate)
                .GroupBy(ar => ar.ActualArrivalDate.Value.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Arrivals = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(timeline);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting arrivals timeline");
            return StatusCode(500, "An error occurred while retrieving arrivals timeline");
        }
    }

    // GET: api/Reports/officer-performance
    [HttpGet("officer-performance")]
    [RequirePermission("reports.view")]
    public async Task<ActionResult<IEnumerable<object>>> GetOfficerPerformance()
    {
        try
        {
            var thisMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

            var performance = await _context.ArrivalRecords
                .Where(ar => ar.CreatedAt >= thisMonth)
                .GroupBy(ar => new { ar.ApprovedByUserId, ar.ApprovedByUser.FirstName, ar.ApprovedByUser.LastName })
                .Select(g => new
                {
                    OfficerId = g.Key.ApprovedByUserId,
                    OfficerName = $"{g.Key.FirstName} {g.Key.LastName}",
                    ProcessedApplications = g.Count(),
                    ArrivalsProcessed = g.Count(ar => ar.ActualArrivalDate.HasValue),
                    DeparturesProcessed = g.Count(ar => ar.ActualDepartureDate.HasValue)
                })
                .OrderByDescending(x => x.ProcessedApplications)
                .ToListAsync();

            return Ok(performance);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting officer performance");
            return StatusCode(500, "An error occurred while retrieving officer performance");
        }
    }

    // GET: api/Reports/export/applications
    [HttpGet("export/applications")]
    [RequirePermission("reports.export")]
    public async Task<ActionResult> ExportApplications([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var query = _context.VisaApplications.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(va => va.ApplicationDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(va => va.ApplicationDate <= endDate.Value);

            var applications = await query
                .OrderByDescending(va => va.ApplicationDate)
                .Select(va => new
                {
                    va.ReferenceNumber,
                    va.FirstName,
                    va.LastName,
                    va.Email,
                    va.PassportNumber,
                    va.Nationality,
                    va.DateOfBirth,
                    va.ContactNumber,
                    va.ArrivalDate,
                    va.ExpectedDepartureDate,
                    va.PurposeOfVisit,
                    va.AccommodationAddress,
                    Status = va.ApplicationStatus.ToString(),
                    va.ApplicationDate
                })
                .ToListAsync();

            return Ok(applications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting applications");
            return StatusCode(500, "An error occurred while exporting applications");
        }
    }

    // GET: api/Reports/average-processing-time
    [HttpGet("average-processing-time")]
    [RequirePermission("reports.view")]
    public async Task<ActionResult<object>> GetAverageProcessingTime()
    {
        try
        {
            var processedApplications = await _context.VisaApplications
                .Where(va => va.ApplicationStatus != ApplicationStatus.Pending && va.UpdatedAt != default)
                .Select(va => new
                {
                    va.ApplicationDate,
                    va.UpdatedAt,
                    ProcessingTime = (va.UpdatedAt - va.ApplicationDate).TotalHours
                })
                .ToListAsync();

            if (!processedApplications.Any())
            {
                return Ok(new { AverageHours = 0, AverageDays = 0, TotalProcessed = 0 });
            }

            var averageHours = processedApplications.Average(x => x.ProcessingTime);
            var averageDays = averageHours / 24;

            return Ok(new
            {
                AverageHours = Math.Round(averageHours, 2),
                AverageDays = Math.Round(averageDays, 2),
                TotalProcessed = processedApplications.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating average processing time");
            return StatusCode(500, "An error occurred while calculating processing time");
        }
    }
}

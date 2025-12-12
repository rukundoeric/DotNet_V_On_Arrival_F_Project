using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisaOnArrivalApi.Data;
using VisaOnArrivalApi.DTOs.Country;
using VisaOnArrivalApi.Authorization;
using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CountriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CountriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Countries
    [HttpGet]
    public async Task<ActionResult<object>> GetCountries(
        [FromQuery] bool? activeOnly = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var query = _context.Countries.AsQueryable();

        if (activeOnly == true)
        {
            query = query.Where(c => c.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.Name.Contains(search) || c.Code.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var countries = await query
            .OrderBy(c => c.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CountryDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                Code2 = c.Code2,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            data = countries,
            page,
            pageSize,
            totalCount,
            totalPages
        });
    }

    // GET: api/Countries/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CountryDto>> GetCountry(int id)
    {
        var country = await _context.Countries.FindAsync(id);

        if (country == null)
        {
            return NotFound(new { message = "Country not found" });
        }

        var countryDto = new CountryDto
        {
            Id = country.Id,
            Name = country.Name,
            Code = country.Code,
            Code2 = country.Code2,
            IsActive = country.IsActive,
            CreatedAt = country.CreatedAt,
            UpdatedAt = country.UpdatedAt
        };

        return Ok(countryDto);
    }

    // POST: api/Countries
    [HttpPost]
    [Authorize]
    [RequirePermission("countries.create")]
    public async Task<ActionResult<CountryDto>> CreateCountry([FromBody] CreateCountryDto createDto)
    {
        // Check if country with same name or code already exists
        var existingCountry = await _context.Countries
            .FirstOrDefaultAsync(c => c.Name == createDto.Name || c.Code == createDto.Code);

        if (existingCountry != null)
        {
            return BadRequest(new { message = "Country with this name or code already exists" });
        }

        var country = new Country
        {
            Name = createDto.Name,
            Code = createDto.Code,
            Code2 = createDto.Code2,
            IsActive = createDto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Countries.Add(country);
        await _context.SaveChangesAsync();

        var countryDto = new CountryDto
        {
            Id = country.Id,
            Name = country.Name,
            Code = country.Code,
            Code2 = country.Code2,
            IsActive = country.IsActive,
            CreatedAt = country.CreatedAt,
            UpdatedAt = country.UpdatedAt
        };

        return CreatedAtAction(nameof(GetCountry), new { id = country.Id }, countryDto);
    }

    // PUT: api/Countries/5
    [HttpPut("{id}")]
    [Authorize]
    [RequirePermission("countries.update")]
    public async Task<IActionResult> UpdateCountry(int id, [FromBody] UpdateCountryDto updateDto)
    {
        var country = await _context.Countries.FindAsync(id);

        if (country == null)
        {
            return NotFound(new { message = "Country not found" });
        }

        // Check if another country with same name or code already exists
        var existingCountry = await _context.Countries
            .FirstOrDefaultAsync(c => c.Id != id && (c.Name == updateDto.Name || c.Code == updateDto.Code));

        if (existingCountry != null)
        {
            return BadRequest(new { message = "Another country with this name or code already exists" });
        }

        country.Name = updateDto.Name;
        country.Code = updateDto.Code;
        country.Code2 = updateDto.Code2;
        country.IsActive = updateDto.IsActive;
        country.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/Countries/5
    [HttpDelete("{id}")]
    [Authorize]
    [RequirePermission("countries.delete")]
    public async Task<IActionResult> DeleteCountry(int id)
    {
        var country = await _context.Countries.FindAsync(id);

        if (country == null)
        {
            return NotFound(new { message = "Country not found" });
        }

        _context.Countries.Remove(country);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH: api/Countries/5/toggle-status
    [HttpPatch("{id}/toggle-status")]
    [Authorize]
    [RequirePermission("countries.update")]
    public async Task<IActionResult> ToggleCountryStatus(int id)
    {
        var country = await _context.Countries.FindAsync(id);

        if (country == null)
        {
            return NotFound(new { message = "Country not found" });
        }

        country.IsActive = !country.IsActive;
        country.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Country {(country.IsActive ? "activated" : "deactivated")} successfully", isActive = country.IsActive });
    }
}

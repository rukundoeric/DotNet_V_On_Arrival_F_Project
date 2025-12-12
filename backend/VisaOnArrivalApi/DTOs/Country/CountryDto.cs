using System.ComponentModel.DataAnnotations;

namespace VisaOnArrivalApi.DTOs.Country;

public class CountryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Code2 { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateCountryDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(3)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(2)]
    public string? Code2 { get; set; }

    public bool IsActive { get; set; } = true;
}

public class UpdateCountryDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(3)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(2)]
    public string? Code2 { get; set; }

    public bool IsActive { get; set; }
}

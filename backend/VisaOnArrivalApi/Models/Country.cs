using System.ComponentModel.DataAnnotations;

namespace VisaOnArrivalApi.Models;

public class Country
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(3)]
    public string Code { get; set; } = string.Empty; // ISO 3166-1 alpha-3 code

    [MaxLength(2)]
    public string? Code2 { get; set; } // ISO 3166-1 alpha-2 code

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}

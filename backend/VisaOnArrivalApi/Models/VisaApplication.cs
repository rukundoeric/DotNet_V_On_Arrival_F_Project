using System.ComponentModel.DataAnnotations;

namespace VisaOnArrivalApi.Models;

public class VisaApplication
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string ReferenceNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string PassportNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Nationality { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    [Phone]
    [MaxLength(20)]
    public string ContactNumber { get; set; } = string.Empty;

    [Required]
    public DateTime ArrivalDate { get; set; }

    [Required]
    public DateTime ExpectedDepartureDate { get; set; }

    [Required]
    [MaxLength(500)]
    public string PurposeOfVisit { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string AccommodationAddress { get; set; } = string.Empty;

    public ApplicationStatus ApplicationStatus { get; set; } = ApplicationStatus.Pending;

    public DateTime ApplicationDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation property
    public ArrivalRecord? ArrivalRecord { get; set; }
}

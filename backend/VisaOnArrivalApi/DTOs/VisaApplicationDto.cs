using System.ComponentModel.DataAnnotations;

namespace VisaOnArrivalApi.DTOs;

public class CreateVisaApplicationDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string ContactNumber { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    [MaxLength(50)]
    public string PassportNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Nationality { get; set; } = string.Empty;

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
}

public class VisaApplicationResponseDto
{
    public int Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
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
    public string ApplicationStatus { get; set; } = string.Empty;
    public DateTime ApplicationDate { get; set; }
}

public class RejectVisaApplicationDto
{
    [MaxLength(500)]
    public string? Reason { get; set; }
}

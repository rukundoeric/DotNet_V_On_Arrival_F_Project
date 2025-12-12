using System.ComponentModel.DataAnnotations;

namespace VisaOnArrivalApi.Models;

/// <summary>
/// Junction table linking Users to their VisaApplications
/// Allows tracking of applications submitted by registered users
/// Anonymous applications will not have an entry in this table
/// </summary>
public class UserApplication
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int VisaApplicationId { get; set; }

    public DateTime LinkedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public VisaApplication VisaApplication { get; set; } = null!;
}

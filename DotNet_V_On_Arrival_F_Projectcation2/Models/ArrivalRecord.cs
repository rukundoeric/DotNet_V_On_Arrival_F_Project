namespace DotNet_V_On_Arrival_F_Projectcation2.Models;

public class ArrivalRecord
{
    public int Id { get; set; }

    public int VisaApplicationId { get; set; }

    public EntryStatus EntryStatus { get; set; } = EntryStatus.Pending;

    public DateTime? ActualArrivalDate { get; set; }

    public DateTime? ActualDepartureDate { get; set; }

    public int ApprovedByUserId { get; set; }

    public int? ArrivalProcessedByUserId { get; set; }

    public int? DepartureProcessedByUserId { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public VisaApplication VisaApplication { get; set; } = null!;
    public User ApprovedByUser { get; set; } = null!;
    public User? ArrivalProcessedByUser { get; set; }
    public User? DepartureProcessedByUser { get; set; }
}

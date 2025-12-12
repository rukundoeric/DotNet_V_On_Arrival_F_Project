using System.ComponentModel.DataAnnotations;

namespace VisaOnArrivalApi.DTOs.ArrivalRecord;

public class CreateArrivalRecordDto
{
    [Required]
    public int VisaApplicationId { get; set; }

    public DateTime? ActualArrivalDate { get; set; }

    [Required]
    public int EntryStatus { get; set; } = 1; // Arrived
}

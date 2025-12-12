namespace VisaOnArrivalApi.DTOs.ArrivalRecord;

public class UpdateArrivalRecordDto
{
    public DateTime? ActualArrivalDate { get; set; }
    public DateTime? ActualDepartureDate { get; set; }
    public int EntryStatus { get; set; }
}

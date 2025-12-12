using VisaOnArrivalApi.Models;

namespace VisaOnArrivalApi.Services;

public interface IVisaDocumentService
{
    byte[] GenerateVisaDocument(VisaApplication application);
    byte[] GenerateAcknowledgementDocument(VisaApplication application);
}

namespace BandMananger.Dtos;

public record WhatsappRepertoireRequest(
    string EventType,
    string EventDate,
    IReadOnlyList<string> Songs);

public record WhatsappRepertoireResponse(
    bool Success,
    string Message,
    string? EventTitle,
    int SongsCount);

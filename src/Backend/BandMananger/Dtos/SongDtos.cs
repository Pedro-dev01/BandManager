namespace BandMananger.Dtos;

public record SongListDto(
    Guid Id,
    string Title,
    string Artist,
    string KeySignature,
    int? Bpm,
    string? Category);

namespace BandMananger.Dtos;

public record RepertoireItemDto(
    Guid Id,
    Guid SongId,
    string SongTitle,
    string SongArtist,
    string DefaultKey,
    int Order,
    string? SongKey,
    string? Notes);

public record SaveRepertoireItemDto(
    Guid SongId,
    string? SongKey,
    int Order,
    string? Notes);

public record SaveRepertoireDto(IReadOnlyList<SaveRepertoireItemDto> Items);

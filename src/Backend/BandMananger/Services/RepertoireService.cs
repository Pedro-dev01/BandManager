using BandMananger.Dtos;
using BandMananger.Models;
using BandMananger.Repositories;

namespace BandMananger.Services;

public class RepertoireService(IRepertoireRepository repository) : IRepertoireService
{
    public async Task<IReadOnlyList<RepertoireItemDto>> GetByEventIdAsync(
        Guid eventId,
        CancellationToken cancellationToken = default)
    {
        if (!await repository.EventExistsAsync(eventId, cancellationToken))
            throw new KeyNotFoundException($"Evento {eventId} não encontrado.");

        var items = await repository.GetByEventIdAsync(eventId, cancellationToken);
        return items.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<RepertoireItemDto>> SaveForEventAsync(
        Guid eventId,
        SaveRepertoireDto request,
        CancellationToken cancellationToken = default)
    {
        if (!await repository.EventExistsAsync(eventId, cancellationToken))
            throw new KeyNotFoundException($"Evento {eventId} não encontrado.");

        var items = request.Items ?? [];
        var songIds = items.Select(i => i.SongId).ToList();

        if (songIds.Count != songIds.Distinct().Count())
            throw new ArgumentException("A mesma música não pode aparecer mais de uma vez no repertório.");

        var existingSongIds = await repository.GetExistingSongIdsAsync(songIds, cancellationToken);
        var missing = songIds.Where(id => !existingSongIds.Contains(id)).Distinct().ToList();
        if (missing.Count > 0)
            throw new ArgumentException($"Música(s) não encontrada(s): {string.Join(", ", missing)}.");

        var entities = items
            .OrderBy(i => i.Order)
            .Select((item, index) => new Repertoire
            {
                Id = Guid.NewGuid(),
                EventId = eventId,
                SongId = item.SongId,
                Order = item.Order > 0 ? item.Order : index + 1,
                SongKey = string.IsNullOrWhiteSpace(item.SongKey) ? null : item.SongKey.Trim(),
                Notes = string.IsNullOrWhiteSpace(item.Notes) ? null : item.Notes.Trim(),
            })
            .ToList();

        await repository.ReplaceForEventAsync(eventId, entities, cancellationToken);
        return await GetByEventIdAsync(eventId, cancellationToken);
    }

    private static RepertoireItemDto MapToDto(Repertoire r) =>
        new(
            r.Id,
            r.SongId,
            r.Song.Title,
            r.Song.Artist,
            r.Song.KeySignature,
            r.Order,
            r.SongKey,
            r.Notes);
}

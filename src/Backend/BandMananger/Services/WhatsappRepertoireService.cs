using System.Globalization;
using BandMananger.Dtos;
using BandMananger.Enums;
using BandMananger.Models;
using BandMananger.Repositories;

namespace BandMananger.Services;

public class WhatsappRepertoireService(
    IEventRepository eventRepository,
    ISongRepository songRepository,
    IRepertoireService repertoireService) : IWhatsappRepertoireService
{
    public async Task<WhatsappRepertoireResponse> RegisterRepertoireAsync(
        WhatsappRepertoireRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateRequest(request);

        var eventType = MapEventType(request.EventType);
        var date = ParseEventDate(request.EventDate);
        var displayType = GetDisplayEventType(request.EventType);

        var evt = await eventRepository.GetByTypeAndDateAsync(eventType, date, cancellationToken);
        if (evt is null)
        {
            throw new KeyNotFoundException(
                $"Evento não encontrado para {displayType} em {date:dd/MM/yyyy}.");
        }

        var songTitles = request.Songs
            .Select(s => s.Trim())
            .Where(s => s.Length > 0)
            .ToList();

        var existingSongs = await songRepository.GetByTitlesAsync(songTitles, cancellationToken);
        var songsByTitle = existingSongs.ToDictionary(
            s => s.Title.Trim().ToLowerInvariant(),
            s => s,
            StringComparer.OrdinalIgnoreCase);

        var newSongs = new List<Song>();
        var orderedSongIds = new List<Guid>();

        foreach (var title in songTitles)
        {
            var key = title.ToLowerInvariant();
            if (songsByTitle.TryGetValue(key, out var existing))
            {
                orderedSongIds.Add(existing.Id);
                continue;
            }

            var created = new Song
            {
                Id = Guid.NewGuid(),
                Title = title,
                Artist = string.Empty,
                KeySignature = string.Empty,
                CreatedAt = DateTime.UtcNow,
            };

            newSongs.Add(created);
            songsByTitle[key] = created;
            orderedSongIds.Add(created.Id);
        }

        if (newSongs.Count > 0)
        {
            await songRepository.AddRangeAsync(newSongs, cancellationToken);
            await songRepository.SaveChangesAsync(cancellationToken);
        }

        var items = orderedSongIds
            .Select((songId, index) => new SaveRepertoireItemDto(songId, null, index + 1, null))
            .ToList();

        await repertoireService.SaveForEventAsync(
            evt.Id,
            new SaveRepertoireDto(items),
            cancellationToken);

        return new WhatsappRepertoireResponse(
            true,
            "Repertório registrado com sucesso.",
            evt.Title,
            songTitles.Count);
    }

    private static void ValidateRequest(WhatsappRepertoireRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.EventType))
            throw new ArgumentException("Tipo de evento é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.EventDate))
            throw new ArgumentException("Data do evento é obrigatória.");

        if (request.Songs is null || request.Songs.Count == 0)
            throw new ArgumentException("Informe ao menos uma música.");
    }

    private static EventType MapEventType(string eventType) =>
        eventType.Trim().ToUpperInvariant() switch
        {
            "ENSAIO" => EventType.Ensaio,
            "CULTO" => EventType.Culto,
            "APRESENTACAO" => EventType.TocarFora,
            _ => throw new ArgumentException($"Tipo de evento inválido: {eventType}"),
        };

    private static string GetDisplayEventType(string eventType) =>
        eventType.Trim().ToUpperInvariant() switch
        {
            "ENSAIO" => "Ensaio",
            "CULTO" => "Culto",
            "APRESENTACAO" => "Apresentação",
            _ => eventType,
        };

    private static DateOnly ParseEventDate(string eventDate)
    {
        if (!DateOnly.TryParse(eventDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            throw new ArgumentException($"Data inválida: {eventDate}. Use o formato yyyy-MM-dd.");

        return date;
    }
}

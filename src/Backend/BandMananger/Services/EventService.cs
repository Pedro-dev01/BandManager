using BandMananger.Dtos;
using BandMananger.Models;
using BandMananger.Repositories;

namespace BandMananger.Services;

public class EventService(IEventRepository repository) : IEventService
{
    public async Task<IReadOnlyList<EventListDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var events = await repository.GetAllAsync(cancellationToken);
        return events.Select(MapToDto).ToList();
    }

    public async Task<EventListDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            throw new KeyNotFoundException($"Evento {id} não encontrado.");

        return MapToDto(entity);
    }

    public async Task<EventListDto> CreateAsync(CreateEventDto dto, CancellationToken cancellationToken = default)
    {
        ValidateTitle(dto.Title);

        var entity = new Event
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            EventDate = dto.EventDate,
            Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim(),
            Type = dto.Type,
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
        };

        if (dto.Recurrence is not null)
        {
            var recurrence = MapRecurrence(dto.Recurrence);
            await repository.AddRecurrenceAsync(recurrence, cancellationToken);
            entity.RecurrenceId = recurrence.Id;
            entity.Recurrence = recurrence;
        }

        await repository.AddAsync(entity, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<EventListDto> UpdateAsync(
        Guid id,
        UpdateEventDto dto,
        CancellationToken cancellationToken = default)
    {
        ValidateTitle(dto.Title);

        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            throw new KeyNotFoundException($"Evento {id} não encontrado.");

        entity.Title = dto.Title.Trim();
        entity.EventDate = dto.EventDate;
        entity.Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim();
        entity.Type = dto.Type;
        entity.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();

        var oldRecurrenceId = entity.RecurrenceId;

        if (dto.Recurrence is null)
        {
            entity.RecurrenceId = null;
            entity.Recurrence = null;
        }
        else if (entity.Recurrence is not null)
        {
            ApplyRecurrence(entity.Recurrence, dto.Recurrence);
            await repository.UpdateRecurrenceAsync(entity.Recurrence, cancellationToken);
        }
        else
        {
            var recurrence = MapRecurrence(dto.Recurrence);
            await repository.AddRecurrenceAsync(recurrence, cancellationToken);
            entity.RecurrenceId = recurrence.Id;
            entity.Recurrence = recurrence;
        }

        await repository.UpdateAsync(entity, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        if (oldRecurrenceId.HasValue && oldRecurrenceId != entity.RecurrenceId)
            await TryDeleteOrphanRecurrenceAsync(oldRecurrenceId.Value, cancellationToken);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            throw new KeyNotFoundException($"Evento {id} não encontrado.");

        var recurrenceId = entity.RecurrenceId;

        await repository.DeleteAsync(entity, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        if (recurrenceId.HasValue)
            await TryDeleteOrphanRecurrenceAsync(recurrenceId.Value, cancellationToken);
    }

    private async Task TryDeleteOrphanRecurrenceAsync(Guid recurrenceId, CancellationToken cancellationToken)
    {
        if (!await repository.RecurrenceIsOrphanAsync(recurrenceId, cancellationToken))
            return;

        await repository.DeleteRecurrenceByIdAsync(recurrenceId, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
    }

    private static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("O título do evento é obrigatório.");
    }

    private static EventRecurrence MapRecurrence(SaveEventRecurrenceDto dto) =>
        new()
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            DayOfWeek = dto.DayOfWeek,
            Time = dto.Time,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
        };

    private static void ApplyRecurrence(EventRecurrence entity, SaveEventRecurrenceDto dto)
    {
        entity.Name = dto.Name.Trim();
        entity.DayOfWeek = dto.DayOfWeek;
        entity.Time = dto.Time;
        entity.StartDate = dto.StartDate;
        entity.EndDate = dto.EndDate;
    }

    private static EventListDto MapToDto(Event e) =>
        new(
            e.Id,
            e.Title,
            e.EventDate,
            e.Location,
            e.Type,
            e.Notes,
            e.Recurrence is null ? null : MapRecurrenceDto(e.Recurrence));

    private static EventRecurrenceDto MapRecurrenceDto(EventRecurrence r) =>
        new(r.Id, r.Name, r.DayOfWeek, r.Time, r.StartDate, r.EndDate);
}

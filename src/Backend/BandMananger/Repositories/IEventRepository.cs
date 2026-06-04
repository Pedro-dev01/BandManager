using BandMananger.Enums;
using BandMananger.Models;

namespace BandMananger.Repositories;

public interface IEventRepository
{
    Task<IReadOnlyList<Event>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Event?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Event?> GetByTypeAndDateAsync(
        EventType type,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task AddAsync(Event entity, CancellationToken cancellationToken = default);

    Task AddRecurrenceAsync(EventRecurrence recurrence, CancellationToken cancellationToken = default);

    Task UpdateAsync(Event entity, CancellationToken cancellationToken = default);

    Task UpdateRecurrenceAsync(EventRecurrence recurrence, CancellationToken cancellationToken = default);

    Task DeleteAsync(Event entity, CancellationToken cancellationToken = default);

    Task DeleteRecurrenceByIdAsync(Guid recurrenceId, CancellationToken cancellationToken = default);

    Task<bool> RecurrenceIsOrphanAsync(Guid recurrenceId, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

using BandMananger.Infrastructure.Data;
using BandMananger.Models;
using Microsoft.EntityFrameworkCore;

namespace BandMananger.Repositories;

public class EventRepository(AppDbContext db) : IEventRepository
{
    public async Task<IReadOnlyList<Event>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await db.Events
            .AsNoTracking()
            .Include(e => e.Recurrence)
            .OrderBy(e => e.EventDate)
            .ToListAsync(cancellationToken);

    public async Task<Event?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        await db.Events
            .Include(e => e.Recurrence)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task AddAsync(Event entity, CancellationToken cancellationToken = default)
    {
        await db.Events.AddAsync(entity, cancellationToken);
    }

    public async Task AddRecurrenceAsync(EventRecurrence recurrence, CancellationToken cancellationToken = default)
    {
        await db.EventRecurrences.AddAsync(recurrence, cancellationToken);
    }

    public Task UpdateAsync(Event entity, CancellationToken cancellationToken = default)
    {
        db.Events.Update(entity);
        return Task.CompletedTask;
    }

    public Task UpdateRecurrenceAsync(EventRecurrence recurrence, CancellationToken cancellationToken = default)
    {
        db.EventRecurrences.Update(recurrence);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Event entity, CancellationToken cancellationToken = default)
    {
        db.Events.Remove(entity);
        return Task.CompletedTask;
    }

    public async Task DeleteRecurrenceByIdAsync(Guid recurrenceId, CancellationToken cancellationToken = default)
    {
        var recurrence = await db.EventRecurrences.FindAsync([recurrenceId], cancellationToken);
        if (recurrence is not null)
            db.EventRecurrences.Remove(recurrence);
    }

    public async Task<bool> RecurrenceIsOrphanAsync(
        Guid recurrenceId,
        CancellationToken cancellationToken = default) =>
        !await db.Events.AnyAsync(e => e.RecurrenceId == recurrenceId, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}

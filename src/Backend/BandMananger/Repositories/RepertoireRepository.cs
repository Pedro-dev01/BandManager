using BandMananger.Infrastructure.Data;
using BandMananger.Models;
using Microsoft.EntityFrameworkCore;

namespace BandMananger.Repositories;

public class RepertoireRepository(AppDbContext db) : IRepertoireRepository
{
    public async Task<IReadOnlyList<Repertoire>> GetByEventIdAsync(
        Guid eventId,
        CancellationToken cancellationToken = default) =>
        await db.Repertoires
            .AsNoTracking()
            .Include(r => r.Song)
            .Where(r => r.EventId == eventId)
            .OrderBy(r => r.Order)
            .ToListAsync(cancellationToken);

    public async Task ReplaceForEventAsync(
        Guid eventId,
        IReadOnlyList<Repertoire> items,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var existing = await db.Repertoires
            .Where(r => r.EventId == eventId)
            .ToListAsync(cancellationToken);

        db.Repertoires.RemoveRange(existing);

        if (items.Count > 0)
            await db.Repertoires.AddRangeAsync(items, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    public Task<bool> EventExistsAsync(Guid eventId, CancellationToken cancellationToken = default) =>
        db.Events.AnyAsync(e => e.Id == eventId, cancellationToken);

    public async Task<HashSet<Guid>> GetExistingSongIdsAsync(
        IEnumerable<Guid> songIds,
        CancellationToken cancellationToken = default)
    {
        var ids = songIds.Distinct().ToList();
        if (ids.Count == 0)
            return [];

        var found = await db.Songs
            .AsNoTracking()
            .Where(s => ids.Contains(s.Id))
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);

        return found.ToHashSet();
    }
}

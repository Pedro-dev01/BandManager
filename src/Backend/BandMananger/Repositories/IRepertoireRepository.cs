using BandMananger.Models;

namespace BandMananger.Repositories;

public interface IRepertoireRepository
{
    Task<IReadOnlyList<Repertoire>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);

    Task ReplaceForEventAsync(Guid eventId, IReadOnlyList<Repertoire> items, CancellationToken cancellationToken = default);

    Task<bool> EventExistsAsync(Guid eventId, CancellationToken cancellationToken = default);

    Task<HashSet<Guid>> GetExistingSongIdsAsync(
        IEnumerable<Guid> songIds,
        CancellationToken cancellationToken = default);
}

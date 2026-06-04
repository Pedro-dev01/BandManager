using BandMananger.Models;

namespace BandMananger.Repositories;

public interface ISongRepository
{
    Task<IReadOnlyList<Song>> GetByTitlesAsync(
        IEnumerable<string> titles,
        CancellationToken cancellationToken = default);

    Task AddRangeAsync(IReadOnlyList<Song> songs, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

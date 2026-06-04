using BandMananger.Infrastructure.Data;
using BandMananger.Models;
using Microsoft.EntityFrameworkCore;

namespace BandMananger.Repositories;

public class SongRepository(AppDbContext db) : ISongRepository
{
    public async Task<IReadOnlyList<Song>> GetByTitlesAsync(
        IEnumerable<string> titles,
        CancellationToken cancellationToken = default)
    {
        var normalized = titles
            .Select(t => t.Trim().ToLowerInvariant())
            .Where(t => t.Length > 0)
            .Distinct()
            .ToList();

        if (normalized.Count == 0)
            return [];

        var allSongs = await db.Songs.AsNoTracking().ToListAsync(cancellationToken);

        return allSongs
            .Where(s => normalized.Contains(s.Title.Trim().ToLowerInvariant()))
            .ToList();
    }

    public async Task AddRangeAsync(
        IReadOnlyList<Song> songs,
        CancellationToken cancellationToken = default)
    {
        if (songs.Count > 0)
            await db.Songs.AddRangeAsync(songs, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        db.SaveChangesAsync(cancellationToken);
}

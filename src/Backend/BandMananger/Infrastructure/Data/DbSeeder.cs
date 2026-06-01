using BandMananger.Enums;
using BandMananger.Models;
using Microsoft.EntityFrameworkCore;

namespace BandMananger.Infrastructure.Data;

public static class DbSeeder
{
    public static readonly Guid EventCultoId = Guid.Parse("11111111-1111-1111-1111-111111110001");
    public static readonly Guid EventEnsaioId = Guid.Parse("11111111-1111-1111-1111-111111110002");
    public static readonly Guid EventVigiliaId = Guid.Parse("11111111-1111-1111-1111-111111110003");

    public static readonly Guid Song1Id = Guid.Parse("22222222-2222-2222-2222-222222220001");
    public static readonly Guid Song2Id = Guid.Parse("22222222-2222-2222-2222-222222220002");
    public static readonly Guid Song3Id = Guid.Parse("22222222-2222-2222-2222-222222220003");
    public static readonly Guid Song4Id = Guid.Parse("22222222-2222-2222-2222-222222220004");
    public static readonly Guid Song5Id = Guid.Parse("22222222-2222-2222-2222-222222220005");

    public static async Task SeedAsync(AppDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Songs.AnyAsync(cancellationToken))
            return;

        var now = DateTime.UtcNow;
        var cultoDate = NextSunday(now);

        db.Songs.AddRange(
            new Song { Id = Song1Id, Title = "Lugar Secreto", Artist = "Gabriela Rocha", KeySignature = "G", Bpm = 72, Category = "Adoração", CreatedAt = now },
            new Song { Id = Song2Id, Title = "Oceanos", Artist = "Hillsong", KeySignature = "D", Bpm = 70, Category = "Adoração", CreatedAt = now },
            new Song { Id = Song3Id, Title = "Reckless Love", Artist = "Cory Asbury", KeySignature = "E", Bpm = 78, Category = "Adoração", CreatedAt = now },
            new Song { Id = Song4Id, Title = "Som do Céu", Artist = "Casa Worship", KeySignature = "C", Bpm = 124, Category = "Celebração", CreatedAt = now },
            new Song { Id = Song5Id, Title = "Tua Graça Me Basta", Artist = "Davi Sacer", KeySignature = "A", Bpm = 76, Category = "Adoração", CreatedAt = now });

        db.Events.AddRange(
            new Event
            {
                Id = EventCultoId,
                Title = "Culto Dominical",
                EventDate = cultoDate.AddHours(19),
                Location = "Templo Principal",
                Type = EventType.Culto,
            },
            new Event
            {
                Id = EventEnsaioId,
                Title = "Ensaio Geral",
                EventDate = cultoDate.AddDays(-2).AddHours(20),
                Location = "Sala de Música",
                Type = EventType.Ensaio,
            },
            new Event
            {
                Id = EventVigiliaId,
                Title = "Vigília de Oração",
                EventDate = cultoDate.AddDays(5).AddHours(22),
                Location = "Templo Principal",
                Type = EventType.Culto,
            });

        db.Repertoires.AddRange(
            new Repertoire { Id = Guid.NewGuid(), EventId = EventCultoId, SongId = Song1Id, Order = 1, SongKey = "G" },
            new Repertoire { Id = Guid.NewGuid(), EventId = EventCultoId, SongId = Song2Id, Order = 2, SongKey = "D" },
            new Repertoire { Id = Guid.NewGuid(), EventId = EventCultoId, SongId = Song5Id, Order = 3, SongKey = "A" });

        await db.SaveChangesAsync(cancellationToken);
    }

    private static DateTime NextSunday(DateTime from)
    {
        var daysUntilSunday = ((int)DayOfWeek.Sunday - (int)from.DayOfWeek + 7) % 7;
        var offset = daysUntilSunday == 0 ? 0 : daysUntilSunday;
        return from.Date.AddDays(offset);
    }
}

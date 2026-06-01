namespace BandMananger.Models
{
    public class Repertoire
    {
        public Guid Id { get; set; }

        public Guid EventId { get; set; }

        public Event Event { get; set; } = null!;

        public Guid SongId { get; set; }

        public Song Song { get; set; } = null!;

        public int Order { get; set; }

        public string? SongKey { get; set; }

        public string? Notes { get; set; }
    }
}

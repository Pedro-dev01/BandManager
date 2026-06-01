namespace BandMananger.Models
{
    public class Song
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Artist { get; set; } = string.Empty;

        public string KeySignature { get; set; } = string.Empty;

        public int? Bpm { get; set; }

        public string? Category { get; set; }

        public string? ChordLink { get; set; }

        public string? PlaybackLink { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

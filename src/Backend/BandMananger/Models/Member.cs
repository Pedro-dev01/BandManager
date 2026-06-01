namespace BandMananger.Models
{
    public class Member
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string Instrument { get; set; } = string.Empty;

        public string VoiceType { get; set; } = string.Empty;

        public bool Active { get; set; } = true;

        public DateTime JoinDate { get; set; }

        public string? Notes { get; set; }
    }
}

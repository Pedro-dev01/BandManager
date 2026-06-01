using BandMananger.Enums;
namespace BandMananger.Models
{
    public class Presence
    {
        public Guid Id { get; set; }

        public Guid EventId { get; set; }

        public Event Event { get; set; } = null!;

        public Guid MemberId { get; set; }

        public Member Member { get; set; } = null!;

        public MemberPresenceStatus Status { get; set; }

        public string? Justification { get; set; }
    }
}

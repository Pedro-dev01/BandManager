using BandMananger.Enums;
using BandMananger.Models;

namespace BandMananger.Models
{
    public class Event
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public DateTime EventDate { get; set; }

        public string? Location { get; set; }

        public EventType Type { get; set; }

        public string? Notes { get; set; }

        public Guid? RecurrenceId { get; set; }

        public EventRecurrence? Recurrence { get; set; }

        public ICollection<Repertoire> Repertoires { get; set; } = new List<Repertoire>();

        public ICollection<Presence> Presences { get; set; } = new List<Presence>();
    }
}

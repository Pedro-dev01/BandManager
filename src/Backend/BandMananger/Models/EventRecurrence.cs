namespace BandMananger.Models;

public class EventRecurrence
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DayOfWeek DayOfWeek { get; set; }

    public TimeOnly Time { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public ICollection<Event> Events { get; set; } = new List<Event>();
}

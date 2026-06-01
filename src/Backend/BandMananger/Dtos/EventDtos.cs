using BandMananger.Enums;

namespace BandMananger.Dtos;

public record EventRecurrenceDto(
    Guid Id,
    string Name,
    DayOfWeek DayOfWeek,
    TimeOnly Time,
    DateTime StartDate,
    DateTime? EndDate);

public record SaveEventRecurrenceDto(
    string Name,
    DayOfWeek DayOfWeek,
    TimeOnly Time,
    DateTime StartDate,
    DateTime? EndDate);

public record EventListDto(
    Guid Id,
    string Title,
    DateTime EventDate,
    string? Location,
    EventType Type,
    string? Notes,
    EventRecurrenceDto? Recurrence);

public record CreateEventDto(
    string Title,
    DateTime EventDate,
    string? Location,
    EventType Type,
    string? Notes,
    SaveEventRecurrenceDto? Recurrence);

public record UpdateEventDto(
    string Title,
    DateTime EventDate,
    string? Location,
    EventType Type,
    string? Notes,
    SaveEventRecurrenceDto? Recurrence);

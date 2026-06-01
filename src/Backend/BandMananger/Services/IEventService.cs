using BandMananger.Dtos;

namespace BandMananger.Services;

public interface IEventService
{
    Task<IReadOnlyList<EventListDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<EventListDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<EventListDto> CreateAsync(CreateEventDto dto, CancellationToken cancellationToken = default);

    Task<EventListDto> UpdateAsync(Guid id, UpdateEventDto dto, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

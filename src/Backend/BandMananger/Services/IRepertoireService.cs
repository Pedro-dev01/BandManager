using BandMananger.Dtos;

namespace BandMananger.Services;

public interface IRepertoireService
{
    Task<IReadOnlyList<RepertoireItemDto>> GetByEventIdAsync(
        Guid eventId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RepertoireItemDto>> SaveForEventAsync(
        Guid eventId,
        SaveRepertoireDto request,
        CancellationToken cancellationToken = default);
}

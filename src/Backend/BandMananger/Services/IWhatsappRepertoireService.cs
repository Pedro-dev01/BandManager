using BandMananger.Dtos;

namespace BandMananger.Services;

public interface IWhatsappRepertoireService
{
    Task<WhatsappRepertoireResponse> RegisterRepertoireAsync(
        WhatsappRepertoireRequest request,
        CancellationToken cancellationToken = default);
}

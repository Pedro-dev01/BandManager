using BandMananger.Dtos;
using BandMananger.Services;
using Microsoft.AspNetCore.Mvc;

namespace BandMananger.Controllers;

[ApiController]
[Route("api/whatsapp")]
public class WhatsappController(IWhatsappRepertoireService whatsappRepertoireService) : ControllerBase
{
    [HttpPost("repertoire")]
    [ProducesResponseType(typeof(WhatsappRepertoireResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WhatsappRepertoireResponse>> RegisterRepertoire(
        [FromBody] WhatsappRepertoireRequest? request,
        CancellationToken cancellationToken)
    {
        if (request is null)
            return BadRequest(new { message = "Corpo da requisição é obrigatório." });

        try
        {
            var response = await whatsappRepertoireService.RegisterRepertoireAsync(
                request,
                cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

using BandMananger.Dtos;
using BandMananger.Services;
using Microsoft.AspNetCore.Mvc;

namespace BandMananger.Controllers;

[ApiController]
[Route("api/events/{eventId:guid}/repertoire")]
public class RepertoiresController(IRepertoireService repertoireService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<RepertoireItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<RepertoireItemDto>>> Get(
        Guid eventId,
        CancellationToken cancellationToken)
    {
        try
        {
            var items = await repertoireService.GetByEventIdAsync(eventId, cancellationToken);
            return Ok(items);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut]
    [ProducesResponseType(typeof(IReadOnlyList<RepertoireItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<RepertoireItemDto>>> Save(
        Guid eventId,
        [FromBody] SaveRepertoireDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var items = await repertoireService.SaveForEventAsync(
                eventId,
                request ?? new SaveRepertoireDto([]),
                cancellationToken);
            return Ok(items);
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

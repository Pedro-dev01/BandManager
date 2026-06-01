using BandMananger.Dtos;
using BandMananger.Services;
using Microsoft.AspNetCore.Mvc;

namespace BandMananger.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(IEventService eventService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<EventListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<EventListDto>>> GetAll(CancellationToken cancellationToken)
    {
        var events = await eventService.GetAllAsync(cancellationToken);
        return Ok(events);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(EventListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EventListDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var dto = await eventService.GetByIdAsync(id, cancellationToken);
            return Ok(dto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(EventListDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EventListDto>> Create(
        [FromBody] CreateEventDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var dto = await eventService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(EventListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EventListDto>> Update(
        Guid id,
        [FromBody] UpdateEventDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var dto = await eventService.UpdateAsync(id, request, cancellationToken);
            return Ok(dto);
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

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await eventService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}

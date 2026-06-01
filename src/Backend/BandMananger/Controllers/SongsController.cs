using BandMananger.Dtos;
using BandMananger.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BandMananger.Controllers;

[ApiController]
[Route("api/songs")]
public class SongsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SongListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SongListDto>>> GetAll(CancellationToken cancellationToken)
    {
        var songs = await db.Songs
            .AsNoTracking()
            .OrderBy(s => s.Title)
            .Select(s => new SongListDto(
                s.Id,
                s.Title,
                s.Artist,
                s.KeySignature,
                s.Bpm,
                s.Category))
            .ToListAsync(cancellationToken);

        return Ok(songs);
    }
}

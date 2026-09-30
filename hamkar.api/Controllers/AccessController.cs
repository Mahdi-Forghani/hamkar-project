namespace Hamkar.Api.Controllers;

[ApiController]
[Route("api/access")]
[Authorize]
public class AccessController(HamkarDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Grant(GrantAccessRequest request)
    {
        var currentUserId =
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var user = await db.Users
            .FirstOrDefaultAsync(x => x.PhoneNumber == request.PhoneNumber);

        if (user is null)
        {
            throw new ApiException(
                StatusCodes.Status404NotFound,
                "فروشنده‌ای با این شماره موبایل پیدا نشد.");
        }

        if (currentUserId == user.Id)
        {
            throw new ApiException(
                StatusCodes.Status400BadRequest,
                "نمی‌توانید به خودتان دسترسی بدهید.");
        }

        var alreadyGranted = await db.AccessGrants
            .AnyAsync(x =>
                x.OwnerUserId == currentUserId &&
                x.GrantedToUserId == user.Id);

        if (alreadyGranted)
        {
            throw new ApiException(
                StatusCodes.Status409Conflict,
                "دسترسی به این فروشنده قبلاً اعطا شده است.");
        }

        var grant = new AccessGrant
        {
            OwnerUserId = currentUserId,
            GrantedToUserId = user.Id,
            CreatedAt = DateTime.UtcNow
        };

        db.AccessGrants.Add(grant);
        await db.SaveChangesAsync();

        return Ok();
    }

    [HttpGet]
    public async Task<List<AccessGrantResult>> GetMyGrants()
    {
        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        return await db.AccessGrants
            .Include(x => x.GrantedToUser)
            .Where(x => x.OwnerUserId == userId)
            .Select(x =>
                new AccessGrantResult(
                    x.GrantedToUserId,
                    x.GrantedToUser.PhoneNumber,
                    x.GrantedToUser.ShopName))
            .ToListAsync();
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> Revoke(string userId)
    {
        var currentUserId =
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var grant = await db.AccessGrants
            .FirstOrDefaultAsync(x =>
                x.OwnerUserId == currentUserId &&
                x.GrantedToUserId == userId);

        if (grant is null)
        {
            throw new ApiException(
                StatusCodes.Status404NotFound,
                "دسترسی موردنظر پیدا نشد.");
        }

        db.AccessGrants.Remove(grant);
        await db.SaveChangesAsync();

        return NoContent();
    }
}
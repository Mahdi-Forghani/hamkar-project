namespace Hamkar.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfilerController(
    UserManager<ApplicationUser> userManager,
    JwtService jwtService,
    HamkarDbContext dbContext) : ControllerBase
{
    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        UpdateProfileRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId is null)
        {
            throw new ApiException(
                StatusCodes.Status401Unauthorized,
                "کاربر احراز هویت نشده است.");
        }

        var user = await userManager.FindByIdAsync(userId);

        if (user is null)
        {
            throw new ApiException(
                StatusCodes.Status401Unauthorized,
                "کاربر پیدا نشد.");
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.ShopName = request.ShopName;
        user.Address = request.Address;

        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            throw new ApiException(
                StatusCodes.Status400BadRequest,
                "ذخیره اطلاعات پروفایل انجام نشد.");
        }

        return Ok(new
        {
            token = jwtService.CreateToken(user)
        });
    }

    [HttpGet]
    public async Task<ActionResult<ProfileResult>> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId is null)
        {
            throw new ApiException(
                StatusCodes.Status401Unauthorized,
                "کاربر احراز هویت نشده است.");
        }

        var profile = await dbContext.Users
            .Where(x => x.Id == userId)
            .Select(x => new ProfileResult
            {
                FirstName = x.FirstName ?? "",
                LastName = x.LastName ?? "",
                ShopName = x.ShopName ?? "",
                Address = x.Address ?? ""
            })
            .FirstOrDefaultAsync();

        if (profile is null)
        {
            throw new ApiException(
                StatusCodes.Status404NotFound,
                "پروفایل پیدا نشد.");
        }

        return Ok(profile);
    }
}
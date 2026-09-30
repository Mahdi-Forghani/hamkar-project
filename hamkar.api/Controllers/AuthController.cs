namespace Hamkar.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SmsService smsService,
    JwtService jwtService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var userName = request.MobileNumber.NormalizeMobileNumber();
        var user = await userManager.FindByNameAsync(userName);

        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = userName,
                PhoneNumber = request.MobileNumber,
                PhoneNumberConfirmed = false,
                ShopName = "",
                Address = ""
            };

            var result = await userManager.CreateAsync(user);

            if (!result.Succeeded)
                throw new ApiException(
                    StatusCodes.Status400BadRequest,
                    "ثبت‌نام انجام نشد.");
        }

        if (!user.PhoneNumberConfirmed)
        {
            await SendOtp(user);

            return Ok(new
            {
                nextStep = "verify"
            });
        }

        if (await userManager.HasPasswordAsync(user))
        {
            throw new ApiException(
                StatusCodes.Status409Conflict,
                "این شماره موبایل قبلاً ثبت‌نام کرده است.");
        }

        await SendOtp(user);

        return Ok(new
        {
            nextStep = "verify"
        });
    }

    [HttpPost("verify")]
    public async Task<IActionResult> Verify(VerifyRequest request)
    {
        var userName = request.MobileNumber.NormalizeMobileNumber();
        var user = await userManager.FindByNameAsync(userName);
        string registrationToken;

        if (user is null)
        {
            throw new ApiException(
                StatusCodes.Status401Unauthorized,
                "شماره موبایل یا کد تأیید صحیح نیست.");
        }

        if (user.PhoneNumberConfirmed)
        {
            if (await userManager.HasPasswordAsync(user))
            {
                return Ok(new
                {
                    nextStep = "login"
                });
            }

            registrationToken =
                await userManager.GenerateUserTokenAsync(
                    user,
                    TokenOptions.DefaultProvider,
                    "CompleteRegistration");

            return Ok(new
            {
                nextStep = "set-password",
                userId = user.Id,
                registrationToken
            });
        }

        var isValid = await userManager.VerifyUserTokenAsync(
            user,
            TokenOptions.DefaultPhoneProvider,
            "RegisterPhoneNumber",
            request.Token);

        if (!isValid)
        {
            throw new ApiException(
                StatusCodes.Status401Unauthorized,
                "شماره موبایل یا کد تأیید صحیح نیست.");
        }

        user.PhoneNumberConfirmed = true;

        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            throw new ApiException(
                StatusCodes.Status400BadRequest,
                "تأیید شماره موبایل انجام نشد.");
        }

        registrationToken =
            await userManager.GenerateUserTokenAsync(
                user,
                TokenOptions.DefaultProvider,
                "CompleteRegistration");

        return Ok(new
        {
            nextStep = "set-password",
            userId = user.Id,
            registrationToken
        });
    }

    [HttpPost("set-password")]
    public async Task<IActionResult> SetPassword(SetPasswordRequest request)
    {
        var user = await userManager.FindByIdAsync(request.UserId);

        if (user is null || await userManager.HasPasswordAsync(user))
        {
            throw new ApiException(
                StatusCodes.Status400BadRequest,
                "اطلاعات ثبت‌نام معتبر نیست.");
        }

        var valid = await userManager.VerifyUserTokenAsync(
            user,
            TokenOptions.DefaultProvider,
            "CompleteRegistration",
            request.RegistrationToken);

        if (!valid || !user.PhoneNumberConfirmed)
        {
            throw new ApiException(
                StatusCodes.Status401Unauthorized,
                "توکن ثبت‌نام معتبر نیست.");
        }

        var result = await userManager.AddPasswordAsync(
            user,
            request.Password);

        if (!result.Succeeded)
        {
            throw new ApiException(
                StatusCodes.Status400BadRequest,
                "ثبت رمز عبور انجام نشد.");
        }

        return Ok(new
        {
            token = jwtService.CreateToken(user)
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var userName = request.Username.NormalizeMobileNumber();
        var user = await userManager.FindByNameAsync(userName);

        if (user is null)
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "شماره موبایل یا رمز عبور وارد شده اشتباه است.");
        }

        if (!user.PhoneNumberConfirmed)
        {
            await SendOtp(user);

            throw new ApiException(
                StatusCodes.Status401Unauthorized,
                "شماره موبایل هنوز تأیید نشده است.",
                new
                {
                    nextStep = "verify"
                });
        }

        if (!await userManager.HasPasswordAsync(user))
        {
            await SendOtp(user);

            throw new ApiException(StatusCodes.Status401Unauthorized, "برای این حساب هنوز رمز عبور تعیین نشده است.",
                new { nextStep = "verify" });
        }

        if (!await userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "شماره موبایل یا رمز عبور وارد شده اشتباه است.");
        }

        return Ok(new
        {
            token = jwtService.CreateToken(user)
        });
    }

    private async Task SendOtp(ApplicationUser user)
    {
        var token = await userManager.GenerateUserTokenAsync(user, TokenOptions.DefaultPhoneProvider,
            "RegisterPhoneNumber");

        await smsService.SendOtpAsync(user.PhoneNumber!, token);
    }
}
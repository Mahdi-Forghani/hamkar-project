namespace Hamkar.Api.Services;

public class SmsService(KavenegarApi api, ILogger<SmsService> logger)
{
    public async Task SendOtpAsync(string receptor, string token)
    {
        logger.Log(LogLevel.Warning, token);

        try
        {
            await api.VerifyLookup(receptor, token, template: "register-account");
        }
        catch (KavenegarException ex)
        {
            Console.Write("Message : " + ex.Message);
            throw;
        }
    }
}
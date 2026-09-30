namespace Hamkar.Api.Models.Requests;

public record SetPasswordRequest(string RegistrationToken, string UserId, string Password);
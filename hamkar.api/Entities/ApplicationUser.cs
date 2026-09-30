namespace Hamkar.Api.Entities;

public class ApplicationUser : IdentityUser
{
    public string? ShopName { get; set; } = null!;
    public string? Address { get; set; } = null!;
    public string? FirstName { get; set; } = null!;
    public string? LastName { get; set; } = null!;
    public string Fullname => $"{FirstName ?? ""} {LastName ?? ""}";

    public bool IsProfileCompleted()
    {
        return
            !string.IsNullOrWhiteSpace(FirstName) &&
            !string.IsNullOrWhiteSpace(LastName) &&
            !string.IsNullOrWhiteSpace(ShopName) &&
            !string.IsNullOrWhiteSpace(Address);
    }
}
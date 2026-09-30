namespace Hamkar.Api.Entities;

public class AccessGrant
{
    public int Id { get; set; }

    public string OwnerUserId { get; set; } = null!;
    public ApplicationUser OwnerUser { get; set; } = null!;

    public string GrantedToUserId { get; set; } = null!;
    public ApplicationUser GrantedToUser { get; set; } = null!;

    public DateTime CreatedAt { get; set; }
}
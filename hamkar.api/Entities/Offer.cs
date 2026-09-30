namespace Hamkar.Api.Entities;

public class Offer
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string UserId { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;

    public long Price { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    
    public ICollection<OfferProductAttribute> ProductAttributeSelections { get; set; } = [];
    public ICollection<OfferAttributeSelection> AttributeSelections { get; set; } = [];
}
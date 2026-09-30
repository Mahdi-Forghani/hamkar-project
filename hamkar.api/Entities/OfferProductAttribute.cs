namespace Hamkar.Api.Entities;

public class OfferProductAttribute
{
    public int OfferId { get; set; }
    public Offer Offer { get; set; } = null!;

    public int ProductAttributeId { get; set; }
    public ProductAttribute ProductAttribute { get; set; } = null!;

    public int ProductAttributeValueId { get; set; }
    public ProductAttributeValue ProductAttributeValue { get; set; } = null!;
}
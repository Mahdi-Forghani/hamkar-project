namespace Hamkar.Api.Entities;

public class OfferAttributeSelection
{
    public int OfferId { get; set; }
    public Offer Offer { get; set; } = null!;

    public int OfferAttributeDefinitionId { get; set; }

    public int OfferAttributeValueId { get; set; }
    public OfferAttributeValue Value { get; set; } = null!;
}
namespace Hamkar.Api.Entities;

public class OfferAttributeValue
{
    public int Id { get; set; }

    public int OfferAttributeDefinitionId { get; set; }
    public OfferAttributeDefinition Definition { get; set; } = null!;

    public string ValueEn { get; set; } = null!;
    public string ValueFa { get; set; } = null!;
}
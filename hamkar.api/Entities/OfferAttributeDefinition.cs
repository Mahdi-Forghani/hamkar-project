namespace Hamkar.Api.Entities;

public class OfferAttributeDefinition
{
    public int Id { get; set; }

    public string NameEn { get; set; } = null!;
    public string NameFa { get; set; } = null!;
    public string Type { get; set; } = "select";

    public ICollection<OfferAttributeValue> Values { get; set; } = [];
}
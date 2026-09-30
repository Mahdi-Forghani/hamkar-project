namespace Hamkar.Api.Entities;

public class ProductAttributeValue
{
    public int Id { get; set; }

    public int ProductAttributeId { get; set; }
    public ProductAttribute ProductAttribute { get; set; } = null!;

    public string ValueEn { get; set; } = null!;
    public string ValueFa { get; set; } = null!;
}
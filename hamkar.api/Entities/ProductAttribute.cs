namespace Hamkar.Api.Entities;

public class ProductAttribute
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string NameEn { get; set; } = null!;
    public string NameFa { get; set; } = null!;
    public string Type { get; set; } = "select";

    public ICollection<ProductAttributeValue> Values { get; set; } = [];
}
namespace Hamkar.Api.Entities;

public class Product
{
    public int Id { get; set; }
    public string NameEn { get; set; } = null!;
    public string NameFa { get; set; } = null!;
    public bool IsDraft { get; set; }

    public ICollection<ProductAttribute> Attributes { get; set; } = [];
    public ICollection<Offer> Offers { get; set; } = [];
    public ICollection<ProductAiTransaction> AiTransactions { get; set; } = [];
}
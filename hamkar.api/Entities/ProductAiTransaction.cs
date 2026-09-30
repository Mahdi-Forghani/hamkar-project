namespace Hamkar.Api.Entities;

public class ProductAiTransaction
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string TransactionId { get; set; } = null!;
    public string Usage { get; set; } = null!;
}
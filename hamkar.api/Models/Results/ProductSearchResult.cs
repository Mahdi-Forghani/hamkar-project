namespace Hamkar.Api.Models.Results;

public record ProductSearchResult(ProductResult Product, List<ShopOfferResult>? Offers = null);
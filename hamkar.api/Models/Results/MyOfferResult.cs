namespace Hamkar.Api.Models.Results;

public record OfferAttributeSelectionResult(int AttributeId, string AttributeName, int ValueId, string Value);

public record MyOfferResult(int Id, ProductResult Product, long Price, DateTime ExpiresAt,
    List<OfferAttributeSelectionResult> ProductAttributes, List<OfferAttributeSelectionResult> Attributes);
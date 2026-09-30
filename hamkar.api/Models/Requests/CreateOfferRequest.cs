namespace Hamkar.Api.Models.Requests;

public record CreateOfferRequest(
    int ProductId,
    long Price,
    List<ProductAttributeSelectionDto> ProductAttributes,
    List<OfferAttributeSelectionDto> Attributes);

public record ProductAttributeSelectionDto(
    int AttributeId,
    int ValueId);

public record OfferAttributeSelectionDto(
    int AttributeId,
    int ValueId);
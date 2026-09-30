namespace Hamkar.Api.Models.Results;

public record ProductSchemaResult(
    string ProductName,
    List<ProductAttributeResult> Attributes
);

public record LocalizedTextResult(
    string En,
    string Fa
);

public record LocalizedAttributeValueResult(
    string En,
    string Fa
);

public record LocalizedProductAttributeResult(
    LocalizedTextResult Name,
    string Type,
    List<LocalizedAttributeValueResult> Values
);

public record LocalizedProductSchemaResult(
    LocalizedTextResult ProductName,
    List<LocalizedProductAttributeResult> Attributes
);
namespace Hamkar.Api.Models.Results;

public record ProductResult(int Id, string Name, List<ProductAttributeVm> Attributes);

public record ProductAttributeValueResult(int Id, string Value);

public record ProductAttributeVm(int Id, string Name, string Type, List<ProductAttributeValueResult> Values);
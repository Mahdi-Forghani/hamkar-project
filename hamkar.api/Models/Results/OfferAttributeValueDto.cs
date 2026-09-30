namespace Hamkar.Api.Models.Results;

public record OfferAttributeValueDto(int Id, string ValueEn, string ValueFa);

public record OfferAttributeDefinitionDto(int Id, string NameEn, string NameFa, string Type, List<OfferAttributeValueDto> Values);

public record OfferAttributeValueResult(int Id, string Value);
public record OfferAttributeResult(int Id, string Name, string Type, List<OfferAttributeValueResult> Values);
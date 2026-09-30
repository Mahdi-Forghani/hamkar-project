namespace Hamkar.Api.Models.Results;

public record ShopOfferAttributeResult(
    string Name,
    string Value);

public record ShopOfferResult(
    string ShopName,
    string OwnerName,
    string Address,
    string PhoneNumber,
    long Price,
    List<ShopOfferAttributeResult> Attributes);
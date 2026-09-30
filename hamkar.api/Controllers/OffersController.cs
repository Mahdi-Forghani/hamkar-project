namespace Hamkar.Api.Controllers;

[ApiController]
[Route("api/offers")]
[Authorize]
public class OffersController(HamkarDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateOfferRequest request)
    {
        if (request.Price <= 0)
        {
            throw new ApiException(
                StatusCodes.Status400BadRequest,
                "قیمت باید بیشتر از صفر باشد.");
        }

        var product = await db.Products
            .Include(x => x.Attributes)
                .ThenInclude(x => x.Values)
            .FirstOrDefaultAsync(x => x.Id == request.ProductId);

        if (product is null)
        {
            throw new ApiException(
                StatusCodes.Status404NotFound,
                "محصول پیدا نشد.");
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var now = DateTime.UtcNow;

        // Validate product attribute selections
        foreach (var selection in request.ProductAttributes)
        {
            var attribute = product.Attributes
                .FirstOrDefault(x => x.Id == selection.AttributeId);

            if (attribute is null)
            {
                throw new ApiException(
                    StatusCodes.Status400BadRequest,
                    "ویژگی محصول نامعتبر است.");
            }

            if (attribute.Values.All(x => x.Id != selection.ValueId))
            {
                throw new ApiException(
                    StatusCodes.Status400BadRequest,
                    "مقدار ویژگی محصول نامعتبر است.");
            }
        }

        // Validate offer attribute selections
        var offerAttributeValues = await db.OfferAttributeValues
            .Where(x => request.Attributes
                .Select(a => a.ValueId)
                .Contains(x.Id))
            .ToListAsync();

        foreach (var selection in request.Attributes)
        {
            var value = offerAttributeValues
                .FirstOrDefault(x => x.Id == selection.ValueId);

            if (value is null ||
                value.OfferAttributeDefinitionId != selection.AttributeId)
            {
                throw new ApiException(
                    StatusCodes.Status400BadRequest,
                    "مقدار ویژگی پیشنهاد نامعتبر است.");
            }
        }

        // Offering a draft product publishes it.
        product.IsDraft = false;

        var offer = new Offer
        {
            ProductId = request.ProductId,
            UserId = userId,
            Price = request.Price,
            CreatedAt = now,
            ExpiresAt = now.AddHours(24),

            ProductAttributeSelections = request.ProductAttributes
                .Select(x => new OfferProductAttribute
                {
                    ProductAttributeId = x.AttributeId,
                    ProductAttributeValueId = x.ValueId
                })
                .ToList(),

            AttributeSelections = request.Attributes
                .Select(x => new OfferAttributeSelection
                {
                    OfferAttributeDefinitionId = x.AttributeId,
                    OfferAttributeValueId = x.ValueId
                })
                .ToList()
        };

        db.Offers.Add(offer);

        await db.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("mine")]
    public async Task<List<MyOfferResult>> GetMyOffers()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var now = DateTime.UtcNow;

        return await db.Offers
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.ExpiresAt > now ? 0 : 1)
            .ThenByDescending(x => x.CreatedAt)
            .Select(x => new MyOfferResult(
                x.Id,
                new ProductResult(
                    x.Product.Id,
                    x.Product.NameFa,
                    x.Product.Attributes
                        .Select(a => new ProductAttributeVm(
                            a.Id,
                            a.NameEn,
                            a.Type,
                            a.Values
                                .Select(v => new ProductAttributeValueResult(
                                    v.Id,
                                    v.ValueFa))
                                .ToList()))
                        .ToList()),
                x.Price,
                x.ExpiresAt,
                x.ProductAttributeSelections
                    .Select(s => new OfferAttributeSelectionResult(
                        s.ProductAttributeId,
                        s.ProductAttribute.NameFa,
                        s.ProductAttributeValueId,
                        s.ProductAttributeValue.ValueFa))
                    .ToList(),

                x.AttributeSelections
                    .Select(s => new OfferAttributeSelectionResult(
                        s.OfferAttributeDefinitionId,
                        s.Value.Definition.NameFa,
                        s.OfferAttributeValueId,
                        s.Value.ValueFa))
                    .ToList()))
            .ToListAsync();
    }

    [HttpGet("search")]
    public async Task<List<ProductSearchResult>> Search(
        [FromQuery] string? query = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var now = DateTime.UtcNow;

        var accessibleOwnerIds = db.AccessGrants
            .Where(x => x.GrantedToUserId == userId)
            .Select(x => x.OwnerUserId);

        var visibleOffers = db.Offers
            .Where(o =>
                o.ExpiresAt > now &&
                (
                    o.UserId == userId ||
                    accessibleOwnerIds.Contains(o.UserId)
                ));

        var productsQuery = visibleOffers
            .Select(o => o.Product)
            .Distinct();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var searchQuery = query.Trim().ToLower();

            productsQuery = productsQuery
                .Where(p =>
                    p.NameEn.ToLower().Contains(searchQuery) ||
                    p.NameFa.ToLower().Contains(searchQuery))
                .OrderBy(p => p.NameFa)
                .Take(20);
        }
        else
        {
            productsQuery = productsQuery
                .OrderByDescending(p =>
                    visibleOffers
                        .Where(o => o.ProductId == p.Id)
                        .Max(o => o.CreatedAt))
                .Take(10);
        }

        var products = await productsQuery
            .Select(p => new
            {
                Product = new ProductResult(
                    p.Id,
                    p.NameFa,
                    p.Attributes
                        .Select(a => new ProductAttributeVm(
                            a.Id,
                            a.NameFa,
                            a.Type,
                            a.Values
                                .Select(v => new ProductAttributeValueResult(
                                    v.Id,
                                    v.ValueFa))
                                .ToList()))
                        .ToList()),

                Offers = visibleOffers
                    .Where(o => o.ProductId == p.Id)
                    .Select(o => new
                    {
                        o.User.ShopName,
                        o.User.PhoneNumber,
                        o.User.Fullname,
                        o.User.Address,
                        o.Price,

                        ProductAttributes = o.ProductAttributeSelections
                            .Select(s => new ShopOfferAttributeResult(
                                s.ProductAttribute.NameFa,
                                s.ProductAttributeValue.ValueFa))
                            .ToList(),

                        OfferAttributes = o.AttributeSelections
                            .Select(s => new ShopOfferAttributeResult(
                                s.Value.Definition.NameFa,
                                s.Value.ValueFa))
                            .ToList()
                    })
                    .OrderBy(o => o.Price)
                    .ToList()
            })
            .ToListAsync();

        return products
            .Select(x => new ProductSearchResult(
                x.Product,
                x.Offers
                    .Select(o => new ShopOfferResult(
                        o.ShopName ?? "",
                        o.Fullname,
                        o.Address ?? "",
                        o.PhoneNumber ?? "",
                        o.Price,
                        o.ProductAttributes
                            .Concat(o.OfferAttributes)
                            .ToList()))
                    .ToList()))
            .OrderBy(o => o.Offers.MinBy(offer => offer.Price).Price)
            .ToList();
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateOfferRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var offer = await db.Offers
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId);

        if (offer is null)
        {
            throw new ApiException(
                StatusCodes.Status404NotFound,
                "پیشنهاد پیدا نشد.");
        }

        offer.Price = request.Price;
        offer.CreatedAt = DateTime.UtcNow;
        offer.ExpiresAt = DateTime.UtcNow.AddHours(24);

        await db.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("attributes")]
    public async Task<List<OfferAttributeResult>> GetAttributes()
    {
        return await db.OfferAttributeDefinitions
            .OrderBy(x => x.Id)
            .Select(x => new OfferAttributeResult(
                x.Id,
                x.NameFa,
                x.Type,
                x.Values
                    .OrderBy(v => v.Id)
                    .Select(v => new OfferAttributeValueResult(
                        v.Id,
                        v.ValueFa))
                    .ToList()))
            .ToListAsync();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var offer = await db.Offers
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.UserId == userId);

        if (offer is null)
        {
            throw new ApiException(
                StatusCodes.Status404NotFound,
                "پیشنهاد پیدا نشد.");
        }

        db.Offers.Remove(offer);

        await db.SaveChangesAsync();

        return NoContent();
    }
}
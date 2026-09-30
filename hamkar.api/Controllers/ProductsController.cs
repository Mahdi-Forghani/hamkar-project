namespace Hamkar.Api.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController(
    HamkarDbContext db,
    ProductDefinitionService service) : ControllerBase
{
    [HttpGet("search")]
    public async Task<List<ProductResult>> Search(
        [FromQuery] string? query = null)
    {
        var products = db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            products = products.Where(x =>
                x.NameEn.ToLower().Contains(query.ToLower()) ||
                x.NameFa.ToLower().Contains(query.ToLower()));
        }

        return await products
            .OrderBy(x => x.NameFa)
            .Take(10)
            .Select(x => new ProductResult(
                x.Id,
                x.NameFa,
                x.Attributes
                    .OrderBy(a => a.Id)
                    .Select(a => new ProductAttributeVm(
                        a.Id,
                        a.NameFa,
                        a.Type,
                        a.Values
                            .OrderBy(v => v.Id)
                            .Select(v => new ProductAttributeValueResult(
                                v.Id,
                                v.ValueFa))
                            .ToList()))
                    .ToList()))
            .ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResult>> Get(int id)
    {
        var product = await db.Products
            .Where(x => !x.IsDraft && x.Id == id)
            .Select(x => new ProductResult(
                x.Id,
                x.NameFa,
                x.Attributes
                    .OrderBy(a => a.Id)
                    .Select(a => new ProductAttributeVm(
                        a.Id,
                        a.Type,
                        a.NameFa,
                        a.Values
                            .OrderBy(v => v.Id)
                            .Select(v => new ProductAttributeValueResult(
                                v.Id,
                                v.ValueFa))
                            .ToList()))
                    .ToList()))
            .FirstOrDefaultAsync();

        if (product is null)
        {
            throw new ApiException(
                StatusCodes.Status404NotFound,
                "محصول پیدا نشد.");
        }

        return product;
    }

    [HttpPost]
    public async Task<ActionResult<ProductResult>> Define(
        ProductDefinitionRequest request)
    {
        var product = await service.DefineAsync(request.ProductUrl);

        return Ok(new ProductResult(
            product.Id,
            product.NameFa,
            product.Attributes
                .Select(a => new ProductAttributeVm(
                    a.Id,
                    a.NameFa,
                    a.Type,
                    a.Values
                        .Select(v => new ProductAttributeValueResult(
                            v.Id,
                            v.ValueFa))
                        .ToList()))
                .ToList()));
    }
}
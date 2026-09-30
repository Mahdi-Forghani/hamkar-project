namespace Hamkar.Api.Services;

public record ProductAiTransactionResult(
    string TransactionId,
    string Usage
);

public record DefineProductResult(
    LocalizedProductSchemaResult Schema,
    List<ProductAiTransactionResult> Transactions
);

public class ProductDefinitionService(
    ProductNormalizer normalizer,
    SourceCrawler crawler,
    ProductSchemaBuilder schemaBuilder,
    ProductSchemaTranslator translator,
    HamkarDbContext db)
{
    public async Task<Product> DefineAsync(string url)
    {
        var transactions = new List<ProductAiTransactionResult>();

        var runId = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss");

        var debugDirectory = Path.Combine(
            Directory.GetCurrentDirectory(),
            "debug",
            "product-definition",
            runId);

        Directory.CreateDirectory(debugDirectory);


        // 1. Crawl source
        var stopwatch = Stopwatch.StartNew();

        var crawled = await crawler.CrawlAsync(url);

        stopwatch.Stop();

        await SaveDebugAsync(
            debugDirectory,
            "01-crawl.json",
            new
            {
                Input = url,
                Output = crawled,
                DurationMs = stopwatch.ElapsedMilliseconds
            });


        // 2. Normalize product name
        stopwatch.Restart();

        var normalized = await normalizer.NormalizeAsync(
            crawled.Title);

        stopwatch.Stop();

        transactions.Add(new ProductAiTransactionResult(normalized.TransactionId, "Normalize"));

        await SaveDebugAsync(
            debugDirectory,
            "02-normalize.json",
            new
            {
                Input = crawled.Title,
                Output = normalized.Result,
                normalized.TransactionId,
                DurationMs = stopwatch.ElapsedMilliseconds
            });


        // 3. Build schema
        stopwatch.Restart();

        var schema = await schemaBuilder.BuildAsync(
            new BuildProductSchemaRequest(
                normalized.Result.NormalizedInput,
                crawled));

        stopwatch.Stop();

        transactions.Add(new ProductAiTransactionResult(schema.TransactionId, "SchemaBuilder"));

        await SaveDebugAsync(
            debugDirectory,
            "03-schema-builder.json",
            new
            {
                Input = new
                {
                    normalized.Result.NormalizedInput,
                    Source = crawled
                },
                Output = schema.Result,
                schema.TransactionId,
                DurationMs = stopwatch.ElapsedMilliseconds
            });


        // 4. Translate
        stopwatch.Restart();

        var translated = await translator.TranslateAsync(
            schema.Result);

        stopwatch.Stop();

        transactions.Add(new ProductAiTransactionResult(translated.TransactionId, "Translation"));

        await SaveDebugAsync(
            debugDirectory,
            "04-translation.json",
            new
            {
                Input = schema.Result,
                Output = translated.Result,
                translated.TransactionId,
                DurationMs = stopwatch.ElapsedMilliseconds
            });

        var result = new DefineProductResult(translated.Result, transactions);

        return await PersistProductAsync(result);
    }

    private async Task<Product> PersistProductAsync(DefineProductResult result)
    {
        var product = new Product
        {
            NameEn = result.Schema.ProductName.En,
            NameFa = result.Schema.ProductName.Fa,
            IsDraft = true
        };

        foreach (var attribute in result.Schema.Attributes)
        {
            var productAttribute = new ProductAttribute
            {
                Product = product,
                NameEn = attribute.Name.En,
                NameFa = attribute.Name.Fa,
                Type = attribute.Type
            };

            foreach (var value in attribute.Values)
            {
                productAttribute.Values.Add(new ProductAttributeValue
                {
                    ValueEn = value.En,
                    ValueFa = value.Fa
                });
            }

            product.Attributes.Add(productAttribute);
        }

        foreach (var transaction in result.Transactions)
        {
            product.AiTransactions.Add(new ProductAiTransaction
            {
                TransactionId = transaction.TransactionId,
                Usage = transaction.Usage
            });
        }

        db.Products.Add(product);
        await db.SaveChangesAsync();

        return product;
    }

    private static async Task SaveDebugAsync(string directory, string fileName, object data)
    {
        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });

        await File.WriteAllTextAsync(Path.Combine(directory, fileName), json);
    }
}
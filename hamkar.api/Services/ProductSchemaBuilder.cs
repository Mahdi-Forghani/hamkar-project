namespace Hamkar.Api.Services;

public class ProductSchemaBuilder(AiClientFactory aiClientFactory)
{
    public async Task<AiResult<ProductSchemaResult>> BuildAsync(
        BuildProductSchemaRequest request)
    {
        var chatClient = aiClientFactory.GetChatClient("SchemaBuilder");

        var sourceContent = $"""
            Source: {request.Source.Title}
            URL: {request.Source.Url}

            {request.Source.Content}
            """;

        var completion = await chatClient.CompleteChatAsync(
        [
            new SystemChatMessage("""
                Build a product schema from the provided product information
                and product specification source.

                The schema represents the product model and its sellable variants.

                Product name:
                - Return only the canonical product/model name.
                - Do not add generic product types such as "smartphone", "phone",
                  "camera", or "laptop".
                - Do not include variant attributes such as color or storage
                  in productName.

                Attributes:
                - Include ONLY attributes that can distinguish one sellable variant
                  of this product from another.
                - An attribute is valid only if its value can vary between variants
                  of the same product model.
                - Do NOT include an attribute when all variants have the same value.
                - For example, if every variant has 8GB RAM, "RAM" MUST NOT be
                  included as an attribute.
                - Do NOT include fixed product specifications such as processor,
                  display size, camera specifications, dimensions, weight, battery
                  capacity, or connectivity when they are identical across variants.
                - Do not include an attribute simply because it appears in the
                  specification source.
                - Do not include technical specifications unless they distinguish
                  sellable variants.

                Attribute names:
                - Use simple, natural, commonly understood commercial terminology.
                - Do not copy manufacturer-specific terminology when a simpler,
                  commonly used commercial term exists.
                - Normalize attribute names into standard marketplace terminology.

                Attribute values:
                - Use only values supported by the provided source.
                - Do not invent, infer, or add values.
                - Include all meaningful possible values that represent different
                  sellable variants.
                - Keep values in canonical English.
                - Use simple, commonly understood English terminology.
                - For descriptive or multi-word color names, prefer the primary/common
                  color when the additional words only describe a shade, tone, material,
                  or marketing name.
                - For example, "Cucumber Green" should be normalized to "Green".
                - Do not merge distinct colors into the same value if doing so would
                  make different sellable variants ambiguous.

                Variant reasoning:
                - Before creating an attribute, determine whether its values actually
                  vary across the product's sellable variants.
                - Prefer fewer meaningful attributes over many technical attributes.
                - If an attribute does not distinguish variants, leave it out.
                - The goal is to describe the minimum set of attributes needed to
                  identify a sellable variant.

                Source:
                - Use only information supported by the provided source.
                - Do not guess when information is missing.
                - The source may contain navigation, marketing, or unrelated content.
                  Ignore content that is not relevant to the product or its variants.

                General:
                - Use English for the product name, attribute names, and values.
                - Attribute type must always be "select".
                - Return ONLY valid JSON.

                Output structure:
                - productName: string
                - attributes: array
                - each attribute contains:
                  - name: string
                  - type: "select"
                  - values: array of strings
                """),

            new UserChatMessage($"""
                Product:
                {request.Product}

                Product specification source:

                {sourceContent}
                """)
        ]);

        var requestId = completion
            .GetRawResponse()
            .Headers
            .FirstOrDefault(x =>
                x.Key.Equals(
                    "avalai-request-id",
                    StringComparison.OrdinalIgnoreCase))
            .Value;

        if (string.IsNullOrWhiteSpace(requestId))
            throw new InvalidOperationException(
                "avalai-request-id header was not returned.");

        var result = JsonSerializer.Deserialize<ProductSchemaResult>(
            completion.Value.Content[0].Text,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            })!;

        return new AiResult<ProductSchemaResult>(
            result,
            requestId);
    }
}
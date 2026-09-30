namespace Hamkar.Api.Services;

public class ProductNormalizer(AiClientFactory aiClientFactory)
{
    public async Task<AiResult<NormalizeProductResponse>> NormalizeAsync(string input)
    {
        var chatClient = aiClientFactory.GetChatClient("Normalizer");

        var completion = await chatClient.CompleteChatAsync(
        [
            new SystemChatMessage("""
                                  Normalize the user's product input into a canonical English product name.

                                  Rules:
                                  - Extract only the actual product name.
                                  - Preserve all meaningful product-identifying information.
                                  - Preserve brand, model, series, generation, variant, capacity, size, color, or other information that is part of the product identity.
                                  - Remove website names, store names, seller names, page titles, page types, navigation text, and other metadata that are not part of the product name.
                                  - Remove terms such as "Specs", "Specifications", "Support", "Overview", "Buy now", and similar page-related text when they are not part of the product name.
                                  - Do not add information that is not present in the input.
                                  - Do not infer or guess the product model or attributes.
                                  - Return only the normalized English product name.
                                  """),
            new UserChatMessage(input)
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

        var result = new NormalizeProductResponse(completion.Value.Content[0].Text);

        return new AiResult<NormalizeProductResponse>(result, requestId);
    }
}
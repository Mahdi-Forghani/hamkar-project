namespace Hamkar.Api.Services;

public class ProductSchemaTranslator(AiClientFactory aiClientFactory)
{
    public async Task<AiResult<LocalizedProductSchemaResult>> TranslateAsync(ProductSchemaResult schemaResult)
    {
        var chatClient = aiClientFactory.GetChatClient("SchemaTranslator");

        var input = JsonSerializer.Serialize(schemaResult);

        var completion = await chatClient.CompleteChatAsync(
        [
            new SystemChatMessage("""
                                  Localize the product schema for the Persian-speaking market.

                                  IMPORTANT:
                                  This is localization, not literal translation.

                                  Rules:
                                  - The English ("en") values are canonical and MUST remain exactly unchanged.
                                  - Translate human-readable names and values into natural Persian.
                                  - Persian ("fa") values must use terminology commonly understood and used
                                    by sellers and buyers in the Iranian market.
                                  - Prefer common marketplace terminology over literal translations.
                                  - Avoid manufacturer-specific or overly formal translations when a simpler
                                    and commonly used market term exists.
                                  - Preserve meaningful distinctions between different values.
                                  - Do not simplify two distinct values into the same Persian value if that
                                    would make the product variants ambiguous.
                                  - Do not add or remove attributes.
                                  - Do not add or remove values.
                                  - Do not modify the English values.
                                  - "type" is a technical/system field and must remain exactly "select".
                                  - Return ONLY valid JSON.

                                  Output structure:
                                  - productName: object containing "en" and "fa"
                                  - attributes: array
                                  - each attribute contains:
                                    - name: object containing "en" and "fa"
                                    - type: always "select"
                                    - values: array
                                    - each value contains "en" and "fa"
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

        var result = JsonSerializer.Deserialize<LocalizedProductSchemaResult>(
            completion.Value.Content[0].Text,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            })!;

        return new AiResult<LocalizedProductSchemaResult>(result, requestId);
    }
}
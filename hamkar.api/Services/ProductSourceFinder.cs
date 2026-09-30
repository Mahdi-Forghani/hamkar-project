//#pragma warning disable OPENAI001
//#pragma warning disable SCME0001

//using System.Text.Json;
//using OpenAI.Responses;

//namespace Hamkar.Api.Services;

//public class ProductSourceFinder(ResponsesClient client, IConfiguration configuration)
//{
//    public async Task<AiResult<FindProductSourcesResponse>> FindAsync(string product)
//    {
//        var options = new CreateResponseOptions
//        {
//            Model = configuration["AI:Models:SourceFinder"]!
//        };

//        options.Tools.Add(
//            ResponseTool.CreateWebSearchTool()
//        );

//        options.InputItems.Add(
//            ResponseItem.CreateUserMessageItem($"""
//                                                Find up to 2 reliable and specific product specification pages
//                                                for this product:

//                                                {product}

//                                                Rules:
//                                                - Prefer official manufacturer specification pages.
//                                                - If unavailable, use reputable specification databases.
//                                                - Find pages specifically about this product.
//                                                - Do not return landing pages.
//                                                - Do not return marketing pages.
//                                                - Do not return review pages.
//                                                - Do not return category pages.
//                                                - Do not return search-result pages.
//                                                - The pages must contain actual product specifications.

//                                                Return ONLY valid JSON.

//                                                The JSON must contain a "sources" array.
//                                                Each source must contain:
//                                                - "url": the specific specification page URL
//                                                - "name": the website or organization name
//                                                - "type": either "official_specification" or "specification_database"
//                                                """)
//        );

//        var response = await client.CreateResponseAsync(options);

//        var json = response.Value.GetOutputText();

//        var result =
//            JsonSerializer.Deserialize<FindProductSourcesResponse>(
//                json,
//                new JsonSerializerOptions
//                {
//                    PropertyNameCaseInsensitive = true
//                })!;

//        var transactionId = response
//            .GetRawResponse()
//            .Headers
//            .FirstOrDefault(x =>
//                x.Key.Equals(
//                    "avalai-request-id",
//                    StringComparison.OrdinalIgnoreCase))
//            .Value;

//        return new AiResult<FindProductSourcesResponse>(result, transactionId);
//    }
//}

//#pragma warning restore SCME0001
//#pragma warning restore OPENAI001
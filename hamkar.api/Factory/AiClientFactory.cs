namespace Hamkar.Api.Factory;

public class AiClientFactory(IConfiguration configuration)
{
    private readonly ConcurrentDictionary<string, ChatClient> _clients = new();

    public ChatClient GetChatClient(string serviceName)
    {
        var model = configuration[
            $"AI:Models:{serviceName}"
        ];

        if (string.IsNullOrWhiteSpace(model))
            throw new InvalidOperationException(
                $"AI model is not configured for '{serviceName}'.");

        return _clients.GetOrAdd(
            model,
            CreateChatClient);
    }

    private ChatClient CreateChatClient(string model)
    {
        return new ChatClient(
            model: model,
            credential: new ApiKeyCredential(
                configuration["AI:ApiKey"]!),
            options: new OpenAIClientOptions
            {
                Endpoint = new Uri(
                    configuration["AI:BaseUrl"]!)
            });
    }
}
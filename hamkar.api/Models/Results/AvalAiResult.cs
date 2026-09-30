namespace Hamkar.Api.Models.Results;

public record AiResult<T>(T Result, string TransactionId);
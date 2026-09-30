namespace Hamkar.Api.Exceptions;

public class ApiException(
    int statusCode,
    string message,
    object? data = null) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public object? Data { get; } = data;
}
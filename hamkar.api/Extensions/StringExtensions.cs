namespace Hamkar.Api.Extensions;

public static class StringExtensions
{
    public static string NormalizeMobileNumber(this string mobileNumber)
    {
        var normalized = mobileNumber.Trim();

        if (normalized.StartsWith("0"))
            normalized = normalized[1..];

        return normalized;
    }
}
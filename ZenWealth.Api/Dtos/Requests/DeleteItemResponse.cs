namespace ZenWealth.Api.Dtos.Requests;

public record DeleteItemResponse(bool Success, string? Error = null)
{
    public override string ToString()
    {
        return $"{{ Success = {Success}, Error = {Error} }}";
    }
}
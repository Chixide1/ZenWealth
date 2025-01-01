namespace Server.Common;

public abstract class Responses
{
    public record GetLinkTokenResponse(string Value);

    public record ExchangePublicTokenResponse(string PublicToken);

    public record HasItemsResponse(bool HasItems, string UserName);
}
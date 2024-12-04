using Going.Plaid.Entity;

namespace Server.Utils;

public abstract class Responses
{
    public record GetLinkTokenResponse(string Value);

    public record ExchangePublicTokenResponse(string PublicToken);

    public record IsAccountConnectedResponse(bool Connected);
}
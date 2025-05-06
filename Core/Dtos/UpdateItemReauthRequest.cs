using Going.Plaid.Entity;

namespace Core.Dtos;

public record UpdateItemReauthRequest(string PublicToken, List<LinkSessionSuccessMetadataAccount> Accounts);
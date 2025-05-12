using Going.Plaid.Entity;

namespace ZenWealth.Core.Dtos;

public record UpdateItemReauthRequest(string PublicToken, List<LinkSessionSuccessMetadataAccount> Accounts);
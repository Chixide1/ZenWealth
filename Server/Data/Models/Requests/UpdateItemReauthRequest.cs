using Going.Plaid.Entity;

namespace Server.Data.Models.Requests;

public record UpdateItemReauthRequest(string PublicToken, List<LinkSessionSuccessMetadataAccount> Accounts);
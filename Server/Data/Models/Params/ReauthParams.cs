using Going.Plaid.Entity;

namespace Server.Data.Models.Params;

/// <summary>
/// Parameters required for exchanging public tokens after an item update
/// </summary>
public record ReauthParams(string PublicToken, int ItemId, string UserId, List<LinkSessionSuccessMetadataAccount> Accounts);
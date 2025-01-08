using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Data.Models;

public class Account

{
	/// <summary>
	/// <para>Plaid’s unique identifier for the account. This value will not change unless Plaid can't reconcile the account with the data returned by the financial institution. This may occur, for example, when the name of the account changes. If this happens a new <c>account_id</c> will be assigned to the account.</para>
	/// <para>The <c>account_id</c> can also change if the <c>access_token</c> is deleted and the same credentials that were used to generate that <c>access_token</c> are used to generate a new <c>access_token</c> on a later date. In that case, the new <c>account_id</c> will be different from the old <c>account_id</c>.</para>
	/// <para>If an account with a specific <c>account_id</c> disappears instead of changing, the account is likely closed. Closed accounts are not returned by the Plaid API.</para>
	/// <para>Like all Plaid identifiers, the <c>account_id</c> is case sensitive.</para>
	/// </summary>
	[Column(TypeName = "varchar(100)")]
	public required string Id { get; init; }
	
	/// <summary>
	/// <para>The associated Item which contains the Access Token that allows retrieval of data from Plaid</para>
	/// </summary>
	public required int ItemId { get; init; }
	
	/// <summary>
	/// <para>Navigation Property for the parent Item</para>
	/// </summary>
	public Item Item { get; init; } = null!;
	
	/// <summary>
	/// <para>The associated user ID</para>
	/// </summary>
	[Column(TypeName = "nvarchar(450)")]
	public string? UserId { get; init; }

	/// <summary>
	/// <para>The associated user's Navigation</para>
	/// </summary>
	public User User { get; init; } = null!;

	/// <summary>
	/// <para>A set of fields describing the balance for an account. Balance information may be cached unless the balance object was returned by <c>/accounts/balance/get</c>.</para>
	/// </summary>
	public double Balance { get; init; }

	/// <summary>
	/// <para>The last 2-4 alphanumeric characters of an account's official account number. Note that the mask may be non-unique between an Item's accounts, and it may also not match the mask that the bank displays to the user.</para>
	/// </summary>
	[Column(TypeName = "varchar(50)")]
	public string? Mask { get; init; }

	/// <summary>
	/// <para>The name of the account, either assigned by the user or by the financial institution itself</para>
	/// </summary>
	[Column(TypeName = "varchar(255)")]
	public required string Name { get; init; }

	/// <summary>
	/// <para>The official name of the account as given by the financial institution</para>
	/// </summary>
	[Column(TypeName = "varchar(255)")]
	public string? OfficialName { get; init; }

	/// <summary>
	/// <para>See the <a href="https://plaid.com/docs/api/accounts#account-type-schema">Account type schema</a> for a full listing of account types and corresponding subtypes.</para>
	/// </summary>
	[Column(TypeName = "varchar(255)")]
	public required string Type { get; init; }

	/// <summary>
	/// <para>See the [Account type schema](https://plaid.com/docs/api/accounts/#account-type-schema) for a full listing of account types and corresponding subtypes.</para>
	/// </summary>
	[Column(TypeName = "varchar(255)")]
	public string? Subtype { get; init; }

	/// <summary>
	/// <para>Navigation property for Transactions associated with this Account</para>
	/// </summary>
	[Column(TypeName = "varchar(255)")]
	public List<Transaction> Transactions { get; } = [];
}
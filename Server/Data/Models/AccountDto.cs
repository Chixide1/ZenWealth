namespace Server.Data.Models;

public class AccountDto
{
	/// <summary>
	/// <para>Used for pagination</para>
	/// </summary>
	public required int Id { get; init; }

	/// <summary>
	/// <para>A set of fields describing the balance for an account. Balance information may be cached unless the balance object was returned by <c>/accounts/balance/get</c>.</para>
	/// </summary>
	public double CurrentBalance { get; init; }
	
	/// <summary>
	/// <para>A set of fields describing the balance for an account. Balance information may be cached unless the balance object was returned by <c>/accounts/balance/get</c>.</para>
	/// </summary>
	public double AvailableBalance { get; init; }

	/// <summary>
	/// <para>The last 2-4 alphanumeric characters of an account's official account number. Note that the mask may be non-unique between an Item's accounts, and it may also not match the mask that the bank displays to the user.</para>
	/// </summary>
	public required string Mask { get; init; }

	/// <summary>
	/// <para>The name of the account, either assigned by the user or by the financial institution itself</para>
	/// </summary>
	public required string Name { get; init; }

	/// <summary>
	/// <para>The official name of the account as given by the financial institution</para>
	/// </summary>
	public required string OfficialName { get; init; }

	/// <summary>
	/// <para>See the <a href="https://plaid.com/docs/api/accounts#account-type-schema">Account type schema</a> for a full listing of account types and corresponding subtypes.</para>
	/// </summary>
	public required string Type { get; init; }

	/// <summary>
	/// <para>See the [Account type schema](https://plaid.com/docs/api/accounts/#account-type-schema) for a full listing of account types and corresponding subtypes.</para>
	/// </summary>
	public required string Subtype { get; init; }
}
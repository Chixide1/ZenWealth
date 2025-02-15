namespace Server.Data.Models;

public class TransactionDto

{
	/// <summary>
	/// <para>Unique ID for each Transaction</para>
	/// </summary>
	public int Id { get; init; }
	
	/// <summary>
	/// <para>The Account Name in which this transaction occurred.</para>
	/// </summary>
	public required string AccountName { get; init; }

	/// <summary>
	/// <para>The settled value of the transaction, denominated in the transactions's currency, as stated in <c>iso_currency_code</c> or <c>unofficial_currency_code</c>. For all products except Income: Positive values when money moves out of the account; negative values when money moves in. For example, debit card purchases are positive; credit card payments, direct deposits, and refunds are negative. For Income endpoints, values are positive when representing income.</para>
	/// </summary>
	public required decimal Amount { get; set; }

	/// <summary>
	/// <para>The ISO-4217 currency code of the transaction. Always <c>null</c> if <c>unofficial_currency_code</c> is non-null.</para>
	/// </summary>
	public string? IsoCurrencyCode { get; init; }

	/// <summary>
	/// <para>For pending transactions, the date that the transaction occurred; for posted transactions, the date that the transaction posted. Both dates are returned in an <a href="https://wikipedia.org/wiki/ISO_8601">ISO 8601</a> format ( <c>YYYY-MM-DD</c> ). To receive information about the date that a posted transaction was initiated, see the <c>authorized_date</c> field.</para>
	/// </summary>
	public DateOnly Date { get; init; }

	/// <summary>
	/// <para>The merchant name or transaction description. </para>
	/// <para>Note: This is a legacy field that is not actively maintained. Use <c>merchant_name</c> instead for the merchant name.</para>
	/// <para>If the <c>transactions</c> object was returned by a Transactions endpoint such as <c>/transactions/sync</c> or <c>/transactions/get</c>, this field will always appear. If the <c>transactions</c> object was returned by an Assets endpoint such as <c>/asset_report/get/</c> or <c>/asset_report/pdf/get</c>, this field will only appear in an Asset Report with Insights.</para>
	/// </summary>
	public string? Name { get; init; }

	/// <summary>
	/// <para>The URL of a logo associated with this transaction, if available. The logo will always be 100×100 pixel PNG file.</para>
	/// </summary>
	public string? LogoUrl { get; init; }

	/// <summary>
	/// <para>Date and time when a transaction was posted in <a href="https://wikipedia.org/wiki/ISO_8601">ISO 8601</a> format ( <c>YYYY-MM-DDTHH:mm:ssZ</c> ). For the date that the transaction was initiated, rather than posted, see the <c>authorized_datetime</c> field.</para>
	/// <para>This field is returned for select financial institutions and comes as provided by the institution. It may contain default time values (such as 00:00:00). This field is only populated in API version 2019-05-29 and later.</para>
	/// </summary>
	public DateTimeOffset? Datetime { get; init; }

	/// <summary>
	/// <para>Information describing the intent of the transaction. Most relevant for personal finance use cases, but not limited to such use cases.</para>
	/// <para>See the <a href="https://plaid.com/documents/transactions-personal-finance-category-taxonomy.csv"><c>taxonomy CSV file</c></a> for a full list of personal finance categories. If you are migrating to personal finance categories from the legacy categories, also refer to the <a href="https://plaid.com/docs/transactions/pfc-migration/"><c>migration guide</c></a>.</para>
	/// </summary>
	public string? Category { get; init; }

	/// <summary>
	/// <para>The URL of an icon associated with the primary personal finance category. The icon will always be 100×100 pixel PNG file.</para>
	/// </summary>
	public string? CategoryIconUrl { get; init; }
}
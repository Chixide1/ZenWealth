using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace ZenWealth.Core.Domain.Constants;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TransactionSortOption
{
    [EnumMember(Value = "Date Desc")]
    DATE_DESC,
    
    [EnumMember(Value = "Date Asc")]
    DATE_ASC,
    
    [EnumMember(Value = "Amount Asc")]
    AMOUNT_ASC,
    
    [EnumMember(Value = "Amount Desc")]
    AMOUNT_DESC
}
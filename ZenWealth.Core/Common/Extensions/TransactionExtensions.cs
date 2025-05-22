using System.Text.RegularExpressions;
using ZenWealth.Core.Domain.Constants;

namespace ZenWealth.Core.Common.Extensions;

public static class TransactionExtensions
{
    public static TransactionSortOption ParseTransactionSortOption(this string sortString)
    {
        var normalized = NormalizeString(sortString);
        
        return normalized.ToLower() switch
        {
            "date-asc" => TransactionSortOption.DATE_ASC,
            "amount-asc" => TransactionSortOption.AMOUNT_ASC,
            "amount-desc" => TransactionSortOption.AMOUNT_DESC,
            _ => TransactionSortOption.DATE_DESC
        };
    }
    
    private static string NormalizeString(string input)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;
    
        // Replace spaces with hyphens first
        var normalized = input.Replace(' ', '-');
    
        // Convert PascalCase/camelCase to kebab-case
        normalized = Regex.Replace(normalized, "([a-z])([A-Z])", "$1-$2");
    
        // Replace underscores with hyphens for snake_case
        normalized = normalized.Replace('_', '-');
    
        // Convert to lowercase
        return normalized.ToLower();
    }
}
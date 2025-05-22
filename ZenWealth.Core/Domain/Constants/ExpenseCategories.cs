using System.Diagnostics.CodeAnalysis;

namespace ZenWealth.Core.Domain.Constants;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public enum ExpenseCategories
{
        BANK_FEES,
        HOME_IMPROVEMENT,
        RENT_AND_UTILITIES,
        ENTERTAINMENT,
        FOOD_AND_DRINK,
        LOAN_PAYMENTS,
        TRANSFER_OUT,
        GENERAL_MERCHANDISE,
        MEDICAL,
        TRANSPORTATION,
        GENERAL_SERVICES,
        PERSONAL_CARE,
        TRAVEL,
        GOVERNMENT_AND_NON_PROFIT,
        OTHER
}
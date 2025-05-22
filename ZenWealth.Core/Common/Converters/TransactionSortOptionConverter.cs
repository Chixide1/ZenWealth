using System.ComponentModel;
using System.Globalization;
using ZenWealth.Core.Common.Extensions;

namespace ZenWealth.Core.Common.Converters;

public class TransactionSortOptionConverter : TypeConverter
{
    public override bool CanConvertFrom(ITypeDescriptorContext? context, Type sourceType)
    {
        return sourceType == typeof(string) || base.CanConvertFrom(context, sourceType);
    }

    public override object? ConvertFrom(ITypeDescriptorContext? context, CultureInfo? culture, object value)
    {
        if (value is string stringValue)
        {
            return stringValue.ParseTransactionSortOption();
        }
        return base.ConvertFrom(context, culture, value);
    }
}
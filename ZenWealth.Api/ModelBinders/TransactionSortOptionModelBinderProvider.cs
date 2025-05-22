using Microsoft.AspNetCore.Mvc.ModelBinding;
using ZenWealth.Core.Common.Extensions;
using ZenWealth.Core.Domain.Constants;

namespace ZenWealth.Api.ModelBinders;

public class TransactionSortOptionModelBinderProvider : IModelBinderProvider
{
    public IModelBinder? GetBinder(ModelBinderProviderContext context)
    {
        if (context.Metadata.ModelType == typeof(TransactionSortOption) || 
            context.Metadata.ModelType == typeof(TransactionSortOption?))
        {
            return new TransactionSortOptionModelBinder();
        }
        return null;
    }
}

public class TransactionSortOptionModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
        
        if (value == ValueProviderResult.None)
        {
            bindingContext.Result = ModelBindingResult.Success(TransactionSortOption.DATE_DESC);
            return Task.CompletedTask;
        }

        var stringValue = value.FirstValue;
        var sortOption = (stringValue ?? string.Empty).ParseTransactionSortOption();
        
        bindingContext.Result = ModelBindingResult.Success(sortOption);
        return Task.CompletedTask;
    }
}
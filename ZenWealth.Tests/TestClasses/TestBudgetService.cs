using Microsoft.Extensions.Logging;
using ZenWealth.Core.Application.Services;
using ZenWealth.Core.Domain.Interfaces;

namespace ZenWealth.Tests.TestClasses;

// Create a testable subclass of BudgetService that allows us to override the current date
internal class TestBudgetService(
    ILogger<BudgetService> logger,
    IBudgetRepository budgetRepository,
    ITransactionRepository transactionRepository)
    : BudgetService(logger, budgetRepository, transactionRepository)
{
    private DateOnly? _mockCurrentDate;

    public void SetCurrentDate(DateOnly date)
    {
        _mockCurrentDate = date;
    }

    protected override DateOnly GetCurrentDate()
    {
        return _mockCurrentDate ?? base.GetCurrentDate();
    }
}
using Core.Application.Services;
using Core.Domain.Entities;
using Core.Domain.Interfaces;
using Core.Dtos;
using Core.Models;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Tests.UnitTests;

public class TransactionsServiceTests
{
    private readonly Mock<ITransactionRepository> _mockRepository;
    private readonly Mock<ILogger<TransactionsService>> _mockLogger;
    private readonly TransactionsService _service;

    public TransactionsServiceTests()
    {
        _mockRepository = new Mock<ITransactionRepository>();
        _mockLogger = new Mock<ILogger<TransactionsService>>();
        _service = new TransactionsService(_mockRepository.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetTransactionsAsync_ReturnsTransactions_WhenRepositoryReturnsTransactions()
    {
        // Arrange
        var userId = "user123";
        var transactionParams = new TransactionParams
        {
            PageSize = 10,
            Sort = "date-desc"
        };

        var expectedTransactions = new List<TransactionDto>
        {
            new()
            {
                Id = 1,
                AccountName = "Checking",
                Name = "Grocery Store",
                Amount = 50.25m,
                Date = new DateOnly(2025, 5, 1),
                Category = "FOOD_AND_DRINK"
            },
            new()
            {
                Id = 2,
                AccountName = "Credit Card",
                Name = "Online Shopping",
                Amount = 120.99m,
                Date = new DateOnly(2025, 4, 28),
                Category = "SHOPPING"
            }
        };

        _mockRepository.Setup(r => r.GetTransactionsAsync(userId, transactionParams))
            .ReturnsAsync(expectedTransactions);

        // Act
        var result = await _service.GetTransactionsAsync(userId, transactionParams);

        // Assert
        Assert.Equal(expectedTransactions.Count, result.Count);
        Assert.Equal(expectedTransactions[0].Id, result[0].Id);
        Assert.Equal(expectedTransactions[1].Id, result[1].Id);
        _mockRepository.Verify(r => r.GetTransactionsAsync(userId, transactionParams), Times.Once);
    }

    [Fact]
    public async Task GetTransactionsAsync_ReturnsEmptyList_WhenRepositoryReturnsEmptyList()
    {
        // Arrange
        var userId = "user123";
        var transactionParams = new TransactionParams
        {
            PageSize = 10,
            Sort = "date-desc"
        };

        _mockRepository.Setup(r => r.GetTransactionsAsync(userId, transactionParams))
            .ReturnsAsync(new List<TransactionDto>());

        // Act
        var result = await _service.GetTransactionsAsync(userId, transactionParams);

        // Assert
        Assert.Empty(result);
        _mockRepository.Verify(r => r.GetTransactionsAsync(userId, transactionParams), Times.Once);
    }

    [Fact]
    public async Task GetMonthlyIncomeAndOutcome_ReturnsMonthlyData_WhenRepositoryReturnsData()
    {
        // Arrange
        var userId = "user123";
        var monthlySummaries = new List<MonthlySummaryDto>
        {
            new() { Month = "January", Income = -1500m, Expenditure = 1200m },
            new() { Month = "February", Income = -1600m, Expenditure = 1300m },
            new() { Month = "March", Income = -1700m, Expenditure = 1100m }
        };

        _mockRepository.Setup(r => r.GetMonthlyIncomeAndOutcomeAsync(userId))
            .ReturnsAsync(monthlySummaries);

        // Act
        var result = await _service.GetMonthlyIncomeAndOutcome(userId);

        // Assert
        Assert.Equal(3, result.Count);
        Assert.Equal("January", result[0].Month);
        Assert.Equal(-1500m, result[0].Income);
        Assert.Equal(1200m, result[0].Expenditure);
        _mockRepository.Verify(r => r.GetMonthlyIncomeAndOutcomeAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetMonthlyIncomeAndOutcome_ReturnsEmptyList_WhenRepositoryReturnsEmptyList()
    {
        // Arrange
        var userId = "user123";

        _mockRepository.Setup(r => r.GetMonthlyIncomeAndOutcomeAsync(userId))
            .ReturnsAsync(new List<MonthlySummaryDto>());

        // Act
        var result = await _service.GetMonthlyIncomeAndOutcome(userId);

        // Assert
        Assert.Empty(result);
        _mockRepository.Verify(r => r.GetMonthlyIncomeAndOutcomeAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetRecentTransactions_ReturnsRecentTransactions_WhenRepositoryReturnsData()
    {
        // Arrange
        var userId = "user123";
        var count = 11;

        var allTransactions = new List<TransactionDto>
        {
            new() { Id = 1, AccountName = "Checking", Amount = 50.25m, Date = new DateOnly(2025, 5, 1), Category = "FOOD_AND_DRINK" },
            new() { Id = 2, AccountName = "Credit Card", Amount = 120.99m, Date = new DateOnly(2025, 4, 28), Category = "SHOPPING" }
        };

        var incomeTransactions = new List<TransactionDto>
        {
            new() { Id = 3, AccountName = "Checking", Amount = -1500m, Date = new DateOnly(2025, 5, 1), Category = "INCOME" },
            new() { Id = 4, AccountName = "Savings", Amount = -500m, Date = new DateOnly(2025, 4, 15), Category = "INCOME" }
        };

        var expenditureTransactions = new List<TransactionDto>
        {
            new() { Id = 5, AccountName = "Credit Card", Amount = 75.50m, Date = new DateOnly(2025, 5, 2), Category = "ENTERTAINMENT" },
            new() { Id = 6, AccountName = "Checking", Amount = 30m, Date = new DateOnly(2025, 4, 30), Category = "TRANSPORTATION" }
        };

        _mockRepository.Setup(r => r.GetRecentTransactionsAllAsync(userId, count))
            .ReturnsAsync(allTransactions);
        _mockRepository.Setup(r => r.GetRecentTransactionsIncomeAsync(userId, count))
            .ReturnsAsync(incomeTransactions);
        _mockRepository.Setup(r => r.GetRecentTransactionsExpenditureAsync(userId, count))
            .ReturnsAsync(expenditureTransactions);

        // Act
        var result = await _service.GetRecentTransactions(userId, count);

        // Assert
        Assert.Equal(2, result.All.Count);
        Assert.Equal(2, result.Income.Count);
        Assert.Equal(2, result.Expenditure.Count);

        Assert.Equal(1, result.All[0].Id);
        Assert.Equal(3, result.Income[0].Id);
        Assert.Equal(5, result.Expenditure[0].Id);

        _mockRepository.Verify(r => r.GetRecentTransactionsAllAsync(userId, count), Times.Once);
        _mockRepository.Verify(r => r.GetRecentTransactionsIncomeAsync(userId, count), Times.Once);
        _mockRepository.Verify(r => r.GetRecentTransactionsExpenditureAsync(userId, count), Times.Once);
    }

    [Fact]
    public async Task GetTopExpenseCategories_ReturnsTopExpenseCategories_WhenRepositoryReturnsData()
    {
        // Arrange
        var userId = "user123";
        var topExpenseCategories = new List<TopExpenseCategoryDto>
        {
            new() { Category = "FOOD_AND_DRINK", IconUrl = "url1", Expenditure = 350.75m, Total = 1200m },
            new() { Category = "SHOPPING", IconUrl = "url2", Expenditure = 275.50m, Total = 1200m },
            new() { Category = "TRANSPORTATION", IconUrl = "url3", Expenditure = 150.25m, Total = 1200m }
        };

        _mockRepository.Setup(r => r.GetTopExpenseCategoriesAsync(userId))
            .ReturnsAsync(topExpenseCategories);

        // Act
        var result = await _service.GetTopExpenseCategories(userId);

        // Assert
        Assert.Equal(3, result.Count);
        Assert.Equal("FOOD_AND_DRINK", result[0].Category);
        Assert.Equal(350.75m, result[0].Expenditure);
        _mockRepository.Verify(r => r.GetTopExpenseCategoriesAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetMinMaxAmount_ReturnsMinMaxAmount_WhenRepositoryReturnsData()
    {
        // Arrange
        var userId = "user123";
        var minMaxAmount = new MinMaxAmountDto { Min = -2000m, Max = 1500m };

        _mockRepository.Setup(r => r.GetMinMaxAmountAsync(userId))
            .ReturnsAsync(minMaxAmount);

        // Act
        var result = await _service.GetMinMaxAmount(userId);

        // Assert
        Assert.Equal(-2000m, result.Min);
        Assert.Equal(1500m, result.Max);
        _mockRepository.Verify(r => r.GetMinMaxAmountAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetTransactionsByCategoryAsync_ReturnsCategoryTotals_WhenRepositoryReturnsData()
    {
        // Arrange
        var userId = "user123";
        var beginDate = new DateOnly(2025, 1, 1);
        var endDate = new DateOnly(2025, 5, 1);
        var count = 5;

        var categoryTotals = new List<CategoryTotalDto>
        {
            new() { Category = "FOOD_AND_DRINK", Total = 450.75m },
            new() { Category = "SHOPPING", Total = 375.50m },
            new() { Category = "TRANSPORTATION", Total = 250.25m }
        };

        _mockRepository.Setup(r => r.GetTransactionsByCategoryAsync(userId, beginDate, endDate, count))
            .ReturnsAsync(categoryTotals);

        // Act
        var result = await _service.GetTransactionsByCategoryAsync(userId, beginDate, endDate, count);

        // Assert
        Assert.Equal(3, result.Count);
        Assert.Equal("FOOD_AND_DRINK", result[0].Category);
        Assert.Equal(450.75m, result[0].Total);
        _mockRepository.Verify(r => r.GetTransactionsByCategoryAsync(userId, beginDate, endDate, count), Times.Once);
    }

    [Fact]
    public async Task GetFinancialPeriods_ReturnsFinancialPeriods_WhenRepositoryReturnsData()
    {
        // Arrange
        var userId = "user123";
        var financialPeriods = new List<FinancialPeriodDto>
        {
            new()
            {
                Year = 2025,
                Month = 5,
                Categories = new Dictionary<string, decimal>
                {
                    { "FOOD_AND_DRINK", 250.75m },
                    { "SHOPPING", 175.50m },
                    { "INCOME", -2000m }
                },
                Totals = new FinancialPeriodDto.CategoriesTotals
                {
                    Income = -2000m,
                    Expenses = 426.25m,
                    NetProfit = 1573.75m
                }
            },
            new()
            {
                Year = 2025,
                Month = 4,
                Categories = new Dictionary<string, decimal>
                {
                    { "FOOD_AND_DRINK", 200.25m },
                    { "TRANSPORTATION", 150.75m },
                    { "INCOME", -2000m }
                },
                Totals = new FinancialPeriodDto.CategoriesTotals
                {
                    Income = -2000m,
                    Expenses = 351m,
                    NetProfit = 1649m
                }
            }
        };

        _mockRepository.Setup(r => r.GetFinancialPeriodsAsync(userId))
            .ReturnsAsync(financialPeriods);

        // Act
        var result = await _service.GetFinancialPeriods(userId);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal(2025, result[0].Year);
        Assert.Equal(5, result[0].Month);
        Assert.Equal(3, result[0].Categories.Count);
        Assert.Equal(-2000m, result[0].Totals.Income);
        Assert.Equal(426.25m, result[0].Totals.Expenses);
        Assert.Equal(1573.75m, result[0].Totals.NetProfit);
        _mockRepository.Verify(r => r.GetFinancialPeriodsAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetFinancialPeriods_ReturnsEmptyList_WhenRepositoryReturnsEmptyList()
    {
        // Arrange
        var userId = "user123";

        _mockRepository.Setup(r => r.GetFinancialPeriodsAsync(userId))
            .ReturnsAsync(new List<FinancialPeriodDto>());

        // Act
        var result = await _service.GetFinancialPeriods(userId);

        // Assert
        Assert.Empty(result);
        _mockRepository.Verify(r => r.GetFinancialPeriodsAsync(userId), Times.Once);
    }
}
using Microsoft.Extensions.Logging;
using Moq;
using ZenWealth.Core.Application.Services;
using ZenWealth.Core.Domain.Entities;
using ZenWealth.Core.Domain.Interfaces;
using ZenWealth.Core.Models;
using ZenWealth.Core.Utils.Constants;
using ZenWealth.Tests.TestClasses;

namespace ZenWealth.Tests.UnitTests.BudgetServiceTests;

public class BudgetServiceTests
{
    #region BudgetServiceTests Setup
    
    private readonly Mock<IBudgetRepository> _budgetRepositoryMock;
    private readonly TestBudgetService _budgetService;
    private readonly Mock<ITransactionRepository> _transactionRepositoryMock;

    public BudgetServiceTests()
    {
        var loggerMock = new Mock<ILogger<BudgetService>>();
        _budgetRepositoryMock = new Mock<IBudgetRepository>();
        _transactionRepositoryMock = new Mock<ITransactionRepository>();
        _budgetService = new TestBudgetService(
            loggerMock.Object,
            _budgetRepositoryMock.Object,
            _transactionRepositoryMock.Object
        );
    }
    
    #endregion
    
    #region AddBudgetAsync Tests

    [Fact]
    public async Task AddBudgetAsync_WhenBudgetDoesNotExist_ShouldAddNewBudget()
    {
        // Arrange
        var budget = new Budget
        {
            UserId = "user123",
            Category = ExpenseCategories.FOOD_AND_DRINK.ToString(),
            Limit = 500.00m,
            Day = 1
        };

        _budgetRepositoryMock
            .Setup(repo => repo.GetBudgetByUserIdAndCategoryAsync(budget.UserId, budget.Category))
            .ReturnsAsync((Budget?)null);

        // Act
        await _budgetService.AddBudgetAsync(budget);

        // Assert
        _budgetRepositoryMock.Verify(repo => repo.AddBudgetAsync(budget), Times.Once);
        _budgetRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task AddBudgetAsync_WhenBudgetExists_ShouldUpdateExistingBudget()
    {
        // Arrange
        var budget = new Budget
        {
            UserId = "user123",
            Category = ExpenseCategories.FOOD_AND_DRINK.ToString(),
            Limit = 500.00m,
            Day = 1
        };

        var existingBudget = new Budget
        {
            Id = 1,
            UserId = "user123",
            Category = ExpenseCategories.FOOD_AND_DRINK.ToString(),
            Limit = 300.00m,
            Day = 15
        };

        _budgetRepositoryMock
            .Setup(repo => repo.GetBudgetByUserIdAndCategoryAsync(budget.UserId, budget.Category))
            .ReturnsAsync(existingBudget);

        // Act
        await _budgetService.AddBudgetAsync(budget);

        // Assert
        Assert.Equal(budget.Limit, existingBudget.Limit);
        Assert.Equal(budget.Day, existingBudget.Day);
        _budgetRepositoryMock.Verify(repo => repo.AddBudgetAsync(It.IsAny<Budget>()), Times.Never);
        _budgetRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    #endregion

    #region GetBudgetsAsync Tests

    [Fact]
    public async Task GetBudgetsAsync_WhenUserHasBudgets_ShouldReturnBudgetsWithSpendingInfo()
    {
        // Arrange
        const string userId = "user123";
        var currentDate = new DateOnly(2025, 5, 7); // Using current date from the test
        _budgetService.SetCurrentDate(currentDate);

        var userBudgets = new List<Budget>
        {
            new()
            {
                Id = 1, UserId = userId, Category = ExpenseCategories.FOOD_AND_DRINK.ToString(), Limit = 500.00m,
                Day = 1
            },
            new()
            {
                Id = 2, UserId = userId, Category = ExpenseCategories.ENTERTAINMENT.ToString(), Limit = 200.00m, Day = 1
            }
        };

        var categoryTotals = new List<CategoryTotalDto>
        {
            new() { Category = ExpenseCategories.FOOD_AND_DRINK.ToString(), Total = 250.00m },
            new() { Category = ExpenseCategories.ENTERTAINMENT.ToString(), Total = 150.00m }
        };

        _budgetRepositoryMock
            .Setup(repo => repo.GetBudgetsByUserIdAsync(userId))
            .ReturnsAsync(userBudgets);

        // Since budget day is 1 and current date is May 7, we'd use May 1 as budget start date
        var expectedBudgetDate = new DateOnly(2025, 5, 1);

        _transactionRepositoryMock
            .Setup(repo => repo.GetTransactionsByCategoryAsync(
                userId,
                It.Is<DateOnly>(d =>
                    d.Year == expectedBudgetDate.Year && d.Month == expectedBudgetDate.Month &&
                    d.Day == expectedBudgetDate.Day),
                null,
                0))
            .ReturnsAsync(categoryTotals);

        // Act
        var result = await _budgetService.GetBudgetsAsync(userId);

        // Assert
        Assert.Equal(2, result.Count);

        // Check FOOD_AND_DRINK budget
        var foodBudget = result.First(b => b.Category == ExpenseCategories.FOOD_AND_DRINK.ToString());
        Assert.Equal(500.00m, foodBudget.Limit);
        Assert.Equal(250.00m, foodBudget.Spent);
        Assert.Equal(250.00m, foodBudget.Remaining);

        // Check ENTERTAINMENT budget
        var entertainmentBudget = result.First(b => b.Category == ExpenseCategories.ENTERTAINMENT.ToString());
        Assert.Equal(200.00m, entertainmentBudget.Limit);
        Assert.Equal(150.00m, entertainmentBudget.Spent);
        Assert.Equal(50.00m, entertainmentBudget.Remaining);
    }

    [Fact]
    public async Task GetBudgetsAsync_WhenBudgetDayIsAfterCurrentDay_ShouldUsePreviousMonth()
    {
        // Arrange
        const string userId = "user123";
        var testDate = new DateOnly(2025, 5, 7); // Current day is 7
        _budgetService.SetCurrentDate(testDate);

        var userBudgets = new List<Budget>
        {
            new()
            {
                Id = 1, UserId = userId, User = new User(), Category = nameof(ExpenseCategories.FOOD_AND_DRINK),
                Limit = 500.00m, Day = 15
            } // Budget day is 15
        };

        _budgetRepositoryMock
            .Setup(repo => repo.GetBudgetsByUserIdAsync(userId))
            .ReturnsAsync(userBudgets);

        // Since budget day (15) is after the current day (7), we should use April 15 as the budget start date
        var expectedBudgetDate = new DateOnly(2025, 4, 15);

        _transactionRepositoryMock
            .Setup(repo => repo.GetTransactionsByCategoryAsync(
                userId,
                It.IsAny<DateOnly>(),
                null,
                0))
            .ReturnsAsync([]);

        // Act
        var result = await _budgetService.GetBudgetsAsync(userId);

        // Assert
        _transactionRepositoryMock.Verify(repo => repo.GetTransactionsByCategoryAsync(
            userId,
            It.Is<DateOnly>(d => d.Month == 4 && d.Day == 15), // Should use April 15
            null,
            0), Times.Once);
    }

    [Fact]
    public async Task GetBudgetsAsync_WhenCategoryHasNoTransactions_ShouldReturnZeroSpent()
    {
        // Arrange
        var userId = "user123";
        var currentDate = new DateOnly(2025, 5, 7);
        _budgetService.SetCurrentDate(currentDate);

        var userBudgets = new List<Budget>
        {
            new()
            {
                Id = 1, UserId = userId, Category = ExpenseCategories.FOOD_AND_DRINK.ToString(), Limit = 500.00m,
                Day = 1
            },
            new()
            {
                Id = 2, UserId = userId, Category = ExpenseCategories.ENTERTAINMENT.ToString(), Limit = 200.00m, Day = 1
            }
        };

        var categoryTotals = new List<CategoryTotalDto>
        {
            new() { Category = ExpenseCategories.FOOD_AND_DRINK.ToString(), Total = 250.00m }
            // No ENTERTAINMENT transactions
        };

        _budgetRepositoryMock
            .Setup(repo => repo.GetBudgetsByUserIdAsync(userId))
            .ReturnsAsync(userBudgets);

        _transactionRepositoryMock
            .Setup(repo => repo.GetTransactionsByCategoryAsync(
                userId,
                It.IsAny<DateOnly>(),
                null,
                0))
            .ReturnsAsync(categoryTotals);

        // Act
        var result = await _budgetService.GetBudgetsAsync(userId);

        // Assert
        var entertainmentBudget = result.First(b => b.Category == ExpenseCategories.ENTERTAINMENT.ToString());
        Assert.Equal(0m, entertainmentBudget.Spent);
        Assert.Equal(200.00m, entertainmentBudget.Remaining);
    }

    [Fact]
    public async Task GetBudgetsAsync_WhenUserHasNoBudgets_ShouldReturnEmptyList()
    {
        // Arrange
        var userId = "user123";
        var currentDate = new DateOnly(2025, 5, 7);
        _budgetService.SetCurrentDate(currentDate);

        _budgetRepositoryMock
            .Setup(repo => repo.GetBudgetsByUserIdAsync(userId))
            .ReturnsAsync([]);

        // Act
        var result = await _budgetService.GetBudgetsAsync(userId);

        // Assert
        Assert.Empty(result);
        _transactionRepositoryMock.Verify(
            repo => repo.GetTransactionsByCategoryAsync(
                It.IsAny<string>(),
                It.IsAny<DateOnly>(),
                null,
                0),
            Times.Once);
    }

    #endregion

    #region DeleteBudgetAsync Tests

    [Fact]
    public async Task DeleteBudgetAsync_WhenBudgetExists_ShouldDeleteBudget()
    {
        // Arrange
        var userId = "user123";
        var category = "food_and_drink"; // Note: lowercase, the service should convert to uppercase

        var budget = new Budget
        {
            Id = 1,
            UserId = userId,
            Category = ExpenseCategories.FOOD_AND_DRINK.ToString(),
            Limit = 500.00m,
            Day = 1
        };

        _budgetRepositoryMock
            .Setup(repo => repo.GetBudgetByUserIdAndCategoryAsync(userId, ExpenseCategories.FOOD_AND_DRINK.ToString()))
            .ReturnsAsync(budget);

        // Act
        await _budgetService.DeleteBudgetAsync(category, userId);

        // Assert
        _budgetRepositoryMock.Verify(repo => repo.DeleteBudgetAsync(budget), Times.Once);
    }

    [Fact]
    public async Task DeleteBudgetAsync_WhenBudgetDoesNotExist_ShouldNotCallDelete()
    {
        // Arrange
        var userId = "user123";
        var category = ExpenseCategories.FOOD_AND_DRINK.ToString();

        _budgetRepositoryMock
            .Setup(repo => repo.GetBudgetByUserIdAndCategoryAsync(userId, category))
            .ReturnsAsync((Budget?)null);

        // Act
        await _budgetService.DeleteBudgetAsync(category, userId);

        // Assert
        _budgetRepositoryMock.Verify(repo => repo.DeleteBudgetAsync(It.IsAny<Budget>()), Times.Never);
    }

    #endregion
}
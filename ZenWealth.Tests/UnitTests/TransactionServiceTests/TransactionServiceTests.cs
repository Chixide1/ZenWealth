using Microsoft.Extensions.Logging;
using Moq;
using ZenWealth.Core.Application.Services;
using ZenWealth.Core.Domain.Constants;
using ZenWealth.Core.Domain.Interfaces;
using ZenWealth.Core.Dtos;
using ZenWealth.Core.Models;

namespace ZenWealth.Tests.UnitTests.TransactionServiceTests;

public partial class TransactionServiceTests
{
    private readonly Mock<ITransactionRepository> _mockRepository;
    private readonly TransactionService _service;

    public TransactionServiceTests()
    {
        _mockRepository = new Mock<ITransactionRepository>();
        var mockLogger = new Mock<ILogger<TransactionService>>();
        _service = new TransactionService(_mockRepository.Object, mockLogger.Object);
    }

    [Fact]
    public async Task GetTransactionsAsync_ReturnsTransactions_WhenRepositoryReturnsTransactions()
    {
        // Arrange
        const string userId = "user123";
        var transactionParams = new TransactionParams
        {
            PageSize = 10,
            Sort = TransactionSortOption.DATE_DESC
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
        const string userId = "user123";
        var transactionParams = new TransactionParams
        {
            PageSize = 10,
            Sort = TransactionSortOption.DATE_DESC
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
    public async Task GetTransactionsByCategoryAsync_ReturnsCategoryTotals_WhenRepositoryReturnsData()
    {
        // Arrange
        const string userId = "user123";
        var beginDate = new DateOnly(2025, 1, 1);
        var endDate = new DateOnly(2025, 5, 1);
        const int count = 5;

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
}
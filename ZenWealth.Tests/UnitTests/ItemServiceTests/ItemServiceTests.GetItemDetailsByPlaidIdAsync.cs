using Moq;
using ZenWealth.Core.Models;

namespace ZenWealth.Tests.UnitTests.ItemServiceTests;

public partial class ItemServiceTests
{
    [Fact]
    public async Task GetItemDetailsByPlaidIdAsync_WhenItemExists_ReturnsItemDetails()
    {
        // Arrange
        const string plaidItemId = "plaid-item-123";
        var expected = new ItemDetailsDto
        {
            Id = 1,
            UserId = "user123",
            PlaidItemId = plaidItemId,
            InstitutionName = "Test Bank"
        };

        _mockItemRepository.Setup(repo => repo.GetItemDetailsByPlaidIdAsync(plaidItemId))
            .ReturnsAsync(expected);

        // Act
        var result = await _service.GetItemDetailsByPlaidIdAsync(plaidItemId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expected.Id, result.Id);
        Assert.Equal(expected.UserId, result.UserId);
        Assert.Equal(expected.PlaidItemId, result.PlaidItemId);
        Assert.Equal(expected.InstitutionName, result.InstitutionName);
        _mockItemRepository.Verify(repo => repo.GetItemDetailsByPlaidIdAsync(plaidItemId), Times.Once);
    }

    [Fact]
    public async Task GetItemDetailsByPlaidIdAsync_WhenItemDoesNotExist_ReturnsNull()
    {
        // Arrange
        const string plaidItemId = "non-existent-item";
        _mockItemRepository.Setup(repo => repo.GetItemDetailsByPlaidIdAsync(plaidItemId))
            .ReturnsAsync((ItemDetailsDto)null);

        // Act
        var result = await _service.GetItemDetailsByPlaidIdAsync(plaidItemId);

        // Assert
        Assert.Null(result);
        _mockItemRepository.Verify(repo => repo.GetItemDetailsByPlaidIdAsync(plaidItemId), Times.Once);
    }
}
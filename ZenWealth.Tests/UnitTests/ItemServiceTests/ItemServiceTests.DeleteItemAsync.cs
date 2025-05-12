using Going.Plaid.Entity;
using Going.Plaid.Item;
using Moq;
using Item = ZenWealth.Core.Domain.Entities.Item;

namespace ZenWealth.Tests.UnitTests.ItemServiceTests;

public partial class ItemServiceTests
{
    [Fact]
    public async Task DeleteItemAsync_WhenItemExists_DeletesItemAndReturnsTrue()
    {
        // Arrange
        const string userId = "user123";
        const int itemId = 1;
        const string accessToken = "access-token-123";

        var item = new Item
        {
            Id = itemId,
            UserId = userId,
            AccessToken = accessToken,
            PlaidItemId = "plaid-item-123",
            InstitutionName = "Test Bank",
            InstitutionId = "inst-123"
        };

        _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(itemId, userId))
            .ReturnsAsync(item);

        _mockPlaidService.Setup(service => service.RemoveItemAsync(accessToken))
            .ReturnsAsync(new ItemRemoveResponse { Error = null });

        // Act
        var result = await _service.DeleteItemAsync(userId, itemId);

        // Assert
        Assert.True(result);
        _mockItemRepository.Verify(repo => repo.GetByIdAndUserIdAsync(itemId, userId), Times.Once);
        _mockPlaidService.Verify(service => service.RemoveItemAsync(accessToken), Times.Once);
        _mockItemRepository.Verify(repo => repo.DeleteAsync(item), Times.Once);
    }

    [Fact]
    public async Task DeleteItemAsync_WhenItemDoesNotExist_ReturnsFalse()
    {
        // Arrange
        const string userId = "user123";
        const int itemId = 999;

        _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(itemId, userId))
            .ReturnsAsync((Item)null);

        // Act
        var result = await _service.DeleteItemAsync(userId, itemId);

        // Assert
        Assert.False(result);
        _mockItemRepository.Verify(repo => repo.GetByIdAndUserIdAsync(itemId, userId), Times.Once);
        _mockPlaidService.Verify(service => service.RemoveItemAsync(It.IsAny<string>()), Times.Never);
        _mockItemRepository.Verify(repo => repo.DeleteAsync(It.IsAny<Item>()), Times.Never);
    }

    [Fact]
    public async Task DeleteItemAsync_WhenPlaidRemoveFails_ReturnsFalse()
    {
        // Arrange
        const string userId = "user123";
        const int itemId = 1;
        const string accessToken = "access-token-123";

        var item = new Item
        {
            Id = itemId,
            UserId = userId,
            AccessToken = accessToken,
            PlaidItemId = "plaid-item-123",
            InstitutionName = "Test Bank",
            InstitutionId = "inst-123"
        };

        _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(itemId, userId))
            .ReturnsAsync(item);

        _mockPlaidService.Setup(service => service.RemoveItemAsync(accessToken))
            .ReturnsAsync(new ItemRemoveResponse { Error = new PlaidError { ErrorMessage = "Failed" } });

        // Act
        var result = await _service.DeleteItemAsync(userId, itemId);

        // Assert
        Assert.False(result);
        _mockItemRepository.Verify(repo => repo.GetByIdAndUserIdAsync(itemId, userId), Times.Once);
        _mockPlaidService.Verify(service => service.RemoveItemAsync(accessToken), Times.Once);
        _mockItemRepository.Verify(repo => repo.DeleteAsync(It.IsAny<Item>()), Times.Never);
    }

    [Fact]
    public async Task DeleteItemByPlaidItemIdAsync_WhenItemExists_DeletesItemAndReturnsTrue()
    {
        // Arrange
        const string plaidItemId = "plaid-item-123";
        var item = new Item
        {
            Id = 1,
            UserId = "user123",
            PlaidItemId = plaidItemId,
            InstitutionName = "Test Bank",
            InstitutionId = "inst-123",
            AccessToken = "access-token-123"
        };

        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(plaidItemId))
            .ReturnsAsync(item);

        // Act
        var result = await _service.DeleteItemByPlaidItemIdAsync(plaidItemId);

        // Assert
        Assert.True(result);
        _mockItemRepository.Verify(repo => repo.GetByPlaidIdAsync(plaidItemId), Times.Once);
        _mockItemRepository.Verify(repo => repo.DeleteAsync(item), Times.Once);
    }

    [Fact]
    public async Task DeleteItemByPlaidItemIdAsync_WhenItemDoesNotExist_ReturnsFalse()
    {
        // Arrange
        const string plaidItemId = "non-existent-plaid-item";

        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(plaidItemId))
            .ReturnsAsync((Item)null);

        // Act
        var result = await _service.DeleteItemByPlaidItemIdAsync(plaidItemId);

        // Assert
        Assert.False(result);
        _mockItemRepository.Verify(repo => repo.GetByPlaidIdAsync(plaidItemId), Times.Once);
        _mockItemRepository.Verify(repo => repo.DeleteAsync(It.IsAny<Item>()), Times.Never);
    }
}
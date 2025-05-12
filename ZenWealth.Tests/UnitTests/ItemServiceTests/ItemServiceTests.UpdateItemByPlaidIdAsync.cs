using Going.Plaid.Entity;
using Going.Plaid.Transactions;
using Moq;
using Account = ZenWealth.Core.Domain.Entities.Account;
using Item = ZenWealth.Core.Domain.Entities.Item;
using Transaction = Going.Plaid.Entity.Transaction;

namespace ZenWealth.Tests.UnitTests.ItemServiceTests;

public partial class ItemServiceTests
{
    [Fact]
    public async Task UpdateItemByPlaidIdAsync_WhenItemExists_UpdatesItemAndReturnsTransactionCount()
    {
        // Arrange
        const string plaidItemId = "plaid-item-123";
        var item = new Item
        {
            Id = 1,
            UserId = "user123",
            PlaidItemId = plaidItemId,
            AccessToken = "access-token-123",
            InstitutionName = "Test Bank",
            InstitutionId = "inst-123"
        };

        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(plaidItemId))
            .ReturnsAsync(item);

        _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(item.Id, item.UserId))
            .ReturnsAsync(item);

        // Setup transaction sync
        var transaction = new Transaction
        {
            TransactionId = "tx-123",
            AccountId = "acc-123",
            Name = "Test Transaction",
            Amount = 50.00m,
            Date = new DateOnly(2023, 5, 12)
        };

        var account = new Going.Plaid.Entity.Account
        {
            AccountId = "acc-123",
            Name = "Test Account",
            Type = AccountType.Depository,
            Subtype = AccountSubtype.Checking,
            Balances = new AccountBalance { Current = 1000.00m, Available = 900.00m },
            Mask = "1234"
        };

        _mockPlaidService.Setup(service => service.SyncTransactionsAsync(item.AccessToken, It.IsAny<string>()))
            .ReturnsAsync(new TransactionsSyncResponse
            {
                Added = new List<Transaction> { transaction },
                Modified = new List<Transaction>(),
                Removed = new List<RemovedTransaction>(),
                Accounts = new List<Going.Plaid.Entity.Account> { account },
                HasMore = false,
                NextCursor = "next-cursor"
            });

        // Setup account mapping for processing transactions
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(item.Id))
            .ReturnsAsync(new HashSet<string>());

        _mockTransactionRepository.Setup(repo => repo.GetExistingTransactionIdsAsync(It.IsAny<List<string>>()))
            .ReturnsAsync(new HashSet<string>());

        _mockAccountRepository.Setup(repo => repo.GetAccountMappingAsync(It.IsAny<List<string>>()))
            .ReturnsAsync(new Dictionary<string, int> { { "acc-123", 1 } });

        // Act
        var result = await _service.UpdateItemByPlaidIdAsync(plaidItemId);

        // Assert
        Assert.Equal(1, result); // 1 transaction was added

        // Verify item was fetched
        _mockItemRepository.Verify(repo => repo.GetByPlaidIdAsync(plaidItemId), Times.Once);

        // Verify transactions were synced
        _mockPlaidService.Verify(service =>
            service.SyncTransactionsAsync(item.AccessToken, It.IsAny<string>()), Times.AtLeastOnce);

        // Verify item was updated
        _mockItemRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Item>()), Times.AtLeastOnce);

        // Verify account was processed
        _mockAccountRepository.Verify(repo => repo.AddRangeAsync(It.IsAny<List<Account>>()), Times.AtLeastOnce);

        // Verify transaction was processed
        _mockTransactionRepository.Verify(
            repo => repo.AddRangeAsync(It.IsAny<List<Core.Domain.Entities.Transaction>>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task UpdateItemByPlaidIdAsync_WhenItemDoesNotExist_ReturnsZero()
    {
        // Arrange
        const string plaidItemId = "non-existent-plaid-item";

        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(plaidItemId))
            .ReturnsAsync((Item)null);

        // Act
        var result = await _service.UpdateItemByPlaidIdAsync(plaidItemId);

        // Assert
        Assert.Equal(0, result);
        _mockItemRepository.Verify(repo => repo.GetByPlaidIdAsync(plaidItemId), Times.Once);
        _mockPlaidService.Verify(service =>
            service.SyncTransactionsAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }
}
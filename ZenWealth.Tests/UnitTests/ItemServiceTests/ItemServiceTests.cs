using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Transactions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using ZenWealth.Core.Application.Services;
using ZenWealth.Core.Domain.Interfaces;
using ZenWealth.Core.Dtos;
using ZenWealth.Core.Models;
using AccountEntity = ZenWealth.Core.Domain.Entities.Account;
using ItemEntity = ZenWealth.Core.Domain.Entities.Item;
using TransactionEntity = ZenWealth.Core.Domain.Entities.Transaction;

namespace ZenWealth.Tests.UnitTests.ItemServiceTests;

public partial class ItemServiceTests
{
    private readonly Mock<IItemRepository> _mockItemRepository;
    private readonly Mock<IAccountRepository> _mockAccountRepository;
    private readonly Mock<ITransactionRepository> _mockTransactionRepository;
    private readonly Mock<ILogger<ItemService>> _mockLogger;
    private readonly Mock<IPlaidService> _mockPlaidService;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly ItemService _service;

    public ItemServiceTests()
    {
        _mockItemRepository = new Mock<IItemRepository>();
        _mockAccountRepository = new Mock<IAccountRepository>();
        _mockTransactionRepository = new Mock<ITransactionRepository>();
        _mockLogger = new Mock<ILogger<ItemService>>();
        _mockPlaidService = new Mock<IPlaidService>();
        _mockConfiguration = new Mock<IConfiguration>();

        _mockConfiguration.Setup(config =>
            config["Plaid:WebhookUrl"]).Returns("https://example.com/webhook");

        _service = new ItemService(
            _mockItemRepository.Object,
            _mockAccountRepository.Object,
            _mockTransactionRepository.Object,
            _mockLogger.Object,
            _mockPlaidService.Object,
            _mockConfiguration.Object);
    }

 [Fact]
    public async Task CheckItemExistsAsync_ReturnsExpectedResult()
    {
        // Arrange
        const string userId = "user123";
        _mockItemRepository.Setup(repo => repo.ExistsForUserAsync(userId))
            .ReturnsAsync(true);

        // Act
        var result = await _service.CheckItemExistsAsync(userId);

        // Assert
        Assert.True(result);
        _mockItemRepository.Verify(repo => repo.ExistsForUserAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetItemsAsync_ReturnsInstitutionsForUser()
    {
        // Arrange
        const string userId = "user123";
        var expectedInstitutions = new List<InstitutionDto>
        {
            new() { Id = 1, Name = "Bank A" },
            new() { Id = 2, Name = "Bank B" }
        };

        _mockItemRepository.Setup(repo => repo.GetInstitutionsForUserAsync(userId))
            .ReturnsAsync(expectedInstitutions);

        // Act
        var result = await _service.GetItemsAsync(userId);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal("Bank A", result[0].Name);
        Assert.Equal("Bank B", result[1].Name);
        _mockItemRepository.Verify(repo => repo.GetInstitutionsForUserAsync(userId), Times.Once);
    }

    [Fact]
    public async Task CreateUpdateLinkTokenAsync_WhenItemDoesNotExist_ReturnsFailureResponse()
    {
        // Arrange
        const string userId = "user123";
        const int itemId = 999;

        _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(itemId, userId))
            .ReturnsAsync((ItemEntity)null);

        // Act
        var result = await _service.CreateUpdateLinkTokenAsync(userId, itemId);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Null(result.LinkToken);
        Assert.Contains($"Item with ID {itemId} not found", result.ErrorMessage);
        _mockItemRepository.Verify(repo => repo.GetByIdAndUserIdAsync(itemId, userId), Times.Once);
        _mockPlaidService.Verify(
            service => service.CreateUpdateLinkTokenAsync(It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<string>(), new LinkTokenAccountFilters()), Times.Never);
    }

    [Fact]
    public async Task UpdateItemsAsync_SkipsRecentlyFetchedItems()
    {
        // Arrange
        const string userId = "user123";
        var recentItem = new ItemEntity
        {
            Id = 1,
            UserId = userId,
            AccessToken = "access-token-123",
            PlaidItemId = "plaid-item-123",
            InstitutionName = "Test Bank",
            InstitutionId = "inst-123",
            LastFetched = DateTime.Now.AddHours(-12) // Less than 1 day ago
        };
        var oldItem = new ItemEntity
        {
            Id = 2,
            UserId = userId,
            AccessToken = "access-token-456",
            PlaidItemId = "plaid-item-456",
            InstitutionName = "Another Bank",
            InstitutionId = "inst-456",
            LastFetched = DateTime.Now.AddDays(-2) // More than 1 day ago
        };

        var items = new List<ItemEntity> { recentItem, oldItem };

        _mockItemRepository.Setup(repo => repo.GetItemsForUpdateAsync(userId))
            .ReturnsAsync(items);
            
        // Setup for GetByIdAndUserIdAsync which is called in UpdateSingleItemAsync
        _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(oldItem.Id, userId))
            .ReturnsAsync(oldItem);
            
        // Setup for the old item that should be updated
        _mockPlaidService.Setup(service => service.SyncTransactionsAsync(oldItem.AccessToken, It.IsAny<string>()))
            .ReturnsAsync(new TransactionsSyncResponse
            {
                Added = new List<Transaction>(),
                Modified = new List<Transaction>(),
                Removed = new List<RemovedTransaction>(),
                HasMore = false,
                NextCursor = "next-cursor",
                Accounts = new List<Going.Plaid.Entity.Account>()
            });
            
        // Setup account repository mocks needed for transaction processing
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(It.IsAny<int>()))
            .ReturnsAsync(new HashSet<string>());
            
        _mockTransactionRepository.Setup(repo => repo.GetExistingTransactionIdsAsync(It.IsAny<List<string>>()))
            .ReturnsAsync(new HashSet<string>());

        // Act
        var result = await _service.UpdateItemsAsync(userId);

        // Assert
        Assert.Equal(0, result); // No transactions were added in our mock
        
        // Verify the recent item was skipped
        _mockPlaidService.Verify(service => 
            service.SyncTransactionsAsync(recentItem.AccessToken, It.IsAny<string>()), Times.Never);
            
        // Verify the old item was updated
        _mockPlaidService.Verify(service => 
            service.SyncTransactionsAsync(oldItem.AccessToken, It.IsAny<string>()), Times.AtLeastOnce);
    }

    [Fact]
    public async Task UpdateSingleItemAsync_ProcessesTransactionsCorrectly()
    {
        // Arrange
        const int itemId = 1;
        const string userId = "user123";
        const string accessToken = "access-token-123";
        
        var item = new ItemEntity
        {
            Id = itemId,
            UserId = userId,
            AccessToken = accessToken,
            PlaidItemId = "plaid-item-123",
            InstitutionName = "Test Bank",
            InstitutionId = "inst-123",
            Cursor = null // Starting without a cursor
        };
        
        _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(itemId, userId))
            .ReturnsAsync(item);
            
        // Create test data for transactions sync
        var addedTransaction = new Transaction
        {
            TransactionId = "tx-added-123",
            AccountId = "acc-123",
            Name = "Added Transaction",
            Amount = 50.00m,
            Date = new DateOnly(2023, 5, 12)
        };
        
        var modifiedTransaction = new Transaction
        {
            TransactionId = "tx-modified-123",
            AccountId = "acc-123",
            Name = "Modified Transaction",
            Amount = 75.00m,
            Date = new DateOnly(2023, 5, 13)
        };
        
        var removedTransaction = new RemovedTransaction
        {
            TransactionId = "tx-removed-123"
        };
        
        var account = new Account
        {
            AccountId = "acc-123",
            Name = "Test Account",
            Type = AccountType.Depository,
            Subtype = AccountSubtype.Checking,
            Balances = new AccountBalance { Current = 1000.00m, Available = 900.00m },
            Mask = "1234"
        };
        
        // First call has transactions and more data
        _mockPlaidService.Setup(service => service.SyncTransactionsAsync(accessToken, null))
            .ReturnsAsync(new TransactionsSyncResponse
            {
                Added = new List<Transaction> { addedTransaction },
                Modified = new List<Transaction> { modifiedTransaction },
                Removed = new List<RemovedTransaction> { removedTransaction },
                Accounts = new List<Going.Plaid.Entity.Account> { account },
                HasMore = true,
                NextCursor = "next-cursor"
            });
            
        // Second call has no more data
        _mockPlaidService.Setup(service => service.SyncTransactionsAsync(accessToken, "next-cursor"))
            .ReturnsAsync(new TransactionsSyncResponse
            {
                Added = new List<Transaction>(),
                Modified = new List<Transaction>(),
                Removed = new List<RemovedTransaction>(),
                Accounts = new List<Going.Plaid.Entity.Account>(),
                HasMore = false,
                NextCursor = "final-cursor"
            });
            
        // Setup account and transaction repository methods
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(itemId))
            .ReturnsAsync(new HashSet<string>());
            
        _mockTransactionRepository.Setup(repo => repo.GetExistingTransactionIdsAsync(It.IsAny<List<string>>()))
            .ReturnsAsync(new HashSet<string> { "tx-modified-123" }); // The modified transaction already exists
            
        _mockAccountRepository.Setup(repo => repo.GetAccountMappingAsync(It.IsAny<List<string>>()))
            .ReturnsAsync(new Dictionary<string, int> { { "acc-123", 1 } });

        // Act
        // Call the private method using reflection
        var methodInfo = typeof(ItemService).GetMethod("UpdateSingleItemAsync", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        
        var result = await (Task<int>)methodInfo.Invoke(_service, new object[] { itemId, userId });

        // Assert
        Assert.Equal(2, result); // 1 added + 1 modified transaction
        
        // Verify SyncTransactionsAsync was called twice
        _mockPlaidService.Verify(service => service.SyncTransactionsAsync(accessToken, null), Times.Once);
        _mockPlaidService.Verify(service => service.SyncTransactionsAsync(accessToken, "next-cursor"), Times.Once);
        
        // Verify item was updated with new cursor
        _mockItemRepository.Verify(repo => repo.UpdateAsync(It.Is<ItemEntity>(i => 
            i.Cursor == "final-cursor" && i.LastFetched != null)), Times.AtLeastOnce);
            
        // Verify accounts were processed
        _mockAccountRepository.Verify(repo => repo.AddRangeAsync(It.IsAny<List<AccountEntity>>()), Times.Once);
        
        // Verify transactions were processed
        _mockTransactionRepository.Verify(repo => repo.AddRangeAsync(It.IsAny<List<TransactionEntity>>()), Times.Once);
        _mockTransactionRepository.Verify(repo => repo.UpdateRangeAsync(It.IsAny<List<TransactionEntity>>()), Times.Once);
        _mockTransactionRepository.Verify(repo => repo.RemoveByPlaidIdsAsync(It.Is<List<string>>(
            ids => ids.Count == 1 && ids[0] == "tx-removed-123")), Times.Once);
    }
    
    [Fact]
    public async Task ProcessAccountsAsync_HandlesNewAccountsCorrectly()
    {
        // Arrange
        const int itemId = 1;
        const string userId = "user123";
        
        var existingAccountIds = new HashSet<string> { "existing-acc-123" };
        
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(itemId))
            .ReturnsAsync(existingAccountIds);
            
        var accounts = new List<Going.Plaid.Entity.Account>
        {
            new()
            {
                AccountId = "existing-acc-123", // Should be skipped
                Name = "Existing Account",
                Type = AccountType.Depository,
                Subtype = AccountSubtype.Checking,
                Balances = new AccountBalance { Current = 1000.00m, Available = 900.00m },
                Mask = "1234"
            },
            new()
            {
                AccountId = "new-acc-456", // Should be added
                Name = "New Account",
                Type = AccountType.Credit,
                Subtype = AccountSubtype.CreditCard,
                Balances = new AccountBalance { Current = 500.00m, Available = 400.00m },
                Mask = "5678",
                OfficialName = "Rewards Card"
            }
        };

        // Act
        // Call the private method using reflection
        var methodInfo = typeof(ItemService).GetMethod("ProcessAccountsAsync", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        
        await (Task)methodInfo.Invoke(_service, new object[] { accounts, itemId, userId });

        // Assert
        // Verify only the new account was added
        _mockAccountRepository.Verify(repo => repo.AddRangeAsync(It.Is<List<AccountEntity>>(
            list => list.Count == 1 && 
                   list[0].PlaidAccountId == "new-acc-456" &&
                   list[0].Name == "New Account" &&
                   list[0].Type == "Credit" &&
                   list[0].Subtype == "CreditCard" &&
                   list[0].CurrentBalance == 500.00m &&
                   list[0].AvailableBalance == 400.00m &&
                   list[0].Mask == "5678" &&
                   list[0].OfficialName == "Rewards Card" &&
                   list[0].ItemId == itemId &&
                   list[0].UserId == userId
        )), Times.Once);
    }

    [Fact]
    public async Task ProcessTransactionsAsync_HandlesAddedAndModifiedTransactionsCorrectly()
    {
        // Arrange
        const string userId = "user123";
        
        // Create test transactions
        var addedTransaction = new Transaction
        {
            TransactionId = "tx-added-123",
            AccountId = "acc-123",
            Name = "Added Transaction",
            Amount = 50.00m,
            Date = new DateOnly(2023, 5, 12),
            PaymentChannel = TransactionPaymentChannelEnum.Online,
            PersonalFinanceCategory = new PersonalFinanceCategory { Primary = "SHOPPING" },
            PersonalFinanceCategoryIconUrl = "https://example.com/icon.png",
            IsoCurrencyCode = "USD"
        };
        
        var modifiedTransaction = new Transaction
        {
            TransactionId = "tx-modified-123",
            AccountId = "acc-123",
            Name = "Modified Transaction",
            Amount = 75.00m,
            Date = new DateOnly(2023, 5, 13),
            PaymentChannel = TransactionPaymentChannelEnum.InStore,
            PersonalFinanceCategory = new PersonalFinanceCategory { Primary = "FOOD_AND_DRINK" },
            IsoCurrencyCode = "USD"
        };
        
        var transactions = new List<Transaction> { addedTransaction, modifiedTransaction };
        
        // Setup existing transaction IDs
        _mockTransactionRepository.Setup(repo => repo.GetExistingTransactionIdsAsync(
            It.Is<List<string>>(ids => ids.Contains("tx-added-123") && ids.Contains("tx-modified-123"))))
            .ReturnsAsync(new HashSet<string> { "tx-modified-123" }); // Only the modified transaction exists
            
        // Setup account mapping
        _mockAccountRepository.Setup(repo => repo.GetAccountMappingAsync(
            It.Is<List<string>>(ids => ids.Contains("acc-123"))))
            .ReturnsAsync(new Dictionary<string, int> { { "acc-123", 1 } });

        // Act
        // Call the private method using reflection
        var methodInfo = typeof(ItemService).GetMethod("ProcessTransactionsAsync", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        
        // First call for added transactions
        var addedCount = await (Task<int>)methodInfo.Invoke(_service, new object[] { transactions, userId, false });
        
        // Second call for modified transactions
        var modifiedCount = await (Task<int>)methodInfo.Invoke(_service, new object[] { transactions, userId, true });

        // Assert
        Assert.Equal(1, addedCount); // Only one transaction was added
        Assert.Equal(1, modifiedCount); // Only one transaction was modified
        
        // Verify transactions were added correctly
        _mockTransactionRepository.Verify(repo => repo.AddRangeAsync(It.Is<List<TransactionEntity>>(
            list => list.Count == 1 && 
                   list[0].PlaidTransactionId == "tx-added-123" &&
                   list[0].Name == "Added Transaction" &&
                   list[0].Amount == 50.00m &&
                   list[0].UserId == userId &&
                   list[0].AccountId == 1 &&
                   list[0].PaymentChannel == "Online" &&
                   list[0].Category == "SHOPPING" &&
                   list[0].CategoryIconUrl == "https://example.com/icon.png" &&
                   list[0].IsoCurrencyCode == "USD"
        )), Times.Once);
        
        // Verify transactions were updated correctly
        _mockTransactionRepository.Verify(repo => repo.UpdateRangeAsync(It.Is<List<TransactionEntity>>(
            list => list.Count == 1 && 
                   list[0].PlaidTransactionId == "tx-modified-123" &&
                   list[0].Name == "Modified Transaction" &&
                   list[0].Amount == 75.00m &&
                   list[0].UserId == userId &&
                   list[0].AccountId == 1 &&
                   list[0].PaymentChannel == "InStore" &&
                   list[0].Category == "FOOD_AND_DRINK" &&
                   list[0].IsoCurrencyCode == "USD"
        )), Times.Once);
    }

    [Fact]
    public async Task ProcessRemovedTransactionsAsync_RemovesTransactionsCorrectly()
    {
        // Arrange
        const string userId = "user123";
        
        var removedTransactions = new List<RemovedTransaction>
        {
            new() { TransactionId = "tx-removed-1" },
            new() { TransactionId = "tx-removed-2" }
        };
        
        _mockTransactionRepository.Setup(repo => repo.RemoveByPlaidIdsAsync(
            It.Is<List<string>>(ids => ids.Count == 2 && 
                                      ids.Contains("tx-removed-1") && 
                                      ids.Contains("tx-removed-2"))))
            .ReturnsAsync(2);

        // Act
        // Call the private method using reflection
        var methodInfo = typeof(ItemService).GetMethod("ProcessRemovedTransactionsAsync", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        
        await (Task)methodInfo.Invoke(_service, new object[] { removedTransactions, userId });

        // Assert
        _mockTransactionRepository.Verify(repo => repo.RemoveByPlaidIdsAsync(
            It.Is<List<string>>(ids => ids.Count == 2 && 
                                      ids.Contains("tx-removed-1") && 
                                      ids.Contains("tx-removed-2"))), Times.Once);
    }
    
    [Fact]
    public void ShouldSkipItemUpdate_ReturnsTrueForRecentlyFetchedItems()
    {
        // Arrange
        var recentItem = new ItemEntity
        {
            UserId = "user-id-1",
            LastFetched = DateTime.Now.AddHours(-12), // Less than 1 day ago
            PlaidItemId = "plaid-item-123",
            InstitutionName = "Test Bank",
            InstitutionId = "inst-123",
            AccessToken = "access-token-123"
        };

        var oldItem = new ItemEntity
        {
            UserId = "user-id-2",
            LastFetched = DateTime.Now.AddDays(-2), // More than 1 day ago
            PlaidItemId = "plaid-item-456",
            InstitutionName = "Another Bank",
            InstitutionId = "inst-456",
            AccessToken = "access-token-456"
        };

        var nullItem = new ItemEntity
        {
            UserId = "user-id-3",
            LastFetched = null, // Never fetched
            PlaidItemId = "plaid-item-789",
            InstitutionName = "New Bank",
            InstitutionId = "inst-789",
            AccessToken = "access-token-789"
        };

        // Act
        // Call the private method using reflection
        var methodInfo = typeof(ItemService).GetMethod("ShouldSkipItemUpdate", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
        
        var skipRecent = (bool)methodInfo.Invoke(null, new object[] { recentItem });
        var skipOld = (bool)methodInfo.Invoke(null, new object[] { oldItem });
        var skipNull = (bool)methodInfo.Invoke(null, new object[] { nullItem });

        // Assert
        Assert.True(skipRecent);
        Assert.False(skipOld);
        Assert.False(skipNull);
    }
}
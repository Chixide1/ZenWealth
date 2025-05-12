// AccountServiceTests.cs

using Going.Plaid.Accounts;
using Going.Plaid.Entity;
using Microsoft.Extensions.Logging;
using Moq;
using ZenWealth.Core.Application.Services;
using ZenWealth.Core.Domain.Interfaces;
using ZenWealth.Core.Models;
// Required for Item and Account
// Required for AccountsGetResponse and Plaid Account
using PlaidAccount = Going.Plaid.Entity.Account; // Required for AccountSubtype
// Required for AccountBalance
using Account = ZenWealth.Core.Domain.Entities.Account;
using Item = ZenWealth.Core.Domain.Entities.Item;

// It's good practice to put test classes in a separate test project
// and use the same namespace structure as the code being tested, suffixed with .Tests
namespace ZenWealth.Tests.UnitTests;

public class AccountServiceTests
{
    // Mocks for all dependencies of AccountService
    private readonly Mock<ILogger<AccountService>> _mockLogger;
    private readonly Mock<IPlaidService> _mockPlaidService;
    private readonly Mock<IAccountRepository> _mockAccountRepository;
    private readonly Mock<IItemRepository> _mockItemRepository;
    private readonly AccountService _accountService;

    // Constructor to set up mocks and the service instance before each test
    public AccountServiceTests()
    {
        _mockLogger = new Mock<ILogger<AccountService>>();
        _mockPlaidService = new Mock<IPlaidService>();
        _mockAccountRepository = new Mock<IAccountRepository>();
        _mockItemRepository = new Mock<IItemRepository>();

        // Set up all repository methods to ensure they're properly mocked
        SetupAccountRepositoryMock();

        _accountService = new AccountService(
            _mockLogger.Object,
            _mockPlaidService.Object,
            _mockAccountRepository.Object,
            _mockItemRepository.Object
        );
    }

    // Helper method to set up all IAccountRepository mock methods
    private void SetupAccountRepositoryMock()
    {
        // Setup default implementations for all IAccountRepository methods
        _mockAccountRepository.Setup(repo => repo.GetAccountsByUserIdAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<AccountDto>());

        _mockAccountRepository.Setup(repo => repo.GetAccountsByItemIdAsync(It.IsAny<int>()))
            .ReturnsAsync(new Dictionary<string, Account>());

        _mockAccountRepository.Setup(repo => repo.GetAccountByPlaidAccountIdAsync(It.IsAny<string>()))
            .ReturnsAsync((Account)null);

        _mockAccountRepository.Setup(repo => repo.AddAsync(It.IsAny<Account>()))
            .Returns(Task.CompletedTask);

        _mockAccountRepository.Setup(repo => repo.UpdateAccountAsync(It.IsAny<Account>()))
            .Returns(Task.CompletedTask);

        _mockAccountRepository.Setup(repo => repo.SaveChangesAsync());

        _mockAccountRepository.Setup(repo => repo.AddRangeAsync(It.IsAny<List<Account>>()))
            .Returns(Task.CompletedTask);

        _mockAccountRepository.Setup(repo => repo.RemoveRangeAsync(It.IsAny<List<Account>>()))
            .Returns(Task.CompletedTask);

        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(It.IsAny<int>()))
            .ReturnsAsync(new HashSet<string>());

        _mockAccountRepository.Setup(repo => repo.GetAccountMappingAsync(It.IsAny<List<string?>>()))
            .ReturnsAsync(new Dictionary<string, int>());
    }

    // --- Helper to create a valid Item instance ---
    private Item CreateTestItem(int id, string plaidItemId, string accessToken, string userId, string institutionName = "Test Bank", string institutionId = "ins_123")
    {
        return new Item
        {
            Id = id,
            UserId = userId,
            PlaidItemId = plaidItemId,
            AccessToken = accessToken,
            InstitutionName = institutionName,
            InstitutionId = institutionId
            // User navigation property will be default (null!)
            // Accounts list will be default (empty)
        };
    }


    // --- Tests for GetAccountsAsync ---

    [Fact]
    public async Task GetAccountsAsync_ShouldReturnAccounts_WhenAccountsExist()
    {
        // Arrange
        var userId = "testUser123";
        var expectedAccounts = new List<AccountDto>
        {
            new AccountDto { Id = 1, Name = "Checking", Mask = "1111", OfficialName = "Official Checking", Subtype = "checking", Type = "depository", CurrentBalance = 1000, AvailableBalance = 900 },
            new AccountDto { Id = 2, Name = "Savings", Mask = "2222", OfficialName = "Official Savings", Subtype = "savings", Type = "depository", CurrentBalance = 5000, AvailableBalance = 5000 }
        };
        _mockAccountRepository.Setup(repo => repo.GetAccountsByUserIdAsync(userId))
            .ReturnsAsync(expectedAccounts);

        // Act
        var result = await _accountService.GetAccountsAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedAccounts.Count, result.Count);
        Assert.Equal(expectedAccounts, result); // Assumes AccountDto has proper equality comparison or is a record/struct
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Retrieved {expectedAccounts.Count} accounts for user {userId}")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GetAccountsAsync_ShouldReturnEmptyList_WhenNoAccountsExist()
    {
        // Arrange
        var userId = "nonExistentUser";
        _mockAccountRepository.Setup(repo => repo.GetAccountsByUserIdAsync(userId))
            .ReturnsAsync(new List<AccountDto>());

        // Act
        var result = await _accountService.GetAccountsAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Retrieved 0 accounts for user {userId}")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    // --- Tests for UpdateAccountsByPlaidItemIdAsync ---

    [Fact]
    public async Task UpdateAccountsByPlaidItemIdAsync_ShouldReturnZero_WhenItemNotFound()
    {
        // Arrange
        var plaidItemId = "nonExistentPlaidItemId";
        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(plaidItemId))
            .ReturnsAsync((Item)null); // Cast null to Item to satisfy type inference

        // Act
        var result = await _accountService.UpdateAccountsByPlaidItemIdAsync(plaidItemId);

        // Assert
        Assert.Equal(0, result);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Item with Plaid ID {plaidItemId} not found")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }
        
    [Fact]
    public async Task UpdateAccountsByPlaidItemIdAsync_ShouldRethrowException_WhenPlaidServiceFails()
    {
        // Arrange
        var plaidItemId = "plaidItemWithFailingPlaidService";
        var item = CreateTestItem(1, plaidItemId, "testAccessToken", "testUser");
        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(plaidItemId)).ReturnsAsync(item);
        _mockPlaidService.Setup(service => service.GetAccountsAsync(item.AccessToken))
            .ThrowsAsync(new Exception("Plaid API error"));

        // Act & Assert
        var ex = await Assert.ThrowsAsync<Exception>(() => _accountService.UpdateAccountsByPlaidItemIdAsync(plaidItemId));
        Assert.Equal("Plaid API error", ex.Message);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Error updating accounts for item {item.Id}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateAccountsByPlaidItemIdAsync_ShouldProcessAccounts_WhenItemExists()
    {
        // Arrange
        var plaidItemId = "existingPlaidItemId";
        var userId = "testUser";
        var itemId = 1;
        var item = CreateTestItem(itemId, plaidItemId, "validAccessToken", userId);

        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(plaidItemId)).ReturnsAsync(item);

        // Set up for GetAccountsByItemIdAsync (empty existing accounts)
        _mockAccountRepository.Setup(repo => repo.GetAccountsByItemIdAsync(item.Id))
            .ReturnsAsync(new Dictionary<string, Account>());
            
        // Set up GetExistingAccountIdsAsync (for account removal logic if needed)
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(item.Id))
            .ReturnsAsync(new HashSet<string>());

        var plaidAccount1 = new PlaidAccount
        {
            AccountId = "plaidAccId1",
            Name = "New Checking",
            Type = AccountType.Depository,
            Subtype = AccountSubtype.Checking,
            Mask = "1234",
            OfficialName = "Official New Checking",
            Balances = new AccountBalance { Current = 100m, Available = 80m }
        };
        var plaidAccountsResponse = new AccountsGetResponse
        {
            Accounts = [ plaidAccount1 ] // Using collection expression
        };
        _mockPlaidService.Setup(service => service.GetAccountsAsync(item.AccessToken))
            .ReturnsAsync(plaidAccountsResponse);
            
        _mockAccountRepository.Setup(repo => repo.AddAsync(It.IsAny<Account>()))
            .Returns(Task.CompletedTask);
        _mockAccountRepository.Setup(repo => repo.SaveChangesAsync());

        // Act
        var result = await _accountService.UpdateAccountsByPlaidItemIdAsync(plaidItemId);

        // Assert
        Assert.Equal(1, result); // One new account added
        _mockAccountRepository.Verify(repo => repo.AddAsync(It.Is<Account>(acc => acc.PlaidAccountId == "plaidAccId1")), Times.Once);
        _mockAccountRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Successfully processed accounts for item {item.Id}")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }


    // --- Tests for UpdateAccountsAsync (covers multiple items) ---

    [Fact]
    public async Task UpdateAccountsAsync_ShouldProcessMultipleItems()
    {
        // Arrange
        var userId = "testUserWithMultipleItems";
        var item1 = CreateTestItem(1, "plaidItem1", "token1", userId, "Bank1", "ins_1");
        var item2 = CreateTestItem(2, "plaidItem2", "token2", userId, "Bank2", "ins_2");
        var items = new List<Item> { item1, item2 };

        _mockItemRepository.Setup(repo => repo.GetItemsForUpdateAsync(userId)).ReturnsAsync(items);

        // Mock GetExistingAccountIdsAsync for both items
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(item1.Id))
            .ReturnsAsync(new HashSet<string>());
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(item2.Id))
            .ReturnsAsync(new HashSet<string> { "acc2_1" });

        // Mocking for item1 processing (1 new account)
        _mockAccountRepository.Setup(repo => repo.GetAccountsByItemIdAsync(item1.Id)).ReturnsAsync(new Dictionary<string, Account>());
        _mockPlaidService.Setup(ps => ps.GetAccountsAsync(item1.AccessToken)).ReturnsAsync(new AccountsGetResponse
        {
            Accounts = [ new PlaidAccount { AccountId = "acc1_1", Name = "Item1 Acc1", Type = AccountType.Depository, Balances = new AccountBalance { Current = 100m }, Mask="1111", Subtype = AccountSubtype.Checking } ]
        });

        // Mocking for item2 processing (1 updated account)
        var existingAccountItem2 = new Account
        {
            Id = 10, ItemId = item2.Id, UserId = userId, PlaidAccountId = "acc2_1", Name = "Item2 Acc1 Old", Type = "depository", CurrentBalance = 200m, AvailableBalance = 200m, Mask="2222", Subtype="savings", OfficialName="Official Old"
        };
        _mockAccountRepository.Setup(repo => repo.GetAccountsByItemIdAsync(item2.Id))
            .ReturnsAsync(new Dictionary<string, Account> { { "acc2_1", existingAccountItem2 } });
        _mockPlaidService.Setup(ps => ps.GetAccountsAsync(item2.AccessToken)).ReturnsAsync(new AccountsGetResponse
        {
            Accounts = [ new PlaidAccount { AccountId = "acc2_1", Name = "Item2 Acc1 New", Type = AccountType.Depository, Balances = new AccountBalance { Current = 250m, Available = 240m }, Mask="2222", Subtype = AccountSubtype.Savings, OfficialName="Official New" } ]
        });

        // Act
        await _accountService.UpdateAccountsAsync(userId);

        // Assert
        _mockAccountRepository.Verify(repo => repo.AddAsync(It.Is<Account>(a => a.PlaidAccountId == "acc1_1")), Times.Once); 
        Assert.Equal(250m, existingAccountItem2.CurrentBalance);
        Assert.Equal(240m, existingAccountItem2.AvailableBalance);

        _mockAccountRepository.Verify(repo => repo.SaveChangesAsync(), Times.Exactly(2)); 
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Completed account update for user {userId}, processed 2 accounts")), 
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateAccountsAsync_ShouldLogAndContinue_WhenOneItemFails()
    {
        // Arrange
        var userId = "userWithOneFailingItem";
        var item1 = CreateTestItem(1, "plaidItem1", "token1", userId, "Bank1", "ins_1"); // Will succeed
        var item2 = CreateTestItem(2, "plaidItem2", "token2", userId, "Bank2", "ins_2"); // Will fail

        _mockItemRepository.Setup(repo => repo.GetItemsForUpdateAsync(userId)).ReturnsAsync(new List<Item> { item1, item2 });

        // Mock GetExistingAccountIdsAsync for both items
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(item1.Id))
            .ReturnsAsync(new HashSet<string>());
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(item2.Id))
            .ReturnsAsync(new HashSet<string>());

        // Setup for item1 (success)
        _mockAccountRepository.Setup(repo => repo.GetAccountsByItemIdAsync(item1.Id)).ReturnsAsync(new Dictionary<string, Account>());
        _mockPlaidService.Setup(ps => ps.GetAccountsAsync(item1.AccessToken)).ReturnsAsync(new AccountsGetResponse
        {
            Accounts = [ new PlaidAccount { AccountId = "acc1", Name = "Acc1", Type = AccountType.Depository, Balances = new AccountBalance { Current = 50m }, Mask="0000", Subtype = AccountSubtype.Cd } ]
        });

        // Setup for item2 (failure)
        _mockAccountRepository.Setup(repo => repo.GetAccountsByItemIdAsync(item2.Id)).ReturnsAsync(new Dictionary<string, Account>());
        _mockPlaidService.Setup(ps => ps.GetAccountsAsync(item2.AccessToken)).ThrowsAsync(new Exception("Plaid API Error for item2"));

        // Act
        await _accountService.UpdateAccountsAsync(userId);

        // Assert
        _mockAccountRepository.Verify(repo => repo.AddAsync(It.Is<Account>(a => a.PlaidAccountId == "acc1")), Times.Once); 
        _mockAccountRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once); // Only for item1

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Error processing accounts for item {item2.Id}")),
                It.IsAny<Exception>(), 
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once); 

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Completed account update for user {userId}, processed 1 accounts")), 
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    // --- Tests for ProcessAccountsForItemAsync (tested indirectly, but can add specific scenarios) ---

    [Fact]
    public async Task ProcessAccountsForItemAsync_ShouldUpdateExistingAccount_WhenBalanceChanges()
    {
        // Arrange
        var userId = "testUser";
        var itemId = 1;
        var item = CreateTestItem(itemId, "plaidItemForUpdate", "tokenForUpdate", userId);
        var plaidAccountId = "existingPlaidAccId";

        var existingAccount = new Account
        {
            Id = 1, ItemId = itemId, UserId = userId, PlaidAccountId = plaidAccountId, Name = "Checking",
            Type = "depository", CurrentBalance = 100m, AvailableBalance = 80m, Mask = "1111", OfficialName = "Official Checking", Subtype = "checking"
        };
        var existingAccountsDb = new Dictionary<string, Account> { { plaidAccountId, existingAccount } };
        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(item.PlaidItemId)).ReturnsAsync(item); // For UpdateAccountsByPlaidItemIdAsync call
        _mockAccountRepository.Setup(repo => repo.GetAccountsByItemIdAsync(item.Id)).ReturnsAsync(existingAccountsDb);
            
        // Mock GetExistingAccountIdsAsync
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(item.Id))
            .ReturnsAsync(new HashSet<string> { plaidAccountId });

        var plaidAccountUpdate = new PlaidAccount
        {
            AccountId = plaidAccountId, Name = "Checking", Type = AccountType.Depository, Subtype = AccountSubtype.Checking,
            Balances = new AccountBalance { Current = 150m, Available = 120m }, Mask = "1111", OfficialName = "Official Checking"
        };
        var plaidResponse = new AccountsGetResponse { Accounts = [ plaidAccountUpdate ] };
        _mockPlaidService.Setup(ps => ps.GetAccountsAsync(item.AccessToken)).ReturnsAsync(plaidResponse);

        // Act: Call a public method that uses ProcessAccountsForItemAsync
        var processedCount = await _accountService.UpdateAccountsByPlaidItemIdAsync(item.PlaidItemId); 

        // Assert
        Assert.Equal(1, processedCount); // 1 account updated
        Assert.Equal(150m, existingAccount.CurrentBalance);
        Assert.Equal(120m, existingAccount.AvailableBalance);
        _mockAccountRepository.Verify(repo => repo.AddAsync(It.IsAny<Account>()), Times.Never); 
        _mockAccountRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task ProcessAccountsForItemAsync_ShouldNotUpdate_WhenBalanceIsSameAndAvailableIsNullInPlaid()
    {
        // Arrange
        var userId = "testUser";
        var itemId = 1;
        var item = CreateTestItem(itemId, "plaidItemNoUpdate", "tokenNoUpdate", userId);
        var plaidAccountId = "existingPlaidAccIdNoUpdate";

        var existingAccount = new Account
        {
            Id = 1, ItemId = itemId, UserId = userId, PlaidAccountId = plaidAccountId, Name = "Checking",
            Type = "depository", CurrentBalance = 100m, AvailableBalance = 80m, Mask = "1111", OfficialName = "Official Checking", Subtype = "checking"
        };
        var existingAccountsDb = new Dictionary<string, Account> { { plaidAccountId, existingAccount } };
        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(item.PlaidItemId)).ReturnsAsync(item); 
        _mockAccountRepository.Setup(repo => repo.GetAccountsByItemIdAsync(item.Id)).ReturnsAsync(existingAccountsDb);
            
        // Mock GetExistingAccountIdsAsync
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(item.Id))
            .ReturnsAsync(new HashSet<string> { plaidAccountId });

        var plaidAccountNoUpdate = new PlaidAccount
        {
            AccountId = plaidAccountId, Name = "Checking", Type = AccountType.Depository, Subtype = AccountSubtype.Checking,
            Balances = new AccountBalance { Current = 100m, Available = null }, Mask = "1111", OfficialName = "Official Checking"
        };
        var plaidResponse = new AccountsGetResponse { Accounts = [ plaidAccountNoUpdate ] };
        _mockPlaidService.Setup(ps => ps.GetAccountsAsync(item.AccessToken)).ReturnsAsync(plaidResponse);
            


        // Act
        var processedCount = await _accountService.UpdateAccountsByPlaidItemIdAsync(item.PlaidItemId);

        // Assert
        Assert.Equal(0, processedCount); 
        Assert.Equal(100m, existingAccount.CurrentBalance); 
        Assert.Equal(80m, existingAccount.AvailableBalance);  
        _mockAccountRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once); 
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Updated account {plaidAccountId}")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Never); 
    }
        
    [Fact]
    public async Task ProcessAccountsForItemAsync_ShouldLogWarning_WhenPlaidBalanceCurrentIsNull()
    {
        // Arrange
        var userId = "testUser";
        var itemId = 1;
        var item = CreateTestItem(itemId, "plaidItemNullBalance", "tokenNullBalance", userId);
        var plaidAccountId = "existingPlaidAccIdNullBalance";

        var existingAccount = new Account
        {
            Id = 1, ItemId = itemId, UserId = userId, PlaidAccountId = plaidAccountId, Name = "Checking",
            Type = "depository", CurrentBalance = 100m, AvailableBalance = 80m, Mask = "1111", OfficialName = "Official Checking", Subtype = "checking"
        };
        var existingAccountsDb = new Dictionary<string, Account> { { plaidAccountId, existingAccount } };
        _mockItemRepository.Setup(repo => repo.GetByPlaidIdAsync(item.PlaidItemId)).ReturnsAsync(item);
        _mockAccountRepository.Setup(repo => repo.GetAccountsByItemIdAsync(item.Id)).ReturnsAsync(existingAccountsDb);
            
        // Mock GetExistingAccountIdsAsync
        _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(item.Id))
            .ReturnsAsync(new HashSet<string> { plaidAccountId });

        var plaidAccountNullBalance = new PlaidAccount
        {
            AccountId = plaidAccountId, Name = "Checking", Type = AccountType.Depository, Subtype = AccountSubtype.Checking,
            Balances = new AccountBalance { Current = null, Available = 70m }, Mask = "1111", OfficialName = "Official Checking"
        };
        var plaidResponse = new AccountsGetResponse { Accounts = [ plaidAccountNullBalance ] };
        _mockPlaidService.Setup(ps => ps.GetAccountsAsync(item.AccessToken)).ReturnsAsync(plaidResponse);
            
        // Act
        var processedCount = await _accountService.UpdateAccountsByPlaidItemIdAsync(item.PlaidItemId);

        // Assert
        Assert.Equal(0, processedCount); 
        Assert.Equal(100m, existingAccount.CurrentBalance); 
        Assert.Equal(80m, existingAccount.AvailableBalance);  
        _mockAccountRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"Unable to update account {plaidAccountId}") && v.ToString().Contains("missing balance data")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }
}
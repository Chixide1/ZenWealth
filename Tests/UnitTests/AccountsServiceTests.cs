using Core.Application.Services;
using Core.Domain.Entities;
using Core.Domain.Interfaces;
using Core.Models;
using Going.Plaid;
using Going.Plaid.Accounts;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Tests.UnitTests;

//public class AccountsServiceTests
//{
//    private readonly Mock<ILogger<AccountsService>> _loggerMock;
//    private readonly Mock<PlaidClient> _plaidClientMock;
//    private readonly Mock<IAccountRepository> _accountRepositoryMock;
//    private readonly Mock<IItemRepository> _itemRepositoryMock;
//    private readonly AccountsService _accountsService;

//    public AccountsServiceTests()
//    {
//        _loggerMock = new Mock<ILogger<AccountsService>>();
//        _plaidClientMock = new Mock<PlaidClient>();
//        _accountRepositoryMock = new Mock<IAccountRepository>();
//        _itemRepositoryMock = new Mock<IItemRepository>();

//        _accountsService = new AccountsService(
//            _loggerMock.Object,
//            _plaidClientMock.Object,
//            _accountRepositoryMock.Object,
//            _itemRepositoryMock.Object
//        );
//    }

//    [Fact]
//    public async Task GetAccountsAsync_ReturnsAccounts()
//    {
//        // Arrange
//        var userId = "test-user";
//        var accounts = new List<AccountDto>
//        {
//            new AccountDto { Id = "1", Name = "Account1" },
//            new AccountDto { Id = "2", Name = "Account2" }
//        };

//        _accountRepositoryMock
//            .Setup(repo => repo.GetAccountsByUserIdAsync(userId))
//            .ReturnsAsync(accounts);

//        // Act
//        var result = await _accountsService.GetAccountsAsync(userId);

//        // Assert
//        Assert.Equal(accounts, result);
//        _loggerMock.Verify(
//            log => log.LogInformation(It.IsAny<string>(), accounts.Count, userId),
//            Times.Once
//        );
//    }

//    [Fact]
//    public async Task UpdateAccountsByPlaidItemIdAsync_ItemNotFound_ReturnsZero()
//    {
//        // Arrange
//        var plaidItemId = "test-item";
//        _itemRepositoryMock
//            .Setup(repo => repo.GetByPlaidIdAsync(plaidItemId))
//            .ReturnsAsync((Item)null);

//        // Act
//        var result = await _accountsService.UpdateAccountsByPlaidItemIdAsync(plaidItemId);

//        // Assert
//        Assert.Equal(0, result);
//        _loggerMock.Verify(
//            log => log.LogWarning(It.IsAny<string>(), plaidItemId),
//            Times.Once
//        );
//    }

//    [Fact]
//    public async Task UpdateAccountsAsync_ProcessesAllItems()
//    {
//        // Arrange
//        var userId = "test-user";
//        var items = new List<Item>
//        {
//            new Item { Id = "item1", AccessToken = "token1", UserId = userId },
//            new Item { Id = "item2", AccessToken = "token2", UserId = userId }
//        };

//        _itemRepositoryMock
//            .Setup(repo => repo.GetItemsForUpdateAsync(userId))
//            .ReturnsAsync(items);

//        _accountRepositoryMock
//            .Setup(repo => repo.GetAccountsByItemIdAsync(It.IsAny<string>()))
//            .ReturnsAsync(new Dictionary<string, Account>());

//        _plaidClientMock
//            .Setup(client => client.AccountsGetAsync(It.IsAny<AccountsGetRequest>()))
//            .ReturnsAsync(new AccountsGetResponse
//            {
//                Accounts = new List<AccountBase>
//                {
//                    new AccountBase { AccountId = "acc1", Name = "Account1", Balances = new Balances { Current = 100 } }
//                }
//            });

//        // Act
//        await _accountsService.UpdateAccountsAsync(userId);

//        // Assert
//        _loggerMock.Verify(
//            log => log.LogInformation(It.IsAny<string>(), userId, It.IsAny<int>()),
//            Times.Once
//        );
//    }
//}

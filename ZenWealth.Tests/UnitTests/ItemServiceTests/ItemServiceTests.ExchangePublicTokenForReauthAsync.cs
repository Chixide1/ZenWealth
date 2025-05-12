// using Going.Plaid.Entity;
// using Going.Plaid.Item;
// using Going.Plaid.Transactions;
// using Moq;
// using ZenWealth.Core.Dtos;
// using ZenWealth.Core.Models;
// using Account = ZenWealth.Core.Domain.Entities.Account;
// using Item = ZenWealth.Core.Domain.Entities.Item;
// using Transaction = Going.Plaid.Entity.Transaction;
//
// namespace ZenWealth.Tests.UnitTests.ItemServiceTests;
//
// public partial class ItemServiceTests
// {
//     [Fact]
//     public async Task ExchangePublicTokenForReauthAsync_WhenItemExists_UpdatesItemAndReturnsSuccessResponse()
//     {
//         // Arrange
//         const int itemId = 1;
//         const string userId = "user123";
//         const string publicToken = "public-token-123";
//         const string accessToken = "access-token-123";
//
//         var accounts = new List<AccountDto>
//         {
//             new() { Name = "Checking", Mask = "1234" }
//         };
//
//         var request = new UpdateItemReauthRequest(publicToken, accounts);
//
//         var item = new Item
//         {
//             Id = itemId,
//             UserId = userId,
//             AccessToken = "old-access-token",
//             Accounts = new List<Account>
//             {
//                 new() { Id = 1, Name = "Checking", Mask = "1234" },
//                 new() { Id = 2, Name = "Savings", Mask = "5678" } // Will be removed
//             }
//         };
//
//         _mockItemRepository.Setup(repo => repo.GetWithAccountsByIdAndUserIdAsync(itemId, userId))
//             .ReturnsAsync(item);
//
//         _mockPlaidService.Setup(service => service.ExchangePublicTokenAsync(publicToken))
//             .ReturnsAsync(new ItemPublicTokenExchangeResponse
//             {
//                 Error = null,
//                 AccessToken = accessToken,
//                 ItemId = "plaid-item-123"
//             });
//
//         // Mock for UpdateSingleItemAsync
//         _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(itemId, userId))
//             .ReturnsAsync(item);
//
//         _mockPlaidService.Setup(service => service.SyncTransactionsAsync(accessToken, It.IsAny<string>()))
//             .ReturnsAsync(new TransactionsSyncResponse
//             {
//                 Added = new List<Transaction>(),
//                 Modified = new List<Transaction>(),
//                 Removed = new List<RemovedTransaction>(),
//                 Accounts = new List<Going.Plaid.Entity.Account>(),
//                 HasMore = false,
//                 NextCursor = null
//             });
//
//         // Act
//         var result = await _service.ExchangePublicTokenForReauthAsync(itemId, userId, request);
//
//         // Assert
//         Assert.True(result.Success);
//         Assert.Equal(0, result.AddedTransactions);
//         Assert.Null(result.Error);
//
//         // Verify accounts were removed
//         _mockAccountRepository.Verify(
//             repo => repo.RemoveRangeAsync(It.Is<List<Account>>(accounts => accounts.Count == 1 && accounts[0].Id == 2)),
//             Times.Once);
//
//         // Verify item was updated
//         _mockItemRepository.Verify(repo => repo.UpdateAsync(It.Is<Item>(i =>
//             i.AccessToken == accessToken && i.Cursor == null && i.LastFetched == null)), Times.Once);
//
//         // Verify transactions were synced
//         _mockPlaidService.Verify(service =>
//             service.SyncTransactionsAsync(accessToken, It.IsAny<string>()), Times.Once);
//     }
//
//     [Fact]
//     public async Task ExchangePublicTokenForReauthAsync_WhenItemDoesNotExist_ReturnsFailureResponse()
//     {
//         // Arrange
//         const int itemId = 999;
//         const string userId = "user123";
//         const string publicToken = "public-token-123";
//
//         var accounts = new List<AccountDto>
//         {
//             new() { Name = "Checking", Mask = "1234" }
//         };
//
//         var request = new UpdateItemReauthRequest(publicToken, accounts);
//
//         _mockItemRepository.Setup(repo => repo.GetWithAccountsByIdAndUserIdAsync(itemId, userId))
//             .ReturnsAsync((Item)null);
//
//         // Act
//         var result = await _service.ExchangePublicTokenForReauthAsync(itemId, userId, request);
//
//         // Assert
//         Assert.False(result.Success);
//         Assert.Equal(0, result.AddedTransactions);
//         Assert.NotNull(result.Error);
//         Assert.Equal("ITEM_NOT_FOUND", result.Error.ErrorCode);
//
//         // Verify no further actions were taken
//         _mockPlaidService.Verify(service => service.ExchangePublicTokenAsync(It.IsAny<string>()), Times.Never);
//         _mockAccountRepository.Verify(repo => repo.RemoveRangeAsync(It.IsAny<List<Account>>()), Times.Never);
//         _mockItemRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Item>()), Times.Never);
//     }
//
//     [Fact]
//     public async Task ExchangePublicTokenForReauthAsync_WhenTokenExchangeFails_ReturnsFailureResponse()
//     {
//         // Arrange
//         const int itemId = 1;
//         const string userId = "user123";
//         const string publicToken = "invalid-token";
//
//         var accounts = new List<AccountDto>
//         {
//             new() { Name = "Checking", Mask = "1234" }
//         };
//
//         var request = new UpdateItemReauthRequest(publicToken, accounts);
//
//         var item = new Item
//         {
//             Id = itemId,
//             UserId = userId,
//             AccessToken = "old-access-token",
//             Accounts = new List<Account>
//             {
//                 new() { Id = 1, Name = "Checking", Mask = "1234" }
//             }
//         };
//
//         var plaidError = new PlaidError
//         {
//             ErrorType = "INVALID_REQUEST",
//             ErrorCode = "INVALID_PUBLIC_TOKEN",
//             ErrorMessage = "The public token is invalid"
//         };
//
//         _mockItemRepository.Setup(repo => repo.GetWithAccountsByIdAndUserIdAsync(itemId, userId))
//             .ReturnsAsync(item);
//
//         _mockPlaidService.Setup(service => service.ExchangePublicTokenAsync(publicToken))
//             .ReturnsAsync(new ItemPublicTokenExchangeResponse { Error = plaidError });
//
//         // Act
//         var result = await _service.ExchangePublicTokenForReauthAsync(itemId, userId, request);
//
//         // Assert
//         Assert.False(result.Success);
//         Assert.Equal(0, result.AddedTransactions);
//         Assert.Equal(plaidError, result.Error);
//
//         // Verify no further actions were taken
//         _mockAccountRepository.Verify(repo => repo.RemoveRangeAsync(It.IsAny<List<Account>>()), Times.Never);
//         _mockItemRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Item>()), Times.Never);
//     }
// }
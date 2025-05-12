// using Going.Plaid.Entity;
// using Going.Plaid.Item;
// using Going.Plaid.Transactions;
// using Moq;
// using ZenWealth.Core.Models;
// using Item = ZenWealth.Core.Domain.Entities.Item;
//
// namespace ZenWealth.Tests.UnitTests.ItemServiceTests;
//
// public partial class ItemServiceTests
// {
//      [Fact]
//     public async Task ExchangePublicTokenAsync_WhenInstitutionAlreadyLinked_ReturnsFailureResponse()
//     {
//         // Arrange
//         const string userId = "user123";
//         const string publicToken = "public-token-123";
//         const string institutionName = "Bank A";
//         const string institutionId = "inst-123";
//
//         var existingInstitutions = new List<InstitutionDto>
//         {
//             new() { Id = 1, Name = institutionName, ItemCount = 1 }
//         };
//
//         _mockItemRepository.Setup(repo => repo.GetInstitutionsForUserAsync(userId))
//             .ReturnsAsync(existingInstitutions);
//
//         // Act
//         var result = await _service.ExchangePublicTokenAsync(publicToken, institutionName, institutionId, userId);
//
//         // Assert
//         Assert.False(result.Success);
//         Assert.Equal(0, result.AddedTransactions);
//         Assert.NotNull(result.Error);
//         Assert.Equal("INSTITUTION_ALREADY_LINKED", result.Error.ErrorCode);
//         _mockItemRepository.Verify(repo => repo.GetInstitutionsForUserAsync(userId), Times.Once);
//         _mockPlaidService.Verify(service => service.ExchangePublicTokenAsync(It.IsAny<string>()), Times.Never);
//     }
//
//     [Fact]
//     public async Task ExchangePublicTokenAsync_WhenExchangeFails_ReturnsFailureResponse()
//     {
//         // Arrange
//         const string userId = "user123";
//         const string publicToken = "public-token-123";
//         const string institutionName = "New Bank";
//         const string institutionId = "inst-123";
//
//         var existingInstitutions = new List<InstitutionDto>
//         {
//             new() { Id = 1, Name = "Different Bank", ItemCount = 1 }
//         };
//
//         var plaidError = new PlaidError { ErrorMessage = "Exchange failed" };
//
//         _mockItemRepository.Setup(repo => repo.GetInstitutionsForUserAsync(userId))
//             .ReturnsAsync(existingInstitutions);
//
//         _mockPlaidService.Setup(service => service.ExchangePublicTokenAsync(publicToken))
//             .ReturnsAsync(new ItemPublicTokenExchangeResponse { Error = plaidError });
//
//         // Act
//         var result = await _service.ExchangePublicTokenAsync(publicToken, institutionName, institutionId, userId);
//
//         // Assert
//         Assert.False(result.Success);
//         Assert.Equal(0, result.AddedTransactions);
//         Assert.Equal(plaidError, result.Error);
//         _mockItemRepository.Verify(repo => repo.GetInstitutionsForUserAsync(userId), Times.Once);
//         _mockPlaidService.Verify(service => service.ExchangePublicTokenAsync(publicToken), Times.Once);
//         _mockItemRepository.Verify(repo => repo.CreateAsync(It.IsAny<Item>()), Times.Never);
//     }
//
//     [Fact]
//     public async Task ExchangePublicTokenAsync_WhenSuccessful_CreatesItemAndUpdates()
//     {
//         // Arrange
//         const string userId = "user123";
//         const string publicToken = "public-token-123";
//         const string institutionName = "New Bank";
//         const string institutionId = "inst-123";
//         const string accessToken = "access-token-123";
//         const string plaidItemId = "plaid-item-123";
//
//         var existingInstitutions = new List<InstitutionDto>
//         {
//             new() { Id = 1, Name = "Different Bank", ItemCount = 1 }
//         };
//
//         _mockItemRepository.Setup(repo => repo.GetInstitutionsForUserAsync(userId))
//             .ReturnsAsync(existingInstitutions);
//
//         _mockPlaidService.Setup(service => service.ExchangePublicTokenAsync(publicToken))
//             .ReturnsAsync(new ItemPublicTokenExchangeResponse
//             {
//                 Error = null,
//                 AccessToken = accessToken,
//                 ItemId = plaidItemId
//             });
//
//         // Mock for item creation to return the created item
//         Item createdItem = null;
//         _mockItemRepository.Setup(repo => repo.CreateAsync(It.IsAny<Item>()))
//             .Callback<Item>(item => 
//             { 
//                 createdItem = item;
//                 item.Id = 1; // Simulate ID assignment
//             })
//             .ReturnsAsync((Item item) => item);
//
//         // Setup for UpdateItemsAsync call
//         var items = new List<Item>
//         {
//             new()
//             {
//                 Id = 1,
//                 UserId = userId,
//                 AccessToken = accessToken,
//                 PlaidItemId = plaidItemId,
//                 InstitutionName = institutionName,
//                 InstitutionId = institutionId
//             }
//         };
//
//         _mockItemRepository.Setup(repo => repo.GetItemsForUpdateAsync(userId))
//             .ReturnsAsync(items);
//             
//         // Setup for UpdateSingleItemAsync which will be called through UpdateItemsAsync
//         _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(1, userId))
//             .ReturnsAsync(items[0]);
//             
//         // Mock SyncTransactionsAsync to simulate a successful transaction sync
//         _mockPlaidService.Setup(service => service.SyncTransactionsAsync(accessToken, It.IsAny<string>()))
//             .ReturnsAsync(new TransactionsSyncResponse
//             {
//                 Added = new List<Transaction>(),
//                 Modified = new List<Transaction>(),
//                 Removed = new List<RemovedTransaction>(),
//                 HasMore = false,
//                 NextCursor = "next-cursor",
//                 Accounts = new List<Going.Plaid.Entity.Account>()
//             });
//             
//         // Setup account repository mocks needed for transaction processing
//         _mockAccountRepository.Setup(repo => repo.GetExistingAccountIdsAsync(It.IsAny<int>()))
//             .ReturnsAsync(new HashSet<string>());
//             
//         _mockTransactionRepository.Setup(repo => repo.GetExistingTransactionIdsAsync(It.IsAny<List<string>>()))
//             .ReturnsAsync(new HashSet<string>());
//
//         // Act
//         var result = await _service.ExchangePublicTokenAsync(publicToken, institutionName, institutionId, userId);
//
//         // Assert
//         Assert.True(result.Success);
//         Assert.Equal(0, result.AddedTransactions); // No transactions were added in our mock
//         Assert.Null(result.Error);
//         
//         // Verify item was created
//         _mockItemRepository.Verify(repo => repo.CreateAsync(It.Is<Item>(item =>
//             item.UserId == userId &&
//             item.InstitutionName == institutionName &&
//             item.InstitutionId == institutionId &&
//             item.AccessToken == accessToken &&
//             item.PlaidItemId == plaidItemId)), Times.Once);
//             
//         // Verify UpdateItemsAsync was called
//         _mockItemRepository.Verify(repo => repo.GetItemsForUpdateAsync(userId), Times.Once);
//             
//         // Verify SyncTransactionsAsync was called
//         _mockPlaidService.Verify(service => service.SyncTransactionsAsync(accessToken, It.IsAny<string>()), Times.AtLeastOnce);
//     }
// }
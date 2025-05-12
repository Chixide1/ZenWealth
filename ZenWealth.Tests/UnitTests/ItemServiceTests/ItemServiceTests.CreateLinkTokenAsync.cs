// using Going.Plaid.Entity;
// using Moq;
// using ZenWealth.Core.Dtos;
// using Item = ZenWealth.Core.Domain.Entities.Item;
//
// namespace ZenWealth.Tests.UnitTests.ItemServiceTests;
//
// public partial class ItemServiceTests
// {
//       [Fact]
//     public async Task CreateLinkTokenAsync_WhenSuccessful_ReturnsSuccessResponse()
//     {
//         // Arrange
//         const string userId = "user123";
//         const string webhookUrl = "https://example.com/webhook";
//         const string linkToken = "link-token-123";
//
//         _mockPlaidService.Setup(service => service.CreateLinkTokenAsync(userId, webhookUrl))
//             .ReturnsAsync(new LinkTokenResponse
//             {
//                 IsSuccess = true,
//                 LinkToken = linkToken,
//                 ErrorMessage = null,
//                 PlaidError = null
//             });
//
//         // Act
//         var result = await _service.CreateLinkTokenAsync(userId);
//
//         // Assert
//         Assert.True(result.Success);
//         Assert.Equal(linkToken, result.LinkToken);
//         Assert.Null(result.Error);
//         _mockPlaidService.Verify(service => service.CreateLinkTokenAsync(userId, webhookUrl), Times.Once);
//     }
//
//     [Fact]
//     public async Task CreateLinkTokenAsync_WhenFails_ReturnsFailureResponse()
//     {
//         // Arrange
//         const string userId = "user123";
//         const string webhookUrl = "https://example.com/webhook";
//         var plaidError = new PlaidError { ErrorMessage = "Failed to create token" };
//
//         _mockPlaidService.Setup(service => service.CreateLinkTokenAsync(userId, webhookUrl))
//             .ReturnsAsync(new LinkTokenResponse
//             {
//                 IsSuccess = false,
//                 LinkToken = null,
//                 ErrorMessage = "Failed to create token",
//                 PlaidError = plaidError
//             });
//
//         // Act
//         var result = await _service.CreateLinkTokenAsync(userId);
//
//         // Assert
//         Assert.False(result.Success);
//         Assert.Null(result.LinkToken);
//         Assert.Contains("Unable to create link token", result.ErrorMessage);
//         Assert.Equal(plaidError, result.Error);
//         _mockPlaidService.Verify(service => service.CreateLinkTokenAsync(userId, webhookUrl), Times.Once);
//     }
//
//     [Fact]
//     public async Task CreateUpdateLinkTokenAsync_WhenItemExists_ReturnsSuccessResponse()
//     {
//         // Arrange
//         const string userId = "user123";
//         const int itemId = 1;
//         const string accessToken = "access-token-123";
//         const string webhookUrl = "https://example.com/webhook";
//         const string linkToken = "update-link-token-123";
//
//         var item = new Item
//         {
//             Id = itemId,
//             UserId = userId,
//             AccessToken = accessToken,
//             PlaidItemId = "plaid-item-123",
//             InstitutionName = "Test Bank",
//             InstitutionId = "inst-123"
//         };
//
//         _mockItemRepository.Setup(repo => repo.GetByIdAndUserIdAsync(itemId, userId))
//             .ReturnsAsync(item);
//
//         _mockPlaidService.Setup(service => service.CreateUpdateLinkTokenAsync(userId, accessToken, webhookUrl))
//             .ReturnsAsync(new LinkTokenResponse
//             {
//                 IsSuccess = true,
//                 LinkToken = linkToken,
//                 ErrorMessage = null,
//                 PlaidError = null
//             });
//
//         // Act
//         var result = await _service.CreateUpdateLinkTokenAsync(userId, itemId);
//
//         // Assert
//         Assert.True(result.Success);
//         Assert.Equal(linkToken, result.LinkToken);
//         Assert.Null(result.Error);
//         _mockItemRepository.Verify(repo => repo.GetByIdAndUserIdAsync(itemId, userId), Times.Once);
//         _mockPlaidService.Verify(service => service.CreateUpdateLinkTokenAsync(userId, accessToken, webhookUrl), Times.Once);
//     }
// }
using Going.Plaid.Entity;
using Microsoft.AspNetCore.Mvc;

namespace Server.Extensions;

public static class ControllerExtensions
{
    [ApiExplorerSettings(IgnoreApi = true)]
    public static IActionResult PlaidApiError(
        this ControllerBase controllerBase,
        PlaidError error,
        ILogger logger
    )
    {
        logger.LogError(
            "Error Type - {ErrorType}\n" +
            "Error Code - {ErrorCode}\n" +
            "Error Message - {ErrorMessage}",
            error.ErrorType,
            error.ErrorCode,
            error.ErrorMessage);

        return controllerBase.StatusCode(StatusCodes.Status400BadRequest, error);
    }
}
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ZenWealth.Api.Common;

public static class ControllerBaseExtensions
{
    public static IActionResult ForbidForDemoAccount(this ControllerBase controller,
        string message = "You don't have permission to perform this action as this is a demo account.")
    {
        return controller.StatusCode(StatusCodes.Status403Forbidden, new 
        {
            errors = new List<IdentityError> 
            { 
                new() 
                { 
                    Code = "AccessDenied", 
                    Description = message
                } 
            }
        });
    }
    
    // More general version that can be used for any error scenario
    public static IActionResult ForbidWithIdentityError(this ControllerBase controller,
        string code = "AccessDenied", string description = "You don't have permission to perform this action.")
    {
        return controller.StatusCode(StatusCodes.Status403Forbidden, new 
        {
            errors = new List<IdentityError> 
            { 
                new() 
                { 
                    Code = code, 
                    Description = description
                } 
            }
        });
    }
}
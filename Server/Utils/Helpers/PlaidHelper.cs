using System.Reflection;
using System.Runtime.Serialization;
using Going.Plaid.Entity;

namespace Server.Utils.Helpers;

public static class PlaidHelper
{
    // Add this helper method in your controller or create a utility class
    public static WebhookCode ParseWebhookCode(string code)
    {
        // Try all enum values
        foreach (var field in typeof(WebhookCode).GetFields())
        {
            if (field.GetCustomAttribute(typeof(EnumMemberAttribute)) is EnumMemberAttribute attribute)
            {
                // Compare the EnumMember Value to the incoming code
                if (attribute.Value == code)
                {
                    return (WebhookCode)field.GetValue(null);
                }
            }
        }
    
        return WebhookCode.Undefined;
    }
}
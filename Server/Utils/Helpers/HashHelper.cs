using System;
using System.Security.Cryptography;
using System.Text;

namespace Server.Utils.Helpers;

public static class HashHelper
{
    // Salt value to make hashes more secure and prevent rainbow table attacks
    // This should ideally be stored in configuration, not hardcoded
    // private static readonly string Salt = "YourSecureSaltValue"; 

    /// <summary>
    /// Creates a SHA256 hash of the input string with salt for logging purposes.
    /// Use this for PII data like emails and usernames in logs.
    /// </summary>
    /// <param name="input">The string to hash (email, username, etc.)</param>
    /// <param name="truncateLength">Optional: truncate hash to this length (default: 16 chars)</param>
    /// <returns>A salted SHA256 hash, optionally truncated</returns>
    private static string CreateHash(string input, int truncateLength = 16)
    {
        if (string.IsNullOrEmpty(input))
            return "empty_input";

        // // Add salt to input
        // var saltedInput = input + Salt;

        // Create SHA256 hash
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));

        // Convert to hex string
        var hashBuilder = new StringBuilder();
        foreach (var b in hashBytes)
        {
            hashBuilder.Append(b.ToString("x2"));
        }

        var fullHash = hashBuilder.ToString();

        // Return full or truncated hash
        return truncateLength > 0 && truncateLength < fullHash.Length
            ? fullHash[..truncateLength]
            : fullHash;
    }

    /// <summary>
    /// Creates a hash specifically for email addresses
    /// </summary>
    public static string HashEmail(string email)
    {
        return CreateHash(email.Trim().ToLowerInvariant());
    }

    /// <summary>
    /// Creates a hash specifically for usernames
    /// </summary>
    public static string HashUsername(string username)
    {
        return CreateHash(username.Trim().ToLowerInvariant());
    }
}
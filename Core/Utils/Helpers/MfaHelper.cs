using System.Text;
using System.Text.Encodings.Web;
using QRCoder;

namespace Core.Utils.Helpers;

public static class MfaHelper
{
    public static string FormatAuthenticatorKey(string unformattedKey)
    {
        var result = new StringBuilder();
        int currentPosition = 0;
        
        while (currentPosition + 4 < unformattedKey.Length)
        {
            result.Append(unformattedKey.Substring(currentPosition, 4)).Append(" ");
            currentPosition += 4;
        }
        
        if (currentPosition < unformattedKey.Length)
        {
            result.Append(unformattedKey.Substring(currentPosition));
        }
        
        return result.ToString().ToUpperInvariant();
    }

    public static string GenerateQrCodeUri(string email, string unformattedKey)
    {
        return string.Format(
            "otpauth://totp/{0}:{1}?secret={2}&issuer={0}&digits=6",
            UrlEncoder.Default.Encode("ZenWealth"),
            UrlEncoder.Default.Encode(email),
            unformattedKey);
    }

    public static byte[] GenerateQrCodeImage(string text)
    {
        using var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }
}
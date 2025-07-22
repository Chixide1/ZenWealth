using Serilog;

namespace ZenWealth.Api.Common;

public static class FileHelper
{
    public static string GetLogDirectory()
    {
        // Try CommonApplicationData first (preferred for system-wide apps)
        try
        {
            var commonAppDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                "ZenWealth", "Logs"
            );
        
            // Test if we can create the directory and write to it
            Directory.CreateDirectory(commonAppDataPath);
        
            // Test write permissions by creating a temporary file
            var testFile = Path.Combine(commonAppDataPath, "write_test.tmp");
            File.WriteAllText(testFile, "test");
            File.Delete(testFile);
        
            return commonAppDataPath;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Unable to create CommonApplicationData directory for logs. Using LocalApplicationData instead.");
        }
    
        // Fallback to LocalApplicationData (user-specific)
        var localAppDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "ZenWealth", "Logs"
        );
    
        Directory.CreateDirectory(localAppDataPath);
        return localAppDataPath;
    }
}
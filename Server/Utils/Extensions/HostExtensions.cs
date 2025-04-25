using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;

namespace Server.Utils.Extensions;

public static class HostExtensions
{
    public static void UseSerilogLogging(this IHostBuilder hostBuilder)
    {
        hostBuilder.UseSerilog((_, _, configuration) =>
        {
            var appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "ZenWealth-Api-Logs"
            );
            Directory.CreateDirectory(appDataPath); // Create if missing

            var logFilePath = Path.Combine(
                appDataPath,
                $"log-{DateTime.Now:dd-MM-yyyy}.json" // Daily rotating logs
            );

            configuration
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .MinimumLevel.Override("System", LogEventLevel.Warning)
                .WriteTo.Console()
                .WriteTo.File(
                    new CompactJsonFormatter(),
                    logFilePath,
                    rollingInterval: RollingInterval.Day,
                    rollOnFileSizeLimit: true
                )
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Application", "ZenWealth");
        });
    }
}
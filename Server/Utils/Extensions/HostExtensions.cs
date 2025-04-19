using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;

namespace Server.Utils.Extensions;

public static class HostExtensions
{
    public static IHostBuilder UseSerilogLogging(this IHostBuilder hostBuilder)
    {
        hostBuilder.UseSerilog((context, services, configuration) =>
        {
            string logFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Log.json");

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

        return hostBuilder;
    }
}
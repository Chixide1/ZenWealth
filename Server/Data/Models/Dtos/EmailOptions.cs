namespace Server.Data.Models.Dtos;

public class EmailOptions
{
    public string SenderEmail { get; init; } = string.Empty;
    public string FrontendBaseUrl { get; init; } = string.Empty;
}
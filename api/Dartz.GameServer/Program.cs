using Dartz.GameServer.Hubs;
using Dartz.GameServer.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://localhost:3000",
            "https://dartz.onrender.com",
            "https://dartz.finn-koehler.de",
            "https://dartz.finn-koehler.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

builder.Services.AddSingleton<LobbyManager>();
builder.Services.AddSingleton<PresenceTracker>();
builder.Services.AddSingleton<InviteManager>();
builder.Services.AddHostedService<LobbyCleanupService>();

// Parse ApiBaseUrl once at startup. A missing or malformed value used to
// crash GameHub construction on every connection (because the HttpClient
// configuration lambda threw UriFormatException), which took down lobby
// and game actions entirely even though MatchSubmitter is only used at
// end-of-match. Validate up front and fall back instead.
const string DefaultApiBaseUrl = "https://localhost:7128";
var configuredApiBaseUrl = builder.Configuration["ApiBaseUrl"];
if (!Uri.TryCreate(configuredApiBaseUrl, UriKind.Absolute, out var apiBaseUri))
{
    apiBaseUri = new Uri(DefaultApiBaseUrl);
    if (!string.IsNullOrWhiteSpace(configuredApiBaseUrl))
    {
        Console.Error.WriteLine(
            $"[startup] ApiBaseUrl='{configuredApiBaseUrl}' is not an absolute URI; " +
            $"falling back to {DefaultApiBaseUrl}. Match submission will fail until fixed.");
    }
}

builder.Services.AddHttpClient<MatchSubmitter>(client =>
{
    client.BaseAddress = apiBaseUri;
});

var app = builder.Build();

app.UseCors();
app.MapHub<GameHub>("/gamehub");

// Render injects PORT at runtime; locally we default to 5063 so existing
// NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:5063 keeps working.
var port = Environment.GetEnvironmentVariable("PORT") ?? "5063";
app.Run($"http://0.0.0.0:{port}");

// Exposed so WebApplicationFactory<Program> in Dartz.GameServer.Tests can host
// the app in-memory for SignalR integration tests.
public partial class Program;

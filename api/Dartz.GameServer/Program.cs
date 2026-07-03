using System.Text;
using Dartz.GameServer.Hubs;
using Dartz.GameServer.Services;
using dotenv.net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Load local .env for development (JWT_KEY, GAMESERVER_API_KEY, ApiBaseUrl, ...).
// In production (Render) these come from injected environment variables.
DotEnv.Load();

builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// ==================== Authentication ====================
// Validate the same JWTs the API issues (shared signing key via JWT_KEY).
// SignalR connections present the token via the access_token query string
// (set by the client's accessTokenFactory), since browsers can't attach
// Authorization headers to the WebSocket handshake.
var jwtKey = builder.Configuration["JWT_KEY"] ?? Environment.GetEnvironmentVariable("JWT_KEY");
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "JWT_KEY is not configured (or is shorter than 32 bytes). It must match the API's JWT_KEY.");
}
var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "dartz-api";
var jwtAudience = builder.Configuration["JWT_AUDIENCE"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "dartz-clients";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/gamehub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

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

// Shared secret used to authenticate this server's match submissions to the API.
var gameServerApiKey = builder.Configuration["GAMESERVER_API_KEY"]
    ?? Environment.GetEnvironmentVariable("GAMESERVER_API_KEY");

builder.Services.AddHttpClient<MatchSubmitter>(client =>
{
    client.BaseAddress = apiBaseUri;
    if (!string.IsNullOrEmpty(gameServerApiKey))
    {
        client.DefaultRequestHeaders.Add("X-Service-Key", gameServerApiKey);
    }
});

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapHub<GameHub>("/gamehub");

// Render injects PORT at runtime; locally we default to 5063 so existing
// NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:5063 keeps working.
var port = Environment.GetEnvironmentVariable("PORT") ?? "5063";
app.Run($"http://0.0.0.0:{port}");

// Exposed so WebApplicationFactory<Program> in Dartz.GameServer.Tests can host
// the app in-memory for SignalR integration tests.
public partial class Program;

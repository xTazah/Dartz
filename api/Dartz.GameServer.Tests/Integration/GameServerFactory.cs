using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Dartz.GameServer.Tests.Integration;

// Hosts the real GameServer Program in-memory and lets tests open SignalR
// HubConnection clients against it. Each test gets its own factory (new
// singletons), so lobby/invite state between tests doesn't leak.
public class GameServerFactory : WebApplicationFactory<Program>
{
    // Fixed JWT settings used only by the in-memory test host. They must match
    // what Program reads (JWT_KEY/JWT_ISSUER/JWT_AUDIENCE) so the hub accepts
    // the tokens we mint for test clients.
    private const string TestJwtKey = "test-signing-key-that-is-at-least-32-bytes-long!!";
    private const string TestIssuer = "dartz-api";
    private const string TestAudience = "dartz-clients";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("JWT_KEY", TestJwtKey);
        builder.UseSetting("JWT_ISSUER", TestIssuer);
        builder.UseSetting("JWT_AUDIENCE", TestAudience);

        builder.ConfigureTestServices(services =>
        {
            // Stub the HttpClient that MatchSubmitter uses. It posts finished
            // matches to the REST API; we don't want tests hitting a real URL.
            services.AddHttpClient<Services.MatchSubmitter>()
                .ConfigurePrimaryHttpMessageHandler(() => new StubHandler());
        });
    }

    // Mints a JWT for the given user so test clients authenticate as that user.
    public static string CreateToken(int userId, string username)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username),
        };
        var token = new JwtSecurityToken(
            issuer: TestIssuer,
            audience: TestAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public HubConnection CreateHubConnection(int userId, string username)
    {
        var server = Server;
        var token = CreateToken(userId, username);
        return new HubConnectionBuilder()
            .WithUrl(new Uri(server.BaseAddress, "gamehub"), options =>
            {
                options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.LongPolling;
                options.AccessTokenProvider = () => Task.FromResult<string?>(token);
            })
            .Build();
    }

    private sealed class StubHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken)
            => Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK));
    }
}

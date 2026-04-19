using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace Dartz.GameServer.Tests.Integration;

// Hosts the real GameServer Program in-memory and lets tests open SignalR
// HubConnection clients against it. Each test gets its own factory (new
// singletons), so lobby/invite state between tests doesn't leak.
public class GameServerFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // Stub the HttpClient that MatchSubmitter uses. It posts finished
            // matches to the REST API; we don't want tests hitting a real URL.
            services.AddHttpClient<Services.MatchSubmitter>()
                .ConfigurePrimaryHttpMessageHandler(() => new StubHandler());
        });
    }

    public HubConnection CreateHubConnection()
    {
        var server = Server;
        return new HubConnectionBuilder()
            .WithUrl(new Uri(server.BaseAddress, "gamehub"), options =>
            {
                options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                options.Transports = Microsoft.AspNetCore.Http.Connections.HttpTransportType.LongPolling;
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

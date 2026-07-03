using System.Text;
using Dartz.Business;
using Dartz.Business.Interfaces;
using Dartz.Service;
using Dartz.Service.Interfaces;
using Dartz_API.Auth;
using dotenv.net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Render.com puts the .env variables into the Configuration when running a Docker container. Use the standard .env approach we used previously for local development
DotEnv.Load();

var server = builder.Configuration["DB_SERVER"] ?? Environment.GetEnvironmentVariable("DB_SERVER");
var port = builder.Configuration["DB_PORT"] ?? Environment.GetEnvironmentVariable("DB_PORT");
var database = builder.Configuration["DB_NAME"] ?? Environment.GetEnvironmentVariable("DB_NAME");
var user = builder.Configuration["DB_USER"] ?? Environment.GetEnvironmentVariable("DB_USER");
var password = builder.Configuration["DB_PASSWORD"] ?? Environment.GetEnvironmentVariable("DB_PASSWORD");
var trustCert = builder.Configuration["DB_TRUST_CERT"] ?? Environment.GetEnvironmentVariable("DB_TRUST_CERT");

var connectionString = $"Server={server}; Port={port}; Database={database}; User Id={user}; Password={password}; Trust Server Certificate={trustCert};";


builder.Services.AddDbContext<DataContext>(options =>
    options.UseNpgsql(connectionString));

// ==================== Authentication / Authorization ====================
var jwtOptions = JwtOptions.FromConfiguration(builder.Configuration);
builder.Services.AddSingleton(jwtOptions);
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddSingleton<ServiceKeyValidator>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };

        // The token is delivered in the HttpOnly "SessionId" cookie (not JS-readable),
        // so it cannot be exfiltrated via XSS. Pull it out of the cookie into the
        // bearer pipeline. An Authorization header is still honoured if present.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token) &&
                    context.Request.Cookies.TryGetValue(AuthConstants.TokenCookieName, out var cookieToken))
                {
                    context.Token = cookieToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

//Repositories
builder.Services.AddTransient<IPlayerRepository, PlayerRepository>();
builder.Services.AddTransient<IGameSessionRepository, GameSessionRepository>();
builder.Services.AddTransient<IFriendsRepository, FriendsRepository>();
builder.Services.AddTransient<IMatchRepository, MatchRepository>();
//Services
builder.Services.AddTransient<IPlayerService, PlayerService>();
builder.Services.AddTransient<IFriendsService, FriendsService>();
builder.Services.AddTransient<IGameSessionService, GameSessionService>();
builder.Services.AddTransient<IPasswordService, PasswordService>();
builder.Services.AddTransient<IMatchService, MatchService>();

builder.Services.AddCors();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// global cors policy
app.UseCors(x => x
    .AllowAnyMethod()
    .AllowAnyHeader()
    //.SetIsOriginAllowed(origin => true) // allow any origin
    .WithOrigins("http://localhost:3000", "https://localhost:3000", "https://dartz.onrender.com", "https://dartz.finn-koehler.de", "https://dartz.finn-koehler.com", "dartz.finn-koehler.de", "dartz.finn-koehler.com", "finn-koehler.de", "finn-koehler.com") // Allow only this origin can also have multiple origins separated with comma
    .AllowCredentials()// allow credentials
    .WithExposedHeaders());

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

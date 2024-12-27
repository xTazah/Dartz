using Dartz.Business;
using Dartz.Business.Interfaces;
using Dartz.Service;
using Dartz.Service.Interfaces;
using dotenv.net;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.IdleTimeout = TimeSpan.FromMinutes(30);
});

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

//Repositories
builder.Services.AddTransient<IPlayerRepository, PlayerRepository>();
builder.Services.AddTransient<IGameSessionRepository, GameSessionRepository>();
//Services
builder.Services.AddTransient<IPlayerService, PlayerService>();
builder.Services.AddTransient<IGameSessionService, GameSessionService>();
builder.Services.AddTransient<IPasswordService, PasswordService>();

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

app.UseMiddleware<SessionMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();

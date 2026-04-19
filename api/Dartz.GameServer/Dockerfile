FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source
COPY Dartz.GameServer.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./
# Local default; Render injects PORT at runtime and Program.cs reads it.
EXPOSE 5063
ENTRYPOINT ["dotnet", "Dartz.GameServer.dll"]

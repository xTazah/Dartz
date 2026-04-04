FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source
COPY Dartz.GameServer.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./
EXPOSE 5063
ENV ASPNETCORE_URLS=http://+:5063
ENTRYPOINT ["dotnet", "Dartz.GameServer.dll"]

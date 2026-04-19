# Use the official .NET 8.0 SDK as the build environment
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory in the container
WORKDIR /source

# Copy only the project folders the REST API depends on. We restore the
# Dartz-API project directly (NOT the whole solution) because the solution
# now also contains Dartz.GameServer and Dartz.GameServer.Tests, which are
# deployed separately and are not part of this image's build context.
COPY Dartz.Business/ Dartz.Business/
COPY Dartz.Model/ Dartz.Model/
COPY Service/ Service/
COPY dartz-api/ dartz-api/

# Restore dependencies for the REST API project (pulls in its transitive
# ProjectReferences to Dartz.Business / Dartz.Model / Dartz.Service).
RUN dotnet restore dartz-api/Dartz-API.csproj

# Build the application in Release mode
RUN dotnet publish dartz-api/Dartz-API.csproj -c Release -o /app --no-restore

# Use the official ASP.NET runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Set the working directory for the runtime
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app ./

# Expose the port the app listens on
EXPOSE 80

# Set the entry point for the application
ENTRYPOINT ["dotnet", "Dartz-API.dll"]

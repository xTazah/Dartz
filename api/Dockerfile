# Use the official .NET 8.0 SDK as the build environment
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory in the container
WORKDIR /source

# Copy only the solution file
COPY Dartz-API.sln ./

# Copy all project files while maintaining their folder structure
COPY Dartz.Business/ Dartz.Business/
COPY Dartz.Model/ Dartz.Model/
COPY Service/ Service/
COPY dartz-api/ dartz-api/

# Restore dependencies using the solution file
RUN dotnet restore Dartz-API.sln

# Copy everything else to the container
COPY . .

# Build the application in Release mode
RUN dotnet publish dartz-api/Dartz-API.csproj -c Release -o /app

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

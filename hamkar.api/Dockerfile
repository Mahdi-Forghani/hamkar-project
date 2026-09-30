FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["Hamkar.Api.csproj", "."]
RUN dotnet restore

COPY . .

RUN dotnet publish -c Release -o /app/publish


FROM mcr.microsoft.com/playwright/dotnet:v1.62.0-noble AS final

WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Hamkar.Api.dll"]
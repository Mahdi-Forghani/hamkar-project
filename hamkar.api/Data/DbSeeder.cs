namespace Hamkar.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<HamkarDbContext>();

        var pendingMigrations = await db.Database.GetPendingMigrationsAsync();

        if (pendingMigrations.Any())
            await db.Database.MigrateAsync();
    }
}
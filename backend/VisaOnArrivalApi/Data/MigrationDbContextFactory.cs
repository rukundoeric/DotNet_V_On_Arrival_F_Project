using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using VisaOnArrivalApi.Data;
using DotNetEnv;

public class MigrationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Load environment variables from .env file
        Env.Load();

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        // Read connection string from environment variable
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("DATABASE_URL environment variable is not set. Please check your .env file.");
        }

        optionsBuilder.UseSqlServer(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
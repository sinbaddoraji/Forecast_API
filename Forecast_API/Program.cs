using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Forecast_API.Services;
using Forecast_API.Authorization;
using Forecast_API.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace Forecast_API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddDbContext<Data.CoreDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddMemoryCache();
        builder.Services.AddControllers();
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();

        // Register services
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddHttpClient<ITokenIntrospectionService, TokenIntrospectionService>();

        // Configure OAuth Introspection Authentication
        var authConfig = builder.Configuration.GetSection("Authentication:Zitadel");
        var authority = authConfig["Authority"];
        var apiClientId = authConfig["ApiClientId"];
        var introspectionEndpoint = authConfig["IntrospectionEndpoint"];
        
        // Log the configuration for debugging
        Console.WriteLine($"Introspection Configuration - Authority: {authority}, ApiClientId: {apiClientId}, Endpoint: {introspectionEndpoint}");
        
        builder.Services.AddAuthentication("Introspection")
            .AddScheme<IntrospectionAuthenticationSchemeOptions, IntrospectionAuthenticationHandler>("Introspection", options =>
            {
                options.Authority = authority ?? "";
                options.ClientId = apiClientId ?? "";
                options.ClientSecret = authConfig["ApiClientSecret"] ?? "";
            });

        // Configure authorization policies
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("IsSpaceMember", policy =>
                policy.Requirements.Add(new SpaceMemberRequirement()));
        });
        
        // Register authorization handlers
        builder.Services.AddSingleton<IAuthorizationHandler, SpaceMemberAuthorizationHandler>();

        // Configure CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:5174") // React dev server ports
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        var app = builder.Build();

        // Ensure database is created and migrations are applied in development
        if (app.Environment.IsDevelopment())
        {
            using var scope = app.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<CoreDbContext>();
            context.Database.EnsureCreated();
        }

        // Configure the HTTP request pipelsine.
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();

        app.UseCors("AllowFrontend");
        
        app.UseAuthentication();
        app.UseAuthorization();


        app.MapControllers();

        app.Run();
    }
}
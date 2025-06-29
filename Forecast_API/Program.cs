using Microsoft.EntityFrameworkCore;
using Forecast_API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Forecast_API.Services;
using Forecast_API.Authorization;
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

        builder.Services.AddControllers();
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddOpenApi();

        // Register services
        builder.Services.AddScoped<IUserService, UserService>();

        // Configure JWT authentication
        var authConfig = builder.Configuration.GetSection("Authentication:Zitadel");
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = authConfig["Authority"];
                options.Audience = authConfig["Audience"];
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    NameClaimType = "sub" // Use subject claim for User.Identity.Name
                };

                // Configure token validation events for JIT user provisioning
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var userService = context.HttpContext.RequestServices.GetRequiredService<IUserService>();
                        await userService.GetOrCreateUserAsync(context.Principal!);
                    }
                };
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
                policy.WithOrigins("http://localhost:3000", "http://localhost:5173") // React dev server ports
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        var app = builder.Build();

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
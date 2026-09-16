using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PharmacyManagement.Web.Data;

namespace PharmacyManagement.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllersWithViews();
            builder.Services.AddDbContext<PharmacyDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("PharmacyDb")));

            builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
                .AddCookie(options =>
                {
                    options.LoginPath = "/Account/Login";
                    options.LogoutPath = "/Account/Logout";
                    options.AccessDeniedPath = "/Account/Login";
                });

            builder.Services.AddAuthorization();

            WebApplication app = builder.Build();

            using (IServiceScope scope = app.Services.CreateScope())
            {
                PharmacyDbContext db = scope.ServiceProvider.GetRequiredService<PharmacyDbContext>();
                if (db.Database.CanConnect())
                {
                    UserSeeder.EnsureAdminUser(db);
                }
            }

            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}

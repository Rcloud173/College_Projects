using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.StaticFiles;

namespace PharmacyManagement.Pwa
{
    public class Program
    {
        public static void Main(string[] args)
        {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
            WebApplication app = builder.Build();

            FileExtensionContentTypeProvider contentTypes = new FileExtensionContentTypeProvider();
            contentTypes.Mappings[".webmanifest"] = "application/manifest+json";

            app.UseDefaultFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                ContentTypeProvider = contentTypes
            });

            app.Run();
        }
    }
}

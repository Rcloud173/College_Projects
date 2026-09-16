using System.Linq;
using PharmacyManagement.Web.Helpers;
using PharmacyManagement.Web.Models;

namespace PharmacyManagement.Web.Data
{
    public static class UserSeeder
    {
        public static void EnsureAdminUser(PharmacyDbContext db)
        {
            if (db.Users.Any())
            {
                return;
            }

            db.Users.Add(new User
            {
                Username = "admin",
                Password = PasswordHelper.Hash("admin123"),
                Role = "Admin"
            });
            db.SaveChanges();
        }
    }
}

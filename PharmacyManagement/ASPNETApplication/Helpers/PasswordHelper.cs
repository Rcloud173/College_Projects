using System;
using System.Security.Cryptography;
using System.Text;

namespace PharmacyManagement.Web.Helpers
{
    public static class PasswordHelper
    {
        public static string Hash(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        public static bool Verify(string enteredPassword, string storedPassword)
        {
            if (string.IsNullOrEmpty(enteredPassword) || string.IsNullOrEmpty(storedPassword))
            {
                return false;
            }

            if (Hash(enteredPassword) == storedPassword)
            {
                return true;
            }

            // Allows a user created directly in SQL Server with a plain password.
            return enteredPassword == storedPassword;
        }
    }
}

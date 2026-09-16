using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Web.Data;
using PharmacyManagement.Web.Helpers;
using PharmacyManagement.Web.Models;
using PharmacyManagement.Web.ViewModels;

namespace PharmacyManagement.Web.Controllers
{
    [Authorize]
    public class AccountController : Controller
    {
        private readonly PharmacyDbContext _db;

        public AccountController(PharmacyDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login(string returnUrl)
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }

            ViewBag.ReturnUrl = returnUrl;
            return View(new LoginViewModel());
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string returnUrl)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.ReturnUrl = returnUrl;
                return View(model);
            }

            User user = _db.Users.FirstOrDefault(u => u.Username == model.Username);
            if (user == null || !PasswordHelper.Verify(model.Password, user.Password))
            {
                ModelState.AddModelError(string.Empty, "Invalid username or password.");
                ViewBag.ReturnUrl = returnUrl;
                return View(model);
            }

            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role ?? string.Empty)
            };

            ClaimsIdentity identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity));

            if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }

            return RedirectToAction("Index", "Home");
        }

        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            TempData["Message"] = "You have been logged out.";
            return RedirectToAction("Login");
        }

        [Authorize]
        [HttpGet]
        public IActionResult ChangePassword()
        {
            return View(new ChangePasswordViewModel());
        }

        [Authorize]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ChangePassword(ChangePasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            string username = User.Identity != null ? User.Identity.Name : null;
            User user = _db.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
            {
                ModelState.AddModelError(string.Empty, "The logged-in user was not found.");
                return View(model);
            }

            if (!PasswordHelper.Verify(model.CurrentPassword, user.Password))
            {
                ModelState.AddModelError(string.Empty, "Current password is incorrect.");
                return View(model);
            }

            user.Password = PasswordHelper.Hash(model.NewPassword);
            _db.SaveChanges();

            TempData["Message"] = "Password changed successfully.";
            return RedirectToAction("Index", "Home");
        }
    }
}

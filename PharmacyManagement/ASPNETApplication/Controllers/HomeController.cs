using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Web.Data;
using PharmacyManagement.Web.ViewModels;

namespace PharmacyManagement.Web.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly PharmacyDbContext _db;

        public HomeController(PharmacyDbContext db)
        {
            _db = db;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Dashboard()
        {
            DateTime today = DateTime.Today;

            DashboardViewModel model = new DashboardViewModel
            {
                TotalMedicines = _db.Medicines.Count(),
                TotalSuppliers = _db.Suppliers.Count(),
                TotalCustomers = _db.Customers.Count(),
                TotalSales = _db.Sales.Count(),
                TotalSalesAmount = _db.Sales.Sum(s => (decimal?)s.TotalAmount) ?? 0,
                TotalPurchases = _db.Purchases.Count(),
                TotalPurchaseAmount = _db.Purchases.Sum(p => (decimal?)p.TotalAmount) ?? 0,
                CurrentStock = _db.Medicines.Sum(m => (int?)m.StockQuantity) ?? 0,
                LowStockCount = _db.Medicines.Count(m => m.StockQuantity <= m.ReorderLevel),
                ExpiredCount = _db.Medicines.Count(m => m.ExpiryDate < today),
                LowStockMedicines = _db.Medicines
                    .AsNoTracking()
                    .Where(m => m.StockQuantity <= m.ReorderLevel)
                    .OrderBy(m => m.StockQuantity)
                    .ToList(),
                ExpiredMedicines = _db.Medicines
                    .AsNoTracking()
                    .Where(m => m.ExpiryDate < today)
                    .OrderBy(m => m.ExpiryDate)
                    .ToList(),
                RecentSales = _db.Sales
                    .AsNoTracking()
                    .Include(s => s.Customer)
                    .Include(s => s.SaleItems)
                        .ThenInclude(i => i.Medicine)
                    .OrderByDescending(s => s.SaleDate)
                    .ThenByDescending(s => s.SaleId)
                    .Take(5)
                    .ToList()
            };

            return View(model);
        }

        public IActionResult Medicines()
        {
            return RedirectToAction("Index", "Medicines");
        }

        public IActionResult Suppliers()
        {
            return RedirectToAction("Index", "Suppliers");
        }

        public IActionResult Customers()
        {
            return RedirectToAction("Index", "Customers");
        }

        public IActionResult Purchases()
        {
            return RedirectToAction("Index", "Purchases");
        }

        public IActionResult Sales()
        {
            return RedirectToAction("Index", "Sales");
        }

        public IActionResult Reports()
        {
            return RedirectToAction("Index", "Reports");
        }

        [AllowAnonymous]
        public IActionResult Error()
        {
            return View();
        }
    }
}

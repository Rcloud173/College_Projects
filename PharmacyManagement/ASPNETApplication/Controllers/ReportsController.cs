using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Web.Data;
using PharmacyManagement.Web.Models;

namespace PharmacyManagement.Web.Controllers
{
    [Authorize]
    public class ReportsController : Controller
    {
        private readonly PharmacyDbContext _db;

        public ReportsController(PharmacyDbContext db)
        {
            _db = db;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Inventory(string name, string category, string stockStatus)
        {
            IQueryable<Medicine> query = _db.Medicines.AsNoTracking().Include(m => m.Supplier);

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(m => m.Name.Contains(name));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(m => m.Category == category);
            }

            DateTime today = DateTime.Today;
            if (stockStatus == "LowStock")
            {
                query = query.Where(m => m.StockQuantity <= m.ReorderLevel);
            }
            else if (stockStatus == "Expired")
            {
                query = query.Where(m => m.ExpiryDate < today);
            }
            else if (stockStatus == "OK")
            {
                query = query.Where(m => m.StockQuantity > m.ReorderLevel && m.ExpiryDate >= today);
            }

            ViewBag.Name = name;
            ViewBag.Category = category;
            ViewBag.StockStatus = stockStatus;
            ViewBag.Categories = _db.Medicines.Select(m => m.Category).Distinct().OrderBy(c => c).ToList();

            List<Medicine> medicines = query.OrderBy(m => m.Name).ToList();
            return View(medicines);
        }

        public IActionResult Sales(int? customerId, int? medicineId, DateTime? date)
        {
            IQueryable<Sale> query = _db.Sales
                .AsNoTracking()
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                    .ThenInclude(i => i.Medicine);

            if (customerId.HasValue && customerId.Value > 0)
            {
                query = query.Where(s => s.CustomerId == customerId.Value);
            }

            if (date.HasValue)
            {
                DateTime day = date.Value.Date;
                query = query.Where(s => s.SaleDate == day);
            }

            List<Sale> sales = query
                .OrderByDescending(s => s.SaleDate)
                .ThenByDescending(s => s.SaleId)
                .ToList();

            if (medicineId.HasValue && medicineId.Value > 0)
            {
                foreach (Sale sale in sales)
                {
                    sale.SaleItems = sale.SaleItems.Where(i => i.MedicineId == medicineId.Value).ToList();
                }
                sales = sales.Where(s => s.SaleItems.Any()).ToList();
            }

            ViewBag.CustomerId = customerId;
            ViewBag.MedicineId = medicineId;
            ViewBag.Date = date.HasValue ? date.Value.ToString("yyyy-MM-dd") : string.Empty;
            ViewBag.Customers = new SelectList(_db.Customers.OrderBy(c => c.Name), "CustomerId", "Name", customerId);
            ViewBag.Medicines = new SelectList(_db.Medicines.OrderBy(m => m.Name), "MedicineId", "Name", medicineId);

            return View(sales);
        }

        public IActionResult Purchases(int? supplierId, int? medicineId, DateTime? date)
        {
            IQueryable<Purchase> query = _db.Purchases
                .AsNoTracking()
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseItems)
                    .ThenInclude(i => i.Medicine);

            if (supplierId.HasValue && supplierId.Value > 0)
            {
                query = query.Where(p => p.SupplierId == supplierId.Value);
            }

            if (date.HasValue)
            {
                DateTime day = date.Value.Date;
                query = query.Where(p => p.PurchaseDate == day);
            }

            List<Purchase> purchases = query
                .OrderByDescending(p => p.PurchaseDate)
                .ThenByDescending(p => p.PurchaseId)
                .ToList();

            if (medicineId.HasValue && medicineId.Value > 0)
            {
                foreach (Purchase purchase in purchases)
                {
                    purchase.PurchaseItems = purchase.PurchaseItems.Where(i => i.MedicineId == medicineId.Value).ToList();
                }
                purchases = purchases.Where(p => p.PurchaseItems.Any()).ToList();
            }

            ViewBag.SupplierId = supplierId;
            ViewBag.MedicineId = medicineId;
            ViewBag.Date = date.HasValue ? date.Value.ToString("yyyy-MM-dd") : string.Empty;
            ViewBag.Suppliers = new SelectList(_db.Suppliers.OrderBy(s => s.Name), "SupplierId", "Name", supplierId);
            ViewBag.Medicines = new SelectList(_db.Medicines.OrderBy(m => m.Name), "MedicineId", "Name", medicineId);

            return View(purchases);
        }

        public IActionResult LowStock()
        {
            List<Medicine> medicines = _db.Medicines
                .AsNoTracking()
                .Where(m => m.StockQuantity <= m.ReorderLevel)
                .OrderBy(m => m.StockQuantity)
                .ToList();

            return View(medicines);
        }

        public IActionResult Expired()
        {
            DateTime today = DateTime.Today;
            List<Medicine> medicines = _db.Medicines
                .AsNoTracking()
                .Where(m => m.ExpiryDate < today)
                .OrderBy(m => m.ExpiryDate)
                .ToList();

            return View(medicines);
        }
    }
}

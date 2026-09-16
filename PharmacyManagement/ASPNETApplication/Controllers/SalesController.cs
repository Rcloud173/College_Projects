using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Web.Data;
using PharmacyManagement.Web.Models;
using PharmacyManagement.Web.Services;
using PharmacyManagement.Web.ViewModels;

namespace PharmacyManagement.Web.Controllers
{
    [Authorize]
    public class SalesController : Controller
    {
        private readonly PharmacyDbContext _db;
        private readonly PharmacyTransactionService _transactions;

        public SalesController(PharmacyDbContext db)
        {
            _db = db;
            _transactions = new PharmacyTransactionService();
        }

        public IActionResult Index()
        {
            List<Sale> sales = _db.Sales
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                    .ThenInclude(i => i.Medicine)
                .OrderByDescending(s => s.SaleDate)
                .ThenByDescending(s => s.SaleId)
                .ToList();

            return View(sales);
        }

        public IActionResult Create()
        {
            LoadLists();
            return View(new SaleFormViewModel { Quantity = 1 });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(SaleFormViewModel model)
        {
            if (!ModelState.IsValid)
            {
                LoadLists();
                return View(model);
            }

            string error = _transactions.RecordSale(_db, model.CustomerId, model.MedicineId, model.Quantity);
            if (error != null)
            {
                ModelState.AddModelError(string.Empty, error);
                LoadLists();
                return View(model);
            }

            TempData["Message"] = "Sale saved. Medicine stock was reduced.";
            return RedirectToAction("Index");
        }

        private void LoadLists()
        {
            ViewBag.Customers = new SelectList(_db.Customers.OrderBy(c => c.Name), "CustomerId", "Name");
            ViewBag.Medicines = new SelectList(
                _db.Medicines.OrderBy(m => m.Name).ToList().Select(m => new
                {
                    m.MedicineId,
                    Label = m.Name + " | Stock: " + m.StockQuantity +
                            " | Price: " + m.SellingPrice.ToString("0.00") +
                            " | Exp: " + m.ExpiryDate.ToString("yyyy-MM-dd") +
                            (m.IsExpired ? " [EXPIRED]" : string.Empty)
                }),
                "MedicineId",
                "Label");
        }
    }
}

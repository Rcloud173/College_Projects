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
    public class PurchasesController : Controller
    {
        private readonly PharmacyDbContext _db;
        private readonly PharmacyTransactionService _transactions;

        public PurchasesController(PharmacyDbContext db)
        {
            _db = db;
            _transactions = new PharmacyTransactionService();
        }

        public IActionResult Index()
        {
            List<Purchase> purchases = _db.Purchases
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseItems)
                    .ThenInclude(i => i.Medicine)
                .OrderByDescending(p => p.PurchaseDate)
                .ThenByDescending(p => p.PurchaseId)
                .ToList();

            return View(purchases);
        }

        public IActionResult Create()
        {
            LoadLists();
            return View(new PurchaseFormViewModel { Quantity = 1 });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(PurchaseFormViewModel model)
        {
            if (!ModelState.IsValid)
            {
                LoadLists();
                return View(model);
            }

            string error = _transactions.RecordPurchase(_db, model.SupplierId, model.MedicineId, model.Quantity, model.Price);
            if (error != null)
            {
                ModelState.AddModelError(string.Empty, error);
                LoadLists();
                return View(model);
            }

            TempData["Message"] = "Purchase saved. Medicine stock was increased.";
            return RedirectToAction("Index");
        }

        private void LoadLists()
        {
            ViewBag.Suppliers = new SelectList(_db.Suppliers.OrderBy(s => s.Name), "SupplierId", "Name");
            ViewBag.Medicines = new SelectList(
                _db.Medicines.OrderBy(m => m.Name).ToList().Select(m => new
                {
                    m.MedicineId,
                    Label = m.Name + " (Stock: " + m.StockQuantity + ")"
                }),
                "MedicineId",
                "Label");
        }
    }
}

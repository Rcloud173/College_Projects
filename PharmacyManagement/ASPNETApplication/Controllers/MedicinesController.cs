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
    public class MedicinesController : Controller
    {
        private readonly PharmacyDbContext _db;

        public MedicinesController(PharmacyDbContext db)
        {
            _db = db;
        }

        public IActionResult Index(string search, string category)
        {
            IQueryable<Medicine> query = _db.Medicines.Include(m => m.Supplier);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(m => m.Name.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(m => m.Category == category);
            }

            ViewBag.Search = search;
            ViewBag.Category = category;
            ViewBag.Categories = _db.Medicines
                .Select(m => m.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToList();

            List<Medicine> medicines = query.OrderBy(m => m.Name).ToList();
            return View(medicines);
        }

        public IActionResult Details(int id)
        {
            Medicine medicine = FindMedicine(id);
            if (medicine == null)
            {
                return MedicineNotFound();
            }

            return View(medicine);
        }

        public IActionResult Create()
        {
            LoadSuppliers();
            return View(new Medicine { ExpiryDate = System.DateTime.Today.AddYears(1) });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Medicine medicine)
        {
            ValidateSupplier(medicine);

            if (!ModelState.IsValid)
            {
                LoadSuppliers(medicine.SupplierId);
                return View(medicine);
            }

            _db.Medicines.Add(medicine);
            _db.SaveChanges();
            TempData["Message"] = "Medicine added successfully.";
            return RedirectToAction("Index");
        }

        public IActionResult Edit(int id)
        {
            Medicine medicine = FindMedicine(id);
            if (medicine == null)
            {
                return MedicineNotFound();
            }

            LoadSuppliers(medicine.SupplierId);
            return View(medicine);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Medicine medicine)
        {
            if (id != medicine.MedicineId)
            {
                return MedicineNotFound();
            }

            ValidateSupplier(medicine);

            if (!ModelState.IsValid)
            {
                LoadSuppliers(medicine.SupplierId);
                return View(medicine);
            }

            Medicine existing = _db.Medicines.Find(id);
            if (existing == null)
            {
                return MedicineNotFound();
            }

            existing.Name = medicine.Name;
            existing.Category = medicine.Category;
            existing.BatchNumber = medicine.BatchNumber;
            existing.ExpiryDate = medicine.ExpiryDate;
            existing.PurchasePrice = medicine.PurchasePrice;
            existing.SellingPrice = medicine.SellingPrice;
            existing.StockQuantity = medicine.StockQuantity;
            existing.ReorderLevel = medicine.ReorderLevel;
            existing.SupplierId = medicine.SupplierId;

            _db.SaveChanges();
            TempData["Message"] = "Medicine updated successfully.";
            return RedirectToAction("Index");
        }

        public IActionResult Delete(int id)
        {
            Medicine medicine = FindMedicine(id);
            if (medicine == null)
            {
                return MedicineNotFound();
            }

            return View(medicine);
        }

        [HttpPost]
        [ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public IActionResult DeleteConfirmed(int id)
        {
            Medicine medicine = _db.Medicines.Find(id);
            if (medicine == null)
            {
                return MedicineNotFound();
            }

            try
            {
                _db.Medicines.Remove(medicine);
                _db.SaveChanges();
                TempData["Message"] = "Medicine deleted successfully.";
                return RedirectToAction("Index");
            }
            catch (DbUpdateException)
            {
                TempData["Error"] = "This medicine cannot be deleted because it is used in a purchase or sale.";
                return RedirectToAction("Delete", new { id = id });
            }
        }

        private Medicine FindMedicine(int id)
        {
            return _db.Medicines.Include(m => m.Supplier).FirstOrDefault(m => m.MedicineId == id);
        }

        private IActionResult MedicineNotFound()
        {
            TempData["Error"] = "The requested medicine was not found.";
            return RedirectToAction("Index");
        }

        private void ValidateSupplier(Medicine medicine)
        {
            bool supplierExists = _db.Suppliers.Any(s => s.SupplierId == medicine.SupplierId);
            if (!supplierExists)
            {
                ModelState.AddModelError("SupplierId", "Please select a valid supplier.");
            }
        }

        private void LoadSuppliers(int? selectedId = null)
        {
            ViewBag.Suppliers = new SelectList(_db.Suppliers.OrderBy(s => s.Name), "SupplierId", "Name", selectedId);
        }
    }
}

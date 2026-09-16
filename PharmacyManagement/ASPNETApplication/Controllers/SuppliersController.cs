using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Web.Data;
using PharmacyManagement.Web.Models;

namespace PharmacyManagement.Web.Controllers
{
    [Authorize]
    public class SuppliersController : Controller
    {
        private readonly PharmacyDbContext _db;

        public SuppliersController(PharmacyDbContext db)
        {
            _db = db;
        }

        public IActionResult Index(string search)
        {
            IQueryable<Supplier> query = _db.Suppliers;

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(s => s.Name.Contains(search) || s.Phone.Contains(search) || s.Email.Contains(search));
            }

            ViewBag.Search = search;
            List<Supplier> suppliers = query.OrderBy(s => s.Name).ToList();
            return View(suppliers);
        }

        public IActionResult Details(int id)
        {
            Supplier supplier = _db.Suppliers.Find(id);
            if (supplier == null)
            {
                return NotFoundSupplier();
            }

            return View(supplier);
        }

        public IActionResult Create()
        {
            return View(new Supplier());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Supplier supplier)
        {
            if (!ModelState.IsValid)
            {
                return View(supplier);
            }

            _db.Suppliers.Add(supplier);
            _db.SaveChanges();
            TempData["Message"] = "Supplier added successfully.";
            return RedirectToAction("Index");
        }

        public IActionResult Edit(int id)
        {
            Supplier supplier = _db.Suppliers.Find(id);
            if (supplier == null)
            {
                return NotFoundSupplier();
            }

            return View(supplier);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Supplier supplier)
        {
            if (id != supplier.SupplierId)
            {
                return NotFoundSupplier();
            }

            if (!ModelState.IsValid)
            {
                return View(supplier);
            }

            Supplier existing = _db.Suppliers.Find(id);
            if (existing == null)
            {
                return NotFoundSupplier();
            }

            existing.Name = supplier.Name;
            existing.Phone = supplier.Phone;
            existing.Email = supplier.Email;
            existing.Address = supplier.Address;
            _db.SaveChanges();

            TempData["Message"] = "Supplier updated successfully.";
            return RedirectToAction("Index");
        }

        public IActionResult Delete(int id)
        {
            Supplier supplier = _db.Suppliers.Find(id);
            if (supplier == null)
            {
                return NotFoundSupplier();
            }

            return View(supplier);
        }

        [HttpPost]
        [ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public IActionResult DeleteConfirmed(int id)
        {
            Supplier supplier = _db.Suppliers.Find(id);
            if (supplier == null)
            {
                return NotFoundSupplier();
            }

            bool usedInPurchases = _db.Purchases.Any(p => p.SupplierId == id);
            bool usedInMedicines = _db.Medicines.Any(m => m.SupplierId == id);

            if (usedInPurchases || usedInMedicines)
            {
                TempData["Error"] = "This supplier cannot be deleted because medicines or purchases are linked to it.";
                return RedirectToAction("Delete", new { id = id });
            }

            try
            {
                _db.Suppliers.Remove(supplier);
                _db.SaveChanges();
                TempData["Message"] = "Supplier deleted successfully.";
                return RedirectToAction("Index");
            }
            catch (DbUpdateException)
            {
                TempData["Error"] = "This supplier cannot be deleted because related records exist.";
                return RedirectToAction("Delete", new { id = id });
            }
        }

        private IActionResult NotFoundSupplier()
        {
            TempData["Error"] = "The requested supplier was not found.";
            return RedirectToAction("Index");
        }
    }
}

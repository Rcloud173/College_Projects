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
    public class CustomersController : Controller
    {
        private readonly PharmacyDbContext _db;

        public CustomersController(PharmacyDbContext db)
        {
            _db = db;
        }

        public IActionResult Index(string search)
        {
            IQueryable<Customer> query = _db.Customers;

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => c.Name.Contains(search) || c.Phone.Contains(search) || c.Email.Contains(search));
            }

            ViewBag.Search = search;
            List<Customer> customers = query.OrderBy(c => c.Name).ToList();
            return View(customers);
        }

        public IActionResult Details(int id)
        {
            Customer customer = _db.Customers.Find(id);
            if (customer == null)
            {
                return NotFoundCustomer();
            }

            return View(customer);
        }

        public IActionResult Create()
        {
            return View(new Customer());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Customer customer)
        {
            if (!ModelState.IsValid)
            {
                return View(customer);
            }

            _db.Customers.Add(customer);
            _db.SaveChanges();
            TempData["Message"] = "Customer added successfully.";
            return RedirectToAction("Index");
        }

        public IActionResult Edit(int id)
        {
            Customer customer = _db.Customers.Find(id);
            if (customer == null)
            {
                return NotFoundCustomer();
            }

            return View(customer);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(int id, Customer customer)
        {
            if (id != customer.CustomerId)
            {
                return NotFoundCustomer();
            }

            if (!ModelState.IsValid)
            {
                return View(customer);
            }

            Customer existing = _db.Customers.Find(id);
            if (existing == null)
            {
                return NotFoundCustomer();
            }

            existing.Name = customer.Name;
            existing.Phone = customer.Phone;
            existing.Email = customer.Email;
            existing.Address = customer.Address;
            _db.SaveChanges();

            TempData["Message"] = "Customer updated successfully.";
            return RedirectToAction("Index");
        }

        public IActionResult Delete(int id)
        {
            Customer customer = _db.Customers.Find(id);
            if (customer == null)
            {
                return NotFoundCustomer();
            }

            return View(customer);
        }

        [HttpPost]
        [ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public IActionResult DeleteConfirmed(int id)
        {
            Customer customer = _db.Customers.Find(id);
            if (customer == null)
            {
                return NotFoundCustomer();
            }

            if (_db.Sales.Any(s => s.CustomerId == id))
            {
                TempData["Error"] = "This customer cannot be deleted because sales are linked to this record.";
                return RedirectToAction("Delete", new { id = id });
            }

            try
            {
                _db.Customers.Remove(customer);
                _db.SaveChanges();
                TempData["Message"] = "Customer deleted successfully.";
                return RedirectToAction("Index");
            }
            catch (DbUpdateException)
            {
                TempData["Error"] = "This customer cannot be deleted because related records exist.";
                return RedirectToAction("Delete", new { id = id });
            }
        }

        private IActionResult NotFoundCustomer()
        {
            TempData["Error"] = "The requested customer was not found.";
            return RedirectToAction("Index");
        }
    }
}

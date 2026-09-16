using System.Collections.Generic;
using PharmacyManagement.Models;

namespace PharmacyManagement.Data
{
    /// <summary>
    /// In-memory storage for Phase 1. No database is used.
    /// </summary>
    public class InMemoryStore
    {
        public List<Medicine> Medicines { get; private set; }
        public List<Supplier> Suppliers { get; private set; }
        public List<Customer> Customers { get; private set; }
        public List<Purchase> Purchases { get; private set; }
        public List<Sale> Sales { get; private set; }

        public InMemoryStore()
        {
            Medicines = new List<Medicine>();
            Suppliers = new List<Supplier>();
            Customers = new List<Customer>();
            Purchases = new List<Purchase>();
            Sales = new List<Sale>();
        }
    }
}

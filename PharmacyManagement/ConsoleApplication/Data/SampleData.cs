using System;
using PharmacyManagement.Models;

namespace PharmacyManagement.Data
{
    public static class SampleData
    {
        public static void Load(InMemoryStore store)
        {
            store.Suppliers.Add(new Supplier
            {
                Id = 1,
                Name = "MedLife Distributors",
                Phone = "9876543210",
                Address = "12 Market Road, City"
            });
            store.Suppliers.Add(new Supplier
            {
                Id = 2,
                Name = "HealthPlus Wholesale",
                Phone = "9123456780",
                Address = "45 Industrial Area"
            });

            store.Customers.Add(new Customer { Id = 1, Name = "Walk-in Customer", Phone = "-" });
            store.Customers.Add(new Customer { Id = 2, Name = "Anita Sharma", Phone = "9001112233" });

            store.Medicines.Add(new Medicine
            {
                Id = 1,
                Name = "Paracetamol 500mg",
                GenericName = "Paracetamol",
                Manufacturer = "Cipla",
                UnitPrice = 12.50m,
                StockQuantity = 80,
                ExpiryDate = DateTime.Today.AddMonths(18),
                ReorderLevel = 20
            });
            store.Medicines.Add(new Medicine
            {
                Id = 2,
                Name = "Amoxicillin 250mg",
                GenericName = "Amoxicillin",
                Manufacturer = "Sun Pharma",
                UnitPrice = 45.00m,
                StockQuantity = 15,
                ExpiryDate = DateTime.Today.AddMonths(10),
                ReorderLevel = 20
            });
            store.Medicines.Add(new Medicine
            {
                Id = 3,
                Name = "Cetirizine 10mg",
                GenericName = "Cetirizine",
                Manufacturer = "Dr Reddy",
                UnitPrice = 18.00m,
                StockQuantity = 40,
                ExpiryDate = DateTime.Today.AddMonths(8),
                ReorderLevel = 10
            });
            store.Medicines.Add(new Medicine
            {
                Id = 4,
                Name = "Old Cough Syrup",
                GenericName = "Dextromethorphan",
                Manufacturer = "Local Labs",
                UnitPrice = 55.00m,
                StockQuantity = 12,
                ExpiryDate = DateTime.Today.AddDays(-10),
                ReorderLevel = 5
            });
        }
    }
}

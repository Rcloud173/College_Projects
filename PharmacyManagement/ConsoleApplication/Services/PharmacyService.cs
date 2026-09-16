using System;
using System.Collections.Generic;
using PharmacyManagement.Data;
using PharmacyManagement.Exceptions;
using PharmacyManagement.Models;

namespace PharmacyManagement.Services
{
    /// <summary>
    /// Central place for pharmacy business rules used by the console menus.
    /// Phase 2 can reuse the same rules conceptually.
    /// </summary>
    public class PharmacyService
    {
        private readonly InMemoryStore _store;

        public PharmacyService(InMemoryStore store)
        {
            _store = store;
        }

        public IList<Medicine> GetAllMedicines()
        {
            return _store.Medicines;
        }

        public IList<Supplier> GetAllSuppliers()
        {
            return _store.Suppliers;
        }

        public IList<Customer> GetAllCustomers()
        {
            return _store.Customers;
        }

        public IList<Purchase> GetAllPurchases()
        {
            return _store.Purchases;
        }

        public IList<Sale> GetAllSales()
        {
            return _store.Sales;
        }

        public Medicine GetMedicineById(int id)
        {
            foreach (Medicine medicine in _store.Medicines)
            {
                if (medicine.Id == id)
                {
                    return medicine;
                }
            }

            throw new EntityNotFoundException("Medicine with ID " + id + " was not found.");
        }

        public Supplier GetSupplierById(int id)
        {
            foreach (Supplier supplier in _store.Suppliers)
            {
                if (supplier.Id == id)
                {
                    return supplier;
                }
            }

            throw new EntityNotFoundException("Supplier with ID " + id + " was not found.");
        }

        public Customer GetCustomerById(int id)
        {
            foreach (Customer customer in _store.Customers)
            {
                if (customer.Id == id)
                {
                    return customer;
                }
            }

            throw new EntityNotFoundException("Customer with ID " + id + " was not found.");
        }

        public Medicine AddMedicine(string name, string genericName, string manufacturer, decimal unitPrice, DateTime expiryDate, int reorderLevel)
        {
            ValidateMedicineInput(name, genericName, manufacturer, unitPrice, expiryDate, reorderLevel);

            Medicine medicine = new Medicine
            {
                Id = NextMedicineId(),
                Name = name.Trim(),
                GenericName = genericName.Trim(),
                Manufacturer = manufacturer.Trim(),
                UnitPrice = unitPrice,
                StockQuantity = 0,
                ExpiryDate = expiryDate.Date,
                ReorderLevel = reorderLevel
            };

            _store.Medicines.Add(medicine);
            return medicine;
        }

        public void UpdateMedicine(int id, decimal unitPrice, int reorderLevel, DateTime expiryDate)
        {
            if (unitPrice <= 0)
            {
                throw new ValidationException("Unit price must be greater than 0.");
            }
            if (reorderLevel < 0)
            {
                throw new ValidationException("Reorder level cannot be negative.");
            }
            if (expiryDate == DateTime.MinValue)
            {
                throw new ValidationException("Expiry date is required.");
            }

            Medicine medicine = GetMedicineById(id);
            medicine.UnitPrice = unitPrice;
            medicine.ReorderLevel = reorderLevel;
            medicine.ExpiryDate = expiryDate.Date;
        }

        public Supplier AddSupplier(string name, string phone, string address)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ValidationException("Supplier name is required.");
            }

            Supplier supplier = new Supplier
            {
                Id = NextSupplierId(),
                Name = name.Trim(),
                Phone = SafeText(phone),
                Address = SafeText(address)
            };
            _store.Suppliers.Add(supplier);
            return supplier;
        }

        public Customer AddCustomer(string name, string phone)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ValidationException("Customer name is required.");
            }

            Customer customer = new Customer
            {
                Id = NextCustomerId(),
                Name = name.Trim(),
                Phone = SafeText(phone)
            };
            _store.Customers.Add(customer);
            return customer;
        }

        public List<Medicine> SearchMedicines(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                throw new ValidationException("Search keyword is required.");
            }

            string term = keyword.Trim().ToLower();
            List<Medicine> results = new List<Medicine>();

            foreach (Medicine medicine in _store.Medicines)
            {
                if (Contains(medicine.Name, term) ||
                    Contains(medicine.GenericName, term) ||
                    Contains(medicine.Manufacturer, term) ||
                    medicine.Id.ToString() == term)
                {
                    results.Add(medicine);
                }
            }

            return results;
        }

        public Purchase RecordPurchase(int supplierId, List<PurchaseItem> items, DateTime purchaseDate)
        {
            if (items == null || items.Count == 0)
            {
                throw new ValidationException("A purchase must contain at least one medicine.");
            }

            Supplier supplier = GetSupplierById(supplierId);

            foreach (PurchaseItem item in items)
            {
                if (item.Quantity <= 0)
                {
                    throw new ValidationException("Purchase quantity must be greater than 0.");
                }
                if (item.UnitCost < 0)
                {
                    throw new ValidationException("Purchase unit cost cannot be negative.");
                }

                Medicine medicine = GetMedicineById(item.MedicineId);
                item.MedicineName = medicine.Name;
            }

            Purchase purchase = new Purchase
            {
                Id = NextPurchaseId(),
                SupplierId = supplier.Id,
                SupplierName = supplier.Name,
                PurchaseDate = purchaseDate.Date
            };

            foreach (PurchaseItem item in items)
            {
                Medicine medicine = GetMedicineById(item.MedicineId);
                medicine.StockQuantity += item.Quantity;
                purchase.Items.Add(item);
            }

            _store.Purchases.Add(purchase);
            return purchase;
        }

        public Sale RecordSale(int customerId, List<SaleItem> items, DateTime saleDate)
        {
            if (items == null || items.Count == 0)
            {
                throw new ValidationException("A sale must contain at least one medicine.");
            }

            Customer customer = GetCustomerById(customerId);

            // Validate every line before changing any stock.
            foreach (SaleItem item in items)
            {
                if (item.Quantity <= 0)
                {
                    throw new ValidationException("Sale quantity must be greater than 0.");
                }

                Medicine medicine = GetMedicineById(item.MedicineId);

                if (medicine.IsExpired(saleDate))
                {
                    throw new ExpiredMedicineException(
                        medicine.Name + " expired on " + medicine.ExpiryDate.ToString("yyyy-MM-dd") + " and cannot be sold.");
                }

                if (item.Quantity > medicine.StockQuantity)
                {
                    throw new InsufficientStockException(
                        "Not enough stock for " + medicine.Name + ". Available: " + medicine.StockQuantity + ", requested: " + item.Quantity + ".");
                }

                item.MedicineName = medicine.Name;
                item.UnitPrice = medicine.UnitPrice;
            }

            Sale sale = new Sale
            {
                Id = NextSaleId(),
                CustomerId = customer.Id,
                CustomerName = customer.Name,
                SaleDate = saleDate.Date
            };

            foreach (SaleItem item in items)
            {
                Medicine medicine = GetMedicineById(item.MedicineId);
                medicine.StockQuantity -= item.Quantity;
                sale.Items.Add(item);
            }

            _store.Sales.Add(sale);
            return sale;
        }

        public List<Medicine> GetLowStockMedicines()
        {
            List<Medicine> results = new List<Medicine>();
            foreach (Medicine medicine in _store.Medicines)
            {
                if (medicine.IsLowStock())
                {
                    results.Add(medicine);
                }
            }
            return results;
        }

        public List<Medicine> GetExpiredMedicines(DateTime asOfDate)
        {
            List<Medicine> results = new List<Medicine>();
            foreach (Medicine medicine in _store.Medicines)
            {
                if (medicine.IsExpired(asOfDate))
                {
                    results.Add(medicine);
                }
            }
            return results;
        }

        public decimal GetTotalSalesAmount()
        {
            decimal total = 0;
            foreach (Sale sale in _store.Sales)
            {
                total += sale.TotalAmount;
            }
            return total;
        }

        public decimal GetTotalPurchaseAmount()
        {
            decimal total = 0;
            foreach (Purchase purchase in _store.Purchases)
            {
                total += purchase.TotalAmount;
            }
            return total;
        }

        private static void ValidateMedicineInput(string name, string genericName, string manufacturer, decimal unitPrice, DateTime expiryDate, int reorderLevel)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ValidationException("Medicine name is required.");
            }
            if (string.IsNullOrWhiteSpace(genericName))
            {
                throw new ValidationException("Generic name is required.");
            }
            if (string.IsNullOrWhiteSpace(manufacturer))
            {
                throw new ValidationException("Manufacturer is required.");
            }
            if (unitPrice <= 0)
            {
                throw new ValidationException("Unit price must be greater than 0.");
            }
            if (reorderLevel < 0)
            {
                throw new ValidationException("Reorder level cannot be negative.");
            }
            if (expiryDate == DateTime.MinValue)
            {
                throw new ValidationException("Expiry date is required.");
            }
        }

        private static bool Contains(string source, string term)
        {
            if (string.IsNullOrEmpty(source))
            {
                return false;
            }
            return source.ToLower().IndexOf(term) >= 0;
        }

        private static string SafeText(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "-";
            }
            return value.Trim();
        }

        private int NextMedicineId()
        {
            int maxId = 0;
            foreach (Medicine medicine in _store.Medicines)
            {
                if (medicine.Id > maxId)
                {
                    maxId = medicine.Id;
                }
            }
            return maxId + 1;
        }

        private int NextSupplierId()
        {
            int maxId = 0;
            foreach (Supplier supplier in _store.Suppliers)
            {
                if (supplier.Id > maxId)
                {
                    maxId = supplier.Id;
                }
            }
            return maxId + 1;
        }

        private int NextCustomerId()
        {
            int maxId = 0;
            foreach (Customer customer in _store.Customers)
            {
                if (customer.Id > maxId)
                {
                    maxId = customer.Id;
                }
            }
            return maxId + 1;
        }

        private int NextPurchaseId()
        {
            int maxId = 0;
            foreach (Purchase purchase in _store.Purchases)
            {
                if (purchase.Id > maxId)
                {
                    maxId = purchase.Id;
                }
            }
            return maxId + 1;
        }

        private int NextSaleId()
        {
            int maxId = 0;
            foreach (Sale sale in _store.Sales)
            {
                if (sale.Id > maxId)
                {
                    maxId = sale.Id;
                }
            }
            return maxId + 1;
        }
    }
}

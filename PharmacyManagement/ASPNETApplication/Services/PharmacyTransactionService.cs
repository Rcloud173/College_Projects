using System;
using PharmacyManagement.Web.Data;
using PharmacyManagement.Web.Models;

namespace PharmacyManagement.Web.Services
{
    public class PharmacyTransactionService
    {
        public string RecordPurchase(PharmacyDbContext db, int supplierId, int medicineId, int quantity, decimal price)
        {
            if (quantity <= 0)
            {
                return "Quantity must be greater than 0.";
            }
            if (price <= 0)
            {
                return "Purchase price must be greater than 0.";
            }

            Supplier supplier = db.Suppliers.Find(supplierId);
            if (supplier == null)
            {
                return "The selected supplier was not found.";
            }

            Medicine medicine = db.Medicines.Find(medicineId);
            if (medicine == null)
            {
                return "The selected medicine was not found.";
            }

            decimal lineTotal = quantity * price;
            int newStock = medicine.StockQuantity + quantity;

            Purchase purchase = new Purchase
            {
                SupplierId = supplier.SupplierId,
                PurchaseDate = DateTime.Today,
                TotalAmount = lineTotal,
                PurchaseItems = new System.Collections.Generic.List<PurchaseItem>
                {
                    new PurchaseItem
                    {
                        MedicineId = medicine.MedicineId,
                        Quantity = quantity,
                        Price = price,
                        Total = lineTotal
                    }
                }
            };

            medicine.StockQuantity = newStock;
            db.Purchases.Add(purchase);
            db.SaveChanges();
            return null;
        }

        public string RecordSale(PharmacyDbContext db, int customerId, int medicineId, int quantity)
        {
            if (quantity <= 0)
            {
                return "Quantity must be greater than 0.";
            }

            Customer customer = db.Customers.Find(customerId);
            if (customer == null)
            {
                return "The selected customer was not found.";
            }

            Medicine medicine = db.Medicines.Find(medicineId);
            if (medicine == null)
            {
                return "The selected medicine was not found.";
            }

            if (medicine.IsExpired)
            {
                return medicine.Name + " is expired and cannot be sold.";
            }

            if (quantity > medicine.StockQuantity)
            {
                return "Not enough stock. Available: " + medicine.StockQuantity + ", requested: " + quantity + ".";
            }

            int newStock = medicine.StockQuantity - quantity;
            if (newStock < 0)
            {
                return "The sale would make stock negative and was rejected.";
            }

            decimal lineTotal = quantity * medicine.SellingPrice;

            Sale sale = new Sale
            {
                CustomerId = customer.CustomerId,
                SaleDate = DateTime.Today,
                TotalAmount = lineTotal,
                SaleItems = new System.Collections.Generic.List<SaleItem>
                {
                    new SaleItem
                    {
                        MedicineId = medicine.MedicineId,
                        Quantity = quantity,
                        Price = medicine.SellingPrice,
                        Total = lineTotal
                    }
                }
            };

            medicine.StockQuantity = newStock;
            db.Sales.Add(sale);
            db.SaveChanges();
            return null;
        }
    }
}

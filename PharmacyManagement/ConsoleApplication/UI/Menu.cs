using System;
using System.Collections.Generic;
using PharmacyManagement.Exceptions;
using PharmacyManagement.Models;
using PharmacyManagement.Services;

namespace PharmacyManagement.UI
{
    public class Menu
    {
        private readonly PharmacyService _service;

        public Menu(PharmacyService service)
        {
            _service = service;
        }

        public void Run()
        {
            bool running = true;
            while (running)
            {
                try
                {
                    ShowMainMenu();
                    int choice = ConsoleHelper.ReadInt("Choose an option: ", 0, 6);
                    switch (choice)
                    {
                        case 1:
                            MedicineMenu();
                            break;
                        case 2:
                            SupplierMenu();
                            break;
                        case 3:
                            CustomerMenu();
                            break;
                        case 4:
                            PurchaseMenu();
                            break;
                        case 5:
                            SaleMenu();
                            break;
                        case 6:
                            ReportMenu();
                            break;
                        case 0:
                            running = false;
                            Console.WriteLine("Thank you for using Pharmacy Management System.");
                            break;
                    }
                }
                catch (PharmacyException ex)
                {
                    Console.WriteLine();
                    Console.WriteLine("Business rule: " + ex.Message);
                    ConsoleHelper.Pause();
                }
                catch (Exception ex)
                {
                    Console.WriteLine();
                    Console.WriteLine("Unexpected error: " + ex.Message);
                    Console.WriteLine("The application will continue running.");
                    ConsoleHelper.Pause();
                }
            }
        }

        private static void ShowMainMenu()
        {
            Console.Clear();
            ConsoleHelper.Title("Pharmacy Management System - Phase 1");
            Console.WriteLine("1. Medicines");
            Console.WriteLine("2. Suppliers");
            Console.WriteLine("3. Customers");
            Console.WriteLine("4. Record purchase (stock in)");
            Console.WriteLine("5. Record sale (stock out)");
            Console.WriteLine("6. Reports");
            Console.WriteLine("0. Exit");
            Console.WriteLine();
        }

        private void MedicineMenu()
        {
            bool back = false;
            while (!back)
            {
                try
                {
                ConsoleHelper.Title("Medicines");
                Console.WriteLine("1. View all medicines");
                Console.WriteLine("2. Add medicine");
                Console.WriteLine("3. Search medicine");
                Console.WriteLine("4. Update price / reorder / expiry");
                Console.WriteLine("0. Back");
                int choice = ConsoleHelper.ReadInt("Choose an option: ", 0, 4);

                switch (choice)
                {
                    case 1:
                        ViewMedicines(_service.GetAllMedicines());
                        ConsoleHelper.Pause();
                        break;
                    case 2:
                        AddMedicine();
                        break;
                    case 3:
                        SearchMedicines();
                        break;
                    case 4:
                        UpdateMedicine();
                        break;
                    case 0:
                        back = true;
                        break;
                }
                }
                catch (PharmacyException ex)
                {
                    Console.WriteLine();
                    Console.WriteLine("Business rule: " + ex.Message);
                    ConsoleHelper.Pause();
                }
            }
        }

        private void AddMedicine()
        {
            ConsoleHelper.Title("Add Medicine");
            string name = ConsoleHelper.ReadRequiredText("Name: ");
            string genericName = ConsoleHelper.ReadRequiredText("Generic name: ");
            string manufacturer = ConsoleHelper.ReadRequiredText("Manufacturer: ");
            decimal price = ConsoleHelper.ReadDecimal("Selling price: ", 0.01m);
            DateTime expiry = ConsoleHelper.ReadDate("Expiry date");
            int reorder = ConsoleHelper.ReadInt("Reorder level: ", 0, 100000);

            Medicine medicine = _service.AddMedicine(name, genericName, manufacturer, price, expiry, reorder);
            Console.WriteLine("Medicine added. ID = " + medicine.Id + ". Stock starts at 0. Use Purchase to add stock.");
            ConsoleHelper.Pause();
        }

        private void SearchMedicines()
        {
            ConsoleHelper.Title("Search Medicines");
            string keyword = ConsoleHelper.ReadRequiredText("Enter name / generic / manufacturer / ID: ");
            List<Medicine> results = _service.SearchMedicines(keyword);
            if (results.Count == 0)
            {
                Console.WriteLine("No medicines matched '" + keyword + "'.");
            }
            else
            {
                Console.WriteLine("Found " + results.Count + " medicine(s):");
                ViewMedicines(results);
            }
            ConsoleHelper.Pause();
        }

        private void UpdateMedicine()
        {
            ViewMedicines(_service.GetAllMedicines());
            int id = ConsoleHelper.ReadInt("Medicine ID to update (0 to cancel): ", 0, 100000);
            if (id == 0)
            {
                return;
            }

            Medicine current = _service.GetMedicineById(id);
            Console.WriteLine("Current: " + current);
            decimal price = ConsoleHelper.ReadDecimal("New selling price: ", 0.01m);
            int reorder = ConsoleHelper.ReadInt("New reorder level: ", 0, 100000);
            DateTime expiry = ConsoleHelper.ReadDate("New expiry date");
            _service.UpdateMedicine(id, price, reorder, expiry);
            Console.WriteLine("Medicine updated.");
            ConsoleHelper.Pause();
        }

        private void SupplierMenu()
        {
            bool back = false;
            while (!back)
            {
                try
                {
                ConsoleHelper.Title("Suppliers");
                Console.WriteLine("1. View all suppliers");
                Console.WriteLine("2. Add supplier");
                Console.WriteLine("0. Back");
                int choice = ConsoleHelper.ReadInt("Choose an option: ", 0, 2);

                switch (choice)
                {
                    case 1:
                        foreach (Supplier supplier in _service.GetAllSuppliers())
                        {
                            Console.WriteLine(supplier);
                        }
                        ConsoleHelper.Pause();
                        break;
                    case 2:
                        string name = ConsoleHelper.ReadRequiredText("Name: ");
                        string phone = ConsoleHelper.ReadOptionalText("Phone: ");
                        string address = ConsoleHelper.ReadOptionalText("Address: ");
                        Supplier added = _service.AddSupplier(name, phone, address);
                        Console.WriteLine("Supplier added. ID = " + added.Id);
                        ConsoleHelper.Pause();
                        break;
                    case 0:
                        back = true;
                        break;
                }
                }
                catch (PharmacyException ex)
                {
                    Console.WriteLine();
                    Console.WriteLine("Business rule: " + ex.Message);
                    ConsoleHelper.Pause();
                }
            }
        }

        private void CustomerMenu()
        {
            bool back = false;
            while (!back)
            {
                try
                {
                ConsoleHelper.Title("Customers");
                Console.WriteLine("1. View all customers");
                Console.WriteLine("2. Add customer");
                Console.WriteLine("0. Back");
                int choice = ConsoleHelper.ReadInt("Choose an option: ", 0, 2);

                switch (choice)
                {
                    case 1:
                        foreach (Customer customer in _service.GetAllCustomers())
                        {
                            Console.WriteLine(customer);
                        }
                        ConsoleHelper.Pause();
                        break;
                    case 2:
                        string name = ConsoleHelper.ReadRequiredText("Name: ");
                        string phone = ConsoleHelper.ReadOptionalText("Phone: ");
                        Customer added = _service.AddCustomer(name, phone);
                        Console.WriteLine("Customer added. ID = " + added.Id);
                        ConsoleHelper.Pause();
                        break;
                    case 0:
                        back = true;
                        break;
                }
                }
                catch (PharmacyException ex)
                {
                    Console.WriteLine();
                    Console.WriteLine("Business rule: " + ex.Message);
                    ConsoleHelper.Pause();
                }
            }
        }

        private void PurchaseMenu()
        {
            ConsoleHelper.Title("Record Purchase");
            Console.WriteLine("Suppliers:");
            foreach (Supplier supplier in _service.GetAllSuppliers())
            {
                Console.WriteLine(supplier);
            }

            int supplierId = ConsoleHelper.ReadInt("Supplier ID (0 to cancel): ", 0, 100000);
            if (supplierId == 0)
            {
                return;
            }

            ViewMedicines(_service.GetAllMedicines());
            List<PurchaseItem> items = new List<PurchaseItem>();

            while (true)
            {
                int medicineId = ConsoleHelper.ReadInt("Medicine ID to purchase (0 to finish): ", 0, 100000);
                if (medicineId == 0)
                {
                    break;
                }

                int quantity = ConsoleHelper.ReadInt("Quantity: ", 1, 100000);
                decimal unitCost = ConsoleHelper.ReadDecimal("Unit cost: ", 0m);
                items.Add(new PurchaseItem
                {
                    MedicineId = medicineId,
                    Quantity = quantity,
                    UnitCost = unitCost
                });
                Console.WriteLine("Item added to this purchase.");
            }

            Purchase purchase = _service.RecordPurchase(supplierId, items, DateTime.Today);
            Console.WriteLine("Purchase #" + purchase.Id + " saved. Total: " + purchase.TotalAmount.ToString("0.00"));
            Console.WriteLine("Stock has been increased for the purchased medicines.");
            ConsoleHelper.Pause();
        }

        private void SaleMenu()
        {
            ConsoleHelper.Title("Record Sale");
            Console.WriteLine("Customers:");
            foreach (Customer customer in _service.GetAllCustomers())
            {
                Console.WriteLine(customer);
            }

            int customerId = ConsoleHelper.ReadInt("Customer ID (0 to cancel): ", 0, 100000);
            if (customerId == 0)
            {
                return;
            }

            ViewMedicines(_service.GetAllMedicines());
            List<SaleItem> items = new List<SaleItem>();

            while (true)
            {
                int medicineId = ConsoleHelper.ReadInt("Medicine ID to sell (0 to finish): ", 0, 100000);
                if (medicineId == 0)
                {
                    break;
                }

                int quantity = ConsoleHelper.ReadInt("Quantity: ", 1, 100000);
                items.Add(new SaleItem
                {
                    MedicineId = medicineId,
                    Quantity = quantity
                });
                Console.WriteLine("Item added to this sale.");
            }

            Sale sale = _service.RecordSale(customerId, items, DateTime.Today);
            Console.WriteLine("Sale #" + sale.Id + " saved. Total: " + sale.TotalAmount.ToString("0.00"));
            Console.WriteLine("Stock has been decreased for the sold medicines.");
            ConsoleHelper.Pause();
        }

        private void ReportMenu()
        {
            bool back = false;
            while (!back)
            {
                try
                {
                ConsoleHelper.Title("Reports");
                Console.WriteLine("1. Low-stock medicines");
                Console.WriteLine("2. Expired medicines");
                Console.WriteLine("3. Purchase report");
                Console.WriteLine("4. Sales report");
                Console.WriteLine("0. Back");
                int choice = ConsoleHelper.ReadInt("Choose an option: ", 0, 4);

                switch (choice)
                {
                    case 1:
                        LowStockReport();
                        break;
                    case 2:
                        ExpiredReport();
                        break;
                    case 3:
                        PurchaseReport();
                        break;
                    case 4:
                        SalesReport();
                        break;
                    case 0:
                        back = true;
                        break;
                }
                }
                catch (PharmacyException ex)
                {
                    Console.WriteLine();
                    Console.WriteLine("Business rule: " + ex.Message);
                    ConsoleHelper.Pause();
                }
            }
        }

        private void LowStockReport()
        {
            ConsoleHelper.Title("Low-Stock Medicines");
            List<Medicine> medicines = _service.GetLowStockMedicines();
            if (medicines.Count == 0)
            {
                Console.WriteLine("No medicines are at or below reorder level.");
            }
            else
            {
                ViewMedicines(medicines);
            }
            ConsoleHelper.Pause();
        }

        private void ExpiredReport()
        {
            ConsoleHelper.Title("Expired Medicines");
            List<Medicine> medicines = _service.GetExpiredMedicines(DateTime.Today);
            if (medicines.Count == 0)
            {
                Console.WriteLine("No expired medicines found.");
            }
            else
            {
                ViewMedicines(medicines);
            }
            ConsoleHelper.Pause();
        }

        private void PurchaseReport()
        {
            ConsoleHelper.Title("Purchase Report");
            IList<Purchase> purchases = _service.GetAllPurchases();
            if (purchases.Count == 0)
            {
                Console.WriteLine("No purchases recorded yet.");
            }
            else
            {
                foreach (Purchase purchase in purchases)
                {
                    Console.WriteLine("Purchase #" + purchase.Id + " | " + purchase.PurchaseDate.ToString("yyyy-MM-dd") +
                                      " | Supplier: " + purchase.SupplierName + " | Total: " + purchase.TotalAmount.ToString("0.00"));
                    foreach (PurchaseItem item in purchase.Items)
                    {
                        Console.WriteLine("   - " + item.MedicineName + " x " + item.Quantity + " @ " + item.UnitCost.ToString("0.00"));
                    }
                }
                Console.WriteLine("Grand total purchases: " + _service.GetTotalPurchaseAmount().ToString("0.00"));
            }
            ConsoleHelper.Pause();
        }

        private void SalesReport()
        {
            ConsoleHelper.Title("Sales Report");
            IList<Sale> sales = _service.GetAllSales();
            if (sales.Count == 0)
            {
                Console.WriteLine("No sales recorded yet.");
            }
            else
            {
                foreach (Sale sale in sales)
                {
                    Console.WriteLine("Sale #" + sale.Id + " | " + sale.SaleDate.ToString("yyyy-MM-dd") +
                                      " | Customer: " + sale.CustomerName + " | Total: " + sale.TotalAmount.ToString("0.00"));
                    foreach (SaleItem item in sale.Items)
                    {
                        Console.WriteLine("   - " + item.MedicineName + " x " + item.Quantity + " @ " + item.UnitPrice.ToString("0.00"));
                    }
                }
                Console.WriteLine("Grand total sales: " + _service.GetTotalSalesAmount().ToString("0.00"));
            }
            ConsoleHelper.Pause();
        }

        private static void ViewMedicines(IEnumerable<Medicine> medicines)
        {
            bool any = false;
            foreach (Medicine medicine in medicines)
            {
                any = true;
                Console.WriteLine(medicine);
            }
            if (!any)
            {
                Console.WriteLine("No medicines to display.");
            }
        }
    }
}

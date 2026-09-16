using System.Collections.Generic;
using PharmacyManagement.Web.Models;

namespace PharmacyManagement.Web.ViewModels
{
    public class DashboardViewModel
    {
        public int TotalMedicines { get; set; }
        public int TotalSuppliers { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalSales { get; set; }
        public decimal TotalSalesAmount { get; set; }
        public int TotalPurchases { get; set; }
        public decimal TotalPurchaseAmount { get; set; }
        public int CurrentStock { get; set; }
        public int LowStockCount { get; set; }
        public int ExpiredCount { get; set; }

        public List<Medicine> LowStockMedicines { get; set; } = new List<Medicine>();
        public List<Sale> RecentSales { get; set; } = new List<Sale>();
        public List<Medicine> ExpiredMedicines { get; set; } = new List<Medicine>();
    }
}

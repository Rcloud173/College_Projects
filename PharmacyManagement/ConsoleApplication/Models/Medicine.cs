using System;

namespace PharmacyManagement.Models
{
    public class Medicine
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string GenericName { get; set; }
        public string Manufacturer { get; set; }
        public decimal UnitPrice { get; set; }
        public int StockQuantity { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int ReorderLevel { get; set; }

        public bool IsExpired(DateTime asOfDate)
        {
            return ExpiryDate.Date < asOfDate.Date;
        }

        public bool IsLowStock()
        {
            return StockQuantity <= ReorderLevel;
        }

        public override string ToString()
        {
            string expired = IsExpired(DateTime.Today) ? " [EXPIRED]" : string.Empty;
            return string.Format(
                "ID:{0} | {1} ({2}) | Mfr:{3} | Price:{4:0.00} | Stock:{5} | Expiry:{6:yyyy-MM-dd} | Reorder:{7}{8}",
                Id, Name, GenericName, Manufacturer, UnitPrice, StockQuantity, ExpiryDate, ReorderLevel, expired);
        }
    }
}

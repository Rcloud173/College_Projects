using System;
using System.Collections.Generic;

namespace PharmacyManagement.Models
{
    public class Purchase
    {
        public int Id { get; set; }
        public int SupplierId { get; set; }
        public string SupplierName { get; set; }
        public DateTime PurchaseDate { get; set; }
        public List<PurchaseItem> Items { get; set; }

        public Purchase()
        {
            Items = new List<PurchaseItem>();
        }

        public decimal TotalAmount
        {
            get
            {
                decimal total = 0;
                foreach (PurchaseItem item in Items)
                {
                    total += item.LineTotal;
                }
                return total;
            }
        }
    }
}

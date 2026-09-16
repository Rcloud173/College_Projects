using System;
using System.Collections.Generic;

namespace PharmacyManagement.Web.Models
{
    public class Purchase
    {
        public int PurchaseId { get; set; }
        public int SupplierId { get; set; }
        public DateTime PurchaseDate { get; set; }
        public decimal TotalAmount { get; set; }

        public Supplier Supplier { get; set; }
        public ICollection<PurchaseItem> PurchaseItems { get; set; }
    }
}

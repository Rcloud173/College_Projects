using System;
using System.Collections.Generic;

namespace PharmacyManagement.Models
{
    public class Sale
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public DateTime SaleDate { get; set; }
        public List<SaleItem> Items { get; set; }

        public Sale()
        {
            Items = new List<SaleItem>();
        }

        public decimal TotalAmount
        {
            get
            {
                decimal total = 0;
                foreach (SaleItem item in Items)
                {
                    total += item.LineTotal;
                }
                return total;
            }
        }
    }
}

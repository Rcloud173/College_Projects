using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PharmacyManagement.Web.Models
{
    public class Medicine
    {
        public int MedicineId { get; set; }

        [Required(ErrorMessage = "Medicine name is required.")]
        [StringLength(100)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Category is required.")]
        [StringLength(50)]
        public string Category { get; set; }

        [Required(ErrorMessage = "Batch number is required.")]
        [Display(Name = "Batch number")]
        [StringLength(50)]
        public string BatchNumber { get; set; }

        [Required(ErrorMessage = "Expiry date is required.")]
        [DataType(DataType.Date)]
        [Display(Name = "Expiry date")]
        public DateTime ExpiryDate { get; set; }

        [Required(ErrorMessage = "Purchase price is required.")]
        [Range(0.01, 999999, ErrorMessage = "Purchase price must be greater than 0.")]
        [Display(Name = "Purchase price")]
        public decimal PurchasePrice { get; set; }

        [Required(ErrorMessage = "Selling price is required.")]
        [Range(0.01, 999999, ErrorMessage = "Selling price must be greater than 0.")]
        [Display(Name = "Selling price")]
        public decimal SellingPrice { get; set; }

        [Required(ErrorMessage = "Stock quantity is required.")]
        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative.")]
        [Display(Name = "Stock quantity")]
        public int StockQuantity { get; set; }

        [Required(ErrorMessage = "Reorder level is required.")]
        [Range(0, int.MaxValue, ErrorMessage = "Reorder level cannot be negative.")]
        [Display(Name = "Reorder level")]
        public int ReorderLevel { get; set; }

        [Display(Name = "Supplier")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a valid supplier.")]
        public int SupplierId { get; set; }

        public Supplier Supplier { get; set; }
        public ICollection<PurchaseItem> PurchaseItems { get; set; }
        public ICollection<SaleItem> SaleItems { get; set; }

        [NotMapped]
        public bool IsExpired
        {
            get { return ExpiryDate.Date < DateTime.Today; }
        }

        [NotMapped]
        public bool IsLowStock
        {
            get { return StockQuantity <= ReorderLevel; }
        }
    }
}

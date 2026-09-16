using System.ComponentModel.DataAnnotations;

namespace PharmacyManagement.Web.ViewModels
{
    public class PurchaseFormViewModel
    {
        [Display(Name = "Supplier")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a supplier.")]
        public int SupplierId { get; set; }

        [Display(Name = "Medicine")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a medicine.")]
        public int MedicineId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }

        [Display(Name = "Purchase price")]
        [Range(0.01, 999999, ErrorMessage = "Purchase price must be greater than 0.")]
        public decimal Price { get; set; }
    }
}

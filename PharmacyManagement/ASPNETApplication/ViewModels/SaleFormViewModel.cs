using System.ComponentModel.DataAnnotations;

namespace PharmacyManagement.Web.ViewModels
{
    public class SaleFormViewModel
    {
        [Display(Name = "Customer")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a customer.")]
        public int CustomerId { get; set; }

        [Display(Name = "Medicine")]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a medicine.")]
        public int MedicineId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public int Quantity { get; set; }
    }
}

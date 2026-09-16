using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PharmacyManagement.Web.Models
{
    public class Customer
    {
        public int CustomerId { get; set; }

        [Required(ErrorMessage = "Customer name is required.")]
        [StringLength(100)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Phone is required.")]
        [StringLength(20)]
        [RegularExpression(@"^-$|^[0-9+\-() ]{6,20}$", ErrorMessage = "Enter a valid phone number.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [StringLength(100)]
        [RegularExpression(@"^-$|^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Enter a valid email address.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Address is required.")]
        [StringLength(200)]
        public string Address { get; set; }

        public ICollection<Sale> Sales { get; set; }
    }
}

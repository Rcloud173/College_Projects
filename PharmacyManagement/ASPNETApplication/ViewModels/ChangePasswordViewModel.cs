using System.ComponentModel.DataAnnotations;

namespace PharmacyManagement.Web.ViewModels
{
    public class ChangePasswordViewModel
    {
        [Required(ErrorMessage = "Current password is required.")]
        [DataType(DataType.Password)]
        [Display(Name = "Current password")]
        public string CurrentPassword { get; set; }

        [Required(ErrorMessage = "New password cannot be empty.")]
        [DataType(DataType.Password)]
        [Display(Name = "New password")]
        public string NewPassword { get; set; }

        [Required(ErrorMessage = "Please confirm the new password.")]
        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "New password and confirmation do not match.")]
        [Display(Name = "Confirm new password")]
        public string ConfirmPassword { get; set; }
    }
}

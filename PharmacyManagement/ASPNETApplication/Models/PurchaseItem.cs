namespace PharmacyManagement.Web.Models
{
    public class PurchaseItem
    {
        public int PurchaseItemId { get; set; }
        public int PurchaseId { get; set; }
        public int MedicineId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }

        public Purchase Purchase { get; set; }
        public Medicine Medicine { get; set; }
    }
}

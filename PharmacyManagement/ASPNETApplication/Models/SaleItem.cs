namespace PharmacyManagement.Web.Models
{
    public class SaleItem
    {
        public int SaleItemId { get; set; }
        public int SaleId { get; set; }
        public int MedicineId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }

        public Sale Sale { get; set; }
        public Medicine Medicine { get; set; }
    }
}

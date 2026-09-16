namespace PharmacyManagement.Models
{
    public class PurchaseItem
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }

        public decimal LineTotal
        {
            get { return Quantity * UnitCost; }
        }
    }
}

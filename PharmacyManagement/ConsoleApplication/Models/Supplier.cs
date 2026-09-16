namespace PharmacyManagement.Models
{
    public class Supplier
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }

        public override string ToString()
        {
            return string.Format("ID:{0} | {1} | Phone:{2} | {3}", Id, Name, Phone, Address);
        }
    }
}

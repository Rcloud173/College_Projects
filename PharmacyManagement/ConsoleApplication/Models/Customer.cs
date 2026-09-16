namespace PharmacyManagement.Models
{
    public class Customer
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }

        public override string ToString()
        {
            return string.Format("ID:{0} | {1} | Phone:{2}", Id, Name, Phone);
        }
    }
}

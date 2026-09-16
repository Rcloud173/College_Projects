using PharmacyManagement.Data;
using PharmacyManagement.Services;
using PharmacyManagement.UI;

namespace PharmacyManagement
{
    internal static class Program
    {
        private static void Main()
        {
            InMemoryStore store = new InMemoryStore();
            SampleData.Load(store);

            PharmacyService service = new PharmacyService(store);
            Menu menu = new Menu(service);
            menu.Run();
        }
    }
}

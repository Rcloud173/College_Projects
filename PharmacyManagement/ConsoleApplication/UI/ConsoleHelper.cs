using System;

namespace PharmacyManagement.UI
{
    public static class ConsoleHelper
    {
        public static void Title(string text)
        {
            Console.WriteLine();
            Console.WriteLine("========================================");
            Console.WriteLine(" " + text);
            Console.WriteLine("========================================");
        }

        public static void Pause()
        {
            Console.WriteLine();
            Console.Write("Press Enter to continue...");
            Console.ReadLine();
        }

        public static string ReadRequiredText(string prompt)
        {
            while (true)
            {
                Console.Write(prompt);
                string value = Console.ReadLine();
                if (!string.IsNullOrWhiteSpace(value))
                {
                    return value.Trim();
                }
                Console.WriteLine("This field cannot be empty. Try again.");
            }
        }

        public static string ReadOptionalText(string prompt)
        {
            Console.Write(prompt);
            string value = Console.ReadLine();
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }
            return value.Trim();
        }

        public static int ReadInt(string prompt, int minValue, int maxValue)
        {
            while (true)
            {
                Console.Write(prompt);
                string input = Console.ReadLine();
                int value;
                if (int.TryParse(input, out value) && value >= minValue && value <= maxValue)
                {
                    return value;
                }
                Console.WriteLine("Please enter a whole number between " + minValue + " and " + maxValue + ".");
            }
        }

        public static decimal ReadDecimal(string prompt, decimal minValue)
        {
            while (true)
            {
                Console.Write(prompt);
                string input = Console.ReadLine();
                decimal value;
                if (decimal.TryParse(input, out value) && value >= minValue)
                {
                    return value;
                }
                Console.WriteLine("Please enter a valid amount that is at least " + minValue.ToString("0.00") + ".");
            }
        }

        public static DateTime ReadDate(string prompt)
        {
            while (true)
            {
                Console.Write(prompt + " (yyyy-MM-dd): ");
                string input = Console.ReadLine();
                DateTime value;
                if (DateTime.TryParse(input, out value))
                {
                    return value.Date;
                }
                Console.WriteLine("Invalid date. Example: 2027-06-30");
            }
        }
    }
}

using System;

namespace PharmacyManagement.Exceptions
{
    public class PharmacyException : Exception
    {
        public PharmacyException(string message) : base(message)
        {
        }
    }

    public class EntityNotFoundException : PharmacyException
    {
        public EntityNotFoundException(string message) : base(message)
        {
        }
    }

    public class InsufficientStockException : PharmacyException
    {
        public InsufficientStockException(string message) : base(message)
        {
        }
    }

    public class ExpiredMedicineException : PharmacyException
    {
        public ExpiredMedicineException(string message) : base(message)
        {
        }
    }

    public class ValidationException : PharmacyException
    {
        public ValidationException(string message) : base(message)
        {
        }
    }
}

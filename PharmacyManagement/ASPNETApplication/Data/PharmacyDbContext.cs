using System;
using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Web.Models;

namespace PharmacyManagement.Web.Data
{
    public class PharmacyDbContext : DbContext
    {
        public PharmacyDbContext(DbContextOptions<PharmacyDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<Purchase> Purchases { get; set; }
        public DbSet<PurchaseItem> PurchaseItems { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserId);
                entity.Property(u => u.Username).IsRequired().HasMaxLength(50);
                entity.Property(u => u.Password).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Role).IsRequired().HasMaxLength(20);
            });

            modelBuilder.Entity<Supplier>(entity =>
            {
                entity.HasKey(s => s.SupplierId);
                entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
                entity.Property(s => s.Phone).HasMaxLength(20);
                entity.Property(s => s.Email).HasMaxLength(100);
                entity.Property(s => s.Address).HasMaxLength(200);
            });

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(c => c.CustomerId);
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Phone).HasMaxLength(20);
                entity.Property(c => c.Email).HasMaxLength(100);
                entity.Property(c => c.Address).HasMaxLength(200);
            });

            modelBuilder.Entity<Medicine>(entity =>
            {
                entity.HasKey(m => m.MedicineId);
                entity.Property(m => m.Name).IsRequired().HasMaxLength(100);
                entity.Property(m => m.Category).IsRequired().HasMaxLength(50);
                entity.Property(m => m.BatchNumber).IsRequired().HasMaxLength(50);
                entity.Property(m => m.PurchasePrice).HasPrecision(18, 2);
                entity.Property(m => m.SellingPrice).HasPrecision(18, 2);

                entity.HasOne(m => m.Supplier)
                    .WithMany(s => s.Medicines)
                    .HasForeignKey(m => m.SupplierId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Purchase>(entity =>
            {
                entity.HasKey(p => p.PurchaseId);
                entity.Property(p => p.TotalAmount).HasPrecision(18, 2);

                entity.HasOne(p => p.Supplier)
                    .WithMany(s => s.Purchases)
                    .HasForeignKey(p => p.SupplierId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PurchaseItem>(entity =>
            {
                entity.HasKey(i => i.PurchaseItemId);
                entity.Property(i => i.Price).HasPrecision(18, 2);
                entity.Property(i => i.Total).HasPrecision(18, 2);

                entity.HasOne(i => i.Purchase)
                    .WithMany(p => p.PurchaseItems)
                    .HasForeignKey(i => i.PurchaseId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(i => i.Medicine)
                    .WithMany(m => m.PurchaseItems)
                    .HasForeignKey(i => i.MedicineId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Sale>(entity =>
            {
                entity.HasKey(s => s.SaleId);
                entity.Property(s => s.TotalAmount).HasPrecision(18, 2);

                entity.HasOne(s => s.Customer)
                    .WithMany(c => c.Sales)
                    .HasForeignKey(s => s.CustomerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<SaleItem>(entity =>
            {
                entity.HasKey(i => i.SaleItemId);
                entity.Property(i => i.Price).HasPrecision(18, 2);
                entity.Property(i => i.Total).HasPrecision(18, 2);

                entity.HasOne(i => i.Sale)
                    .WithMany(s => s.SaleItems)
                    .HasForeignKey(i => i.SaleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(i => i.Medicine)
                    .WithMany(m => m.SaleItems)
                    .HasForeignKey(i => i.MedicineId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            SeedData(modelBuilder);
        }

        private static void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Supplier>().HasData(
                new Supplier
                {
                    SupplierId = 1,
                    Name = "MedLife Distributors",
                    Phone = "9876543210",
                    Email = "sales@medlife.example",
                    Address = "12 Market Road, City"
                },
                new Supplier
                {
                    SupplierId = 2,
                    Name = "HealthPlus Wholesale",
                    Phone = "9123456780",
                    Email = "orders@healthplus.example",
                    Address = "45 Industrial Area"
                },
                new Supplier
                {
                    SupplierId = 3,
                    Name = "CareWell Pharma",
                    Phone = "9988776655",
                    Email = "info@carewell.example",
                    Address = "8 Hospital Lane"
                });

            modelBuilder.Entity<Customer>().HasData(
                new Customer
                {
                    CustomerId = 1,
                    Name = "Walk-in Customer",
                    Phone = "-",
                    Email = "-",
                    Address = "-"
                },
                new Customer
                {
                    CustomerId = 2,
                    Name = "Anita Sharma",
                    Phone = "9001112233",
                    Email = "anita@example.com",
                    Address = "21 Park Street"
                },
                new Customer
                {
                    CustomerId = 3,
                    Name = "Rahul Mehta",
                    Phone = "9002223344",
                    Email = "rahul@example.com",
                    Address = "7 Lake View"
                });

            modelBuilder.Entity<Medicine>().HasData(
                new Medicine
                {
                    MedicineId = 1,
                    Name = "Paracetamol 500mg",
                    Category = "Tablet",
                    BatchNumber = "PCM500-A1",
                    ExpiryDate = new DateTime(2027, 6, 30),
                    PurchasePrice = 8.00m,
                    SellingPrice = 12.50m,
                    StockQuantity = 80,
                    ReorderLevel = 20,
                    SupplierId = 1
                },
                new Medicine
                {
                    MedicineId = 2,
                    Name = "Amoxicillin 250mg",
                    Category = "Capsule",
                    BatchNumber = "AMX250-B2",
                    ExpiryDate = new DateTime(2027, 3, 15),
                    PurchasePrice = 30.00m,
                    SellingPrice = 45.00m,
                    StockQuantity = 15,
                    ReorderLevel = 20,
                    SupplierId = 2
                },
                new Medicine
                {
                    MedicineId = 3,
                    Name = "Cetirizine 10mg",
                    Category = "Tablet",
                    BatchNumber = "CTZ10-C3",
                    ExpiryDate = new DateTime(2027, 1, 10),
                    PurchasePrice = 10.00m,
                    SellingPrice = 18.00m,
                    StockQuantity = 40,
                    ReorderLevel = 10,
                    SupplierId = 1
                },
                new Medicine
                {
                    MedicineId = 4,
                    Name = "Cough Syrup 100ml",
                    Category = "Syrup",
                    BatchNumber = "CSY100-D4",
                    ExpiryDate = new DateTime(2024, 12, 31),
                    PurchasePrice = 35.00m,
                    SellingPrice = 55.00m,
                    StockQuantity = 12,
                    ReorderLevel = 5,
                    SupplierId = 3
                },
                new Medicine
                {
                    MedicineId = 5,
                    Name = "ORS Sachet",
                    Category = "Powder",
                    BatchNumber = "ORS-E5",
                    ExpiryDate = new DateTime(2028, 8, 1),
                    PurchasePrice = 6.00m,
                    SellingPrice = 10.00m,
                    StockQuantity = 100,
                    ReorderLevel = 25,
                    SupplierId = 2
                });
        }
    }
}

# SQL Scripts

`PharmacyManagementDb.sql` creates the Phase 2 schema and seed data.

Connection string is in `ASPNETApplication/appsettings.json`:

```
Server=(localdb)\MSSQLLocalDB;Database=PharmacyManagementDb;Trusted_Connection=True;TrustServerCertificate=True
```

After SQL Server LocalDB (or SQL Express) is installed, apply the database from the `PharmacyManagement` folder:

```
dotnet ef database update --project ASPNETApplication/ASPNETApplication.csproj
```

Or run `PharmacyManagementDb.sql` in SQL Server Management Studio.

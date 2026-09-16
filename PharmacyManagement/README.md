# Pharmacy Management System

College project in **C# / .NET 8**. One Visual Studio solution contains **three independently runnable phases**. Each phase is a separate project. They are not merged into a single website.

| Phase | Project | What it is | Data |
|-------|---------|------------|------|
| 1 | `ConsoleApplication` | Menu-driven console app (OOP) | In-memory only (lost when the program exits) |
| 2 | `ASPNETApplication` | ASP.NET Core MVC + SQL Server | Entity Framework Core + LocalDB |
| 3 | `PWA` | Installable Progressive Web App | Demo medicines in the browser (IndexedDB / localStorage). **Not** connected to SQL Server |

**Rule of the architecture:** run **one** startup project at a time. Phase 1 does not use SQL. Phase 3 does not call Phase 2.

Solution file: `PharmacyManagement.sln`

---

## Requirements

- [.NET SDK 8](https://dotnet.microsoft.com/download) (or Visual Studio 2022 / 2025 with the ASP.NET workload)
- **Phase 2 only:** SQL Server LocalDB (`(localdb)\MSSQLLocalDB`) or SQL Server Express
- **Phase 3 only:** a modern browser (Chrome / Edge) for install, offline, and notifications

If the lab machine uses .NET 6, change `TargetFramework` from `net8.0` to `net6.0` in each `.csproj` (and use matching EF Core 6 packages for Phase 2).

---

## How to run

### Visual Studio

1. Open `PharmacyManagement/PharmacyManagement.sln`.
2. In Solution Explorer, right-click **one** project (`ConsoleApplication`, `ASPNETApplication`, or `PWA`).
3. **Set as Startup Project**.
4. Press **F5**.

### Command line

From the `PharmacyManagement` folder:

```bash
dotnet run --project ConsoleApplication/ConsoleApplication.csproj
dotnet run --project ASPNETApplication/ASPNETApplication.csproj
dotnet run --project PWA/PWA.csproj
```

| App | URL |
|-----|-----|
| Phase 2 MVC | http://localhost:5080 |
| Phase 3 PWA | http://localhost:5081 |

Build everything:

```bash
dotnet build PharmacyManagement.sln
```

---

## Folder structure

```
PharmacyManagement/
├── PharmacyManagement.sln
├── README.md
├── ConsoleApplication/          Phase 1
├── ASPNETApplication/           Phase 2
├── PWA/                         Phase 3 (wwwroot = HTML/CSS/JS, service worker, manifest)
├── Database/
│   ├── SQLScripts/              PharmacyManagementDb.sql
│   └── ERDiagram/
└── Documentation/
    ├── SRS/
    ├── PPT/
    └── FinalReport/
```

---

## Shared business rules

Implemented in Phase 1 (`PharmacyService`) and Phase 2 (`PharmacyTransactionService` + model validation):

- New medicines start with **stock 0**. Stock increases when a **purchase** is recorded.
- Stock decreases when a **sale** is recorded.
- A sale **cannot exceed** available stock.
- **Expired** medicines cannot be sold.
- Purchase and sale are saved as a header plus line items in **one** database transaction (Phase 2).
- Search / reports for low stock and expiry.

Phase 3 **displays** in-stock, low-stock, out-of-stock, and expired **sample** rows. It does not record purchases or sales.

---

## Phase 1 — Console (OOP)

Menu-driven console application. Data lives in `InMemoryStore` for the current process only.

### Features

- Medicines, suppliers, customers (add / view / search)
- Record purchase (stock in) and sale (stock out)
- Reports: low stock, expired, sales, purchases
- Invalid keyboard input is rejected without crashing

### Code map

| Path | Role |
|------|------|
| `Models/` | Medicine, Supplier, Customer, Purchase, PurchaseItem, Sale, SaleItem |
| `Services/PharmacyService.cs` | Business rules |
| `Data/InMemoryStore.cs` | Lists in RAM |
| `Data/SampleData.cs` | Demo records loaded at start |
| `UI/Menu.cs` | Menus |
| `UI/ConsoleHelper.cs` | Safe input |
| `Exceptions/` | Stock / expiry / validation errors |

### Sample data (loaded on start)

| ID | Medicine | Notes |
|----|----------|--------|
| 1 | Paracetamol 500mg | Normal stock |
| 2 | Amoxicillin 250mg | Low stock (15, reorder 20) |
| 3 | Cetirizine 10mg | Normal stock |
| 4 | Old Cough Syrup | Already expired — sale must be rejected |

### Suggested viva demo

1. Medicines → View all, then search `paracetamol`.
2. Reports → Low-stock (Amoxicillin) and Expired (Old Cough Syrup).
3. Sales → sell 5 of medicine 1 (success). Try to sell medicine 4 (blocked).
4. Sales → quantity larger than stock (blocked).
5. Purchases → buy medicine 2 and confirm stock increased.
6. Reports → sales and purchases.

---

## Phase 2 — ASP.NET Core MVC + SQL Server

Full web CRUD with cookie authentication and EF Core 8.

Default login (created only if the `Users` table is empty and the database is reachable):

- Username: `admin`
- Password: `admin123`

Change the password from **Account → Change password** after first login.

### Features

- Cookie login / logout; pages require sign-in
- Medicines, suppliers, customers (CRUD)
- Purchases and sales (stock in / stock out, no oversell, no expired sales)
- Dashboard (counts, totals, low stock, expired)
- Reports: inventory, low stock, expired, sales, purchases (with a simple print button)

### Database setup

Connection string (`ASPNETApplication/appsettings.json`):

```
Server=(localdb)\MSSQLLocalDB;Database=PharmacyManagementDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True
```

Apply schema (from the `PharmacyManagement` folder):

```bash
dotnet ef database update --project ASPNETApplication/ASPNETApplication.csproj
```

Or run `Database/SQLScripts/PharmacyManagementDb.sql` in SQL Server Management Studio.

If LocalDB is missing, Phase 2 still **builds**, but login and data pages fail until SQL Server is available.

### Code map

| Path | Role |
|------|------|
| `Program.cs` | MVC, cookie auth, EF Core, admin seeder |
| `Data/PharmacyDbContext.cs` | DbSets and relationships |
| `Data/Migrations/` | `InitialCreate` |
| `Data/UserSeeder.cs` | First admin user |
| `Helpers/PasswordHelper.cs` | Password hashing |
| `Services/PharmacyTransactionService.cs` | Atomic purchase / sale |
| `Controllers/` | Account, Home, Medicines, Suppliers, Customers, Purchases, Sales, Reports |
| `Views/` | Razor pages |
| `wwwroot/css/site.css` | Site styling |

---

## Phase 3 — PWA

Static files hosted by a small ASP.NET host (`UseDefaultFiles` + `UseStaticFiles`). **Demo data only** — not live SQL.

Open http://localhost:5081

### Features

- Installable app: `manifest.json`, icons, service worker (`sw.js`)
- Pages: Home, Medicines, Quick Search, Stock, Notifications (Alerts), Dashboard, Offline fallback
- Search by name and category; empty-result message
- Stock labels: IN STOCK, LOW STOCK, OUT OF STOCK, EXPIRED
- Offline: shell is cached; search uses IndexedDB with localStorage fallback; Online / Offline banners
- Local Notification API for low-stock and expiry (no push server). If permission is denied, the lists on the Alerts page still work
- Responsive layout for desktop, tablet, and mobile (no extra UI framework)

### Sample medicines (PWA)

| Medicine | Status (typical) |
|----------|------------------|
| Paracetamol 500mg | IN STOCK |
| Amoxicillin 250mg | LOW STOCK |
| Cetirizine 10mg | IN STOCK |
| Cough Syrup 100ml | EXPIRED |
| ORS Sachet | OUT OF STOCK |

### Install and offline (Chrome / Edge)

1. Run the PWA project and open http://localhost:5081
2. Use the browser **Install** icon, or **Install App** when the prompt appears
3. Search once while online (this caches medicines)
4. DevTools → Network → **Offline**, then refresh
5. The app shell and cached search still load; the banner shows offline mode
6. Go back online; the banner returns to online mode

`beforeinstallprompt` is Chrome/Edge behaviour. Some embedded browsers do not show the install button even though the manifest and service worker are valid.

### Code map

| Path | Role |
|------|------|
| `wwwroot/index.html` and other HTML pages | UI |
| `wwwroot/css/site.css` | Responsive layout |
| `wwwroot/js/app.js` | Service worker register, install button, offline banner |
| `wwwroot/js/medicines-data.js` | Demo list + stock status |
| `wwwroot/js/medicine-store.js` | IndexedDB + localStorage |
| `wwwroot/js/search.js` | Search / filter / banners |
| `wwwroot/js/notifications.js` | Permission + alert lists |
| `wwwroot/sw.js` | Cache-first application shell |
| `wwwroot/manifest.json` | PWA name, icons, standalone display |

---

## How the three phases relate (for viva)

- **Phase 1** proves OOP, menus, and business rules without a database.
- **Phase 2** is the real pharmacy system: authentication, SQL persistence, CRUD, purchases, sales, dashboard, reports.
- **Phase 3** is a **separate** installable client for quick lookup and alerts using **sample** data, including offline use.

They share the same *domain idea* (medicines, stock, expiry). They do **not** share a runtime or a live API.

---

## Documentation folders

Place college artefacts here (SRS, slides, final report, ER diagram). The folders currently hold placeholders.

---

## Known limits (by design)

- Phase 1 data is not saved after exit.
- Phase 2 needs SQL Server / LocalDB on the machine that runs it.
- Phase 3 is not wired to Phase 2 or SQL Server.
- Phase 3 notifications are local browser notifications, not a push service.
- Default `admin` / `admin123` is for demonstration only.

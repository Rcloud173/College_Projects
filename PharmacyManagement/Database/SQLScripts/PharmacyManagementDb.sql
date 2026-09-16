IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE TABLE [Customers] (
        [CustomerId] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Phone] nvarchar(20) NULL,
        [Email] nvarchar(100) NULL,
        [Address] nvarchar(200) NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([CustomerId])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE TABLE [Suppliers] (
        [SupplierId] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Phone] nvarchar(20) NULL,
        [Email] nvarchar(100) NULL,
        [Address] nvarchar(200) NULL,
        CONSTRAINT [PK_Suppliers] PRIMARY KEY ([SupplierId])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [UserId] int NOT NULL IDENTITY,
        [Username] nvarchar(50) NOT NULL,
        [Password] nvarchar(100) NOT NULL,
        [Role] nvarchar(20) NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([UserId])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE TABLE [Sales] (
        [SaleId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [SaleDate] datetime2 NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_Sales] PRIMARY KEY ([SaleId]),
        CONSTRAINT [FK_Sales_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE TABLE [Medicines] (
        [MedicineId] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Category] nvarchar(50) NOT NULL,
        [BatchNumber] nvarchar(50) NOT NULL,
        [ExpiryDate] datetime2 NOT NULL,
        [PurchasePrice] decimal(18,2) NOT NULL,
        [SellingPrice] decimal(18,2) NOT NULL,
        [StockQuantity] int NOT NULL,
        [ReorderLevel] int NOT NULL,
        [SupplierId] int NOT NULL,
        CONSTRAINT [PK_Medicines] PRIMARY KEY ([MedicineId]),
        CONSTRAINT [FK_Medicines_Suppliers_SupplierId] FOREIGN KEY ([SupplierId]) REFERENCES [Suppliers] ([SupplierId]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE TABLE [Purchases] (
        [PurchaseId] int NOT NULL IDENTITY,
        [SupplierId] int NOT NULL,
        [PurchaseDate] datetime2 NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_Purchases] PRIMARY KEY ([PurchaseId]),
        CONSTRAINT [FK_Purchases_Suppliers_SupplierId] FOREIGN KEY ([SupplierId]) REFERENCES [Suppliers] ([SupplierId]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE TABLE [SaleItems] (
        [SaleItemId] int NOT NULL IDENTITY,
        [SaleId] int NOT NULL,
        [MedicineId] int NOT NULL,
        [Quantity] int NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [Total] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_SaleItems] PRIMARY KEY ([SaleItemId]),
        CONSTRAINT [FK_SaleItems_Medicines_MedicineId] FOREIGN KEY ([MedicineId]) REFERENCES [Medicines] ([MedicineId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_SaleItems_Sales_SaleId] FOREIGN KEY ([SaleId]) REFERENCES [Sales] ([SaleId]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE TABLE [PurchaseItems] (
        [PurchaseItemId] int NOT NULL IDENTITY,
        [PurchaseId] int NOT NULL,
        [MedicineId] int NOT NULL,
        [Quantity] int NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [Total] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_PurchaseItems] PRIMARY KEY ([PurchaseItemId]),
        CONSTRAINT [FK_PurchaseItems_Medicines_MedicineId] FOREIGN KEY ([MedicineId]) REFERENCES [Medicines] ([MedicineId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_PurchaseItems_Purchases_PurchaseId] FOREIGN KEY ([PurchaseId]) REFERENCES [Purchases] ([PurchaseId]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'CustomerId', N'Address', N'Email', N'Name', N'Phone') AND [object_id] = OBJECT_ID(N'[Customers]'))
        SET IDENTITY_INSERT [Customers] ON;
    EXEC(N'INSERT INTO [Customers] ([CustomerId], [Address], [Email], [Name], [Phone])
    VALUES (1, N''-'', N''-'', N''Walk-in Customer'', N''-''),
    (2, N''21 Park Street'', N''anita@example.com'', N''Anita Sharma'', N''9001112233''),
    (3, N''7 Lake View'', N''rahul@example.com'', N''Rahul Mehta'', N''9002223344'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'CustomerId', N'Address', N'Email', N'Name', N'Phone') AND [object_id] = OBJECT_ID(N'[Customers]'))
        SET IDENTITY_INSERT [Customers] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'SupplierId', N'Address', N'Email', N'Name', N'Phone') AND [object_id] = OBJECT_ID(N'[Suppliers]'))
        SET IDENTITY_INSERT [Suppliers] ON;
    EXEC(N'INSERT INTO [Suppliers] ([SupplierId], [Address], [Email], [Name], [Phone])
    VALUES (1, N''12 Market Road, City'', N''sales@medlife.example'', N''MedLife Distributors'', N''9876543210''),
    (2, N''45 Industrial Area'', N''orders@healthplus.example'', N''HealthPlus Wholesale'', N''9123456780''),
    (3, N''8 Hospital Lane'', N''info@carewell.example'', N''CareWell Pharma'', N''9988776655'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'SupplierId', N'Address', N'Email', N'Name', N'Phone') AND [object_id] = OBJECT_ID(N'[Suppliers]'))
        SET IDENTITY_INSERT [Suppliers] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'MedicineId', N'BatchNumber', N'Category', N'ExpiryDate', N'Name', N'PurchasePrice', N'ReorderLevel', N'SellingPrice', N'StockQuantity', N'SupplierId') AND [object_id] = OBJECT_ID(N'[Medicines]'))
        SET IDENTITY_INSERT [Medicines] ON;
    EXEC(N'INSERT INTO [Medicines] ([MedicineId], [BatchNumber], [Category], [ExpiryDate], [Name], [PurchasePrice], [ReorderLevel], [SellingPrice], [StockQuantity], [SupplierId])
    VALUES (1, N''PCM500-A1'', N''Tablet'', ''2027-06-30T00:00:00.0000000'', N''Paracetamol 500mg'', 8.0, 20, 12.5, 80, 1),
    (2, N''AMX250-B2'', N''Capsule'', ''2027-03-15T00:00:00.0000000'', N''Amoxicillin 250mg'', 30.0, 20, 45.0, 15, 2),
    (3, N''CTZ10-C3'', N''Tablet'', ''2027-01-10T00:00:00.0000000'', N''Cetirizine 10mg'', 10.0, 10, 18.0, 40, 1),
    (4, N''CSY100-D4'', N''Syrup'', ''2024-12-31T00:00:00.0000000'', N''Cough Syrup 100ml'', 35.0, 5, 55.0, 12, 3),
    (5, N''ORS-E5'', N''Powder'', ''2028-08-01T00:00:00.0000000'', N''ORS Sachet'', 6.0, 25, 10.0, 100, 2)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'MedicineId', N'BatchNumber', N'Category', N'ExpiryDate', N'Name', N'PurchasePrice', N'ReorderLevel', N'SellingPrice', N'StockQuantity', N'SupplierId') AND [object_id] = OBJECT_ID(N'[Medicines]'))
        SET IDENTITY_INSERT [Medicines] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Medicines_SupplierId] ON [Medicines] ([SupplierId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_PurchaseItems_MedicineId] ON [PurchaseItems] ([MedicineId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_PurchaseItems_PurchaseId] ON [PurchaseItems] ([PurchaseId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Purchases_SupplierId] ON [Purchases] ([SupplierId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SaleItems_MedicineId] ON [SaleItems] ([MedicineId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SaleItems_SaleId] ON [SaleItems] ([SaleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Sales_CustomerId] ON [Sales] ([CustomerId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916163454_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260916163454_InitialCreate', N'8.0.11');
END;
GO

COMMIT;
GO


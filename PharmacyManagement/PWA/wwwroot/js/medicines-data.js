var DEMO_MEDICINES = [
    {
        name: "Paracetamol 500mg",
        category: "Tablet",
        batchNumber: "PCM500-A1",
        stockQuantity: 80,
        reorderLevel: 20,
        sellingPrice: 12.50,
        expiryDate: "2027-06-30"
    },
    {
        name: "Amoxicillin 250mg",
        category: "Capsule",
        batchNumber: "AMX250-B2",
        stockQuantity: 15,
        reorderLevel: 20,
        sellingPrice: 45.00,
        expiryDate: "2027-03-15"
    },
    {
        name: "Cetirizine 10mg",
        category: "Tablet",
        batchNumber: "CTZ10-C3",
        stockQuantity: 40,
        reorderLevel: 10,
        sellingPrice: 18.00,
        expiryDate: "2027-01-10"
    },
    {
        name: "Cough Syrup 100ml",
        category: "Syrup",
        batchNumber: "CSY100-D4",
        stockQuantity: 12,
        reorderLevel: 5,
        sellingPrice: 55.00,
        expiryDate: "2024-12-31"
    },
    {
        name: "ORS Sachet",
        category: "Powder",
        batchNumber: "ORS-E5",
        stockQuantity: 0,
        reorderLevel: 25,
        sellingPrice: 10.00,
        expiryDate: "2028-08-01"
    }
];

function getStockStatus(medicine) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var expiry = new Date(medicine.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
        return "EXPIRED";
    }
    if (medicine.stockQuantity <= 0) {
        return "OUT OF STOCK";
    }
    if (medicine.stockQuantity <= medicine.reorderLevel) {
        return "LOW STOCK";
    }
    return "IN STOCK";
}

function statusClass(status) {
    if (status === "EXPIRED") {
        return "status-expired";
    }
    if (status === "OUT OF STOCK") {
        return "status-out";
    }
    if (status === "LOW STOCK") {
        return "status-low";
    }
    return "status-ok";
}

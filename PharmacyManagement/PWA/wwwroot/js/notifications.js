function daysUntilExpiry(medicine) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var expiry = new Date(medicine.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return Math.round((expiry - today) / (24 * 60 * 60 * 1000));
}

function isLowStockMedicine(medicine) {
    return medicine.stockQuantity <= medicine.reorderLevel;
}

function isExpiryReminder(medicine) {
    return daysUntilExpiry(medicine) <= 180;
}

function buildPharmacyAlerts() {
    var lowStock = [];
    var expiry = [];

    for (var i = 0; i < DEMO_MEDICINES.length; i++) {
        var medicine = DEMO_MEDICINES[i];
        if (isLowStockMedicine(medicine)) {
            lowStock.push({
                title: "Low Stock Alert",
                body: medicine.name + " has only " + medicine.stockQuantity + " units remaining."
            });
        }
        if (isExpiryReminder(medicine)) {
            var days = daysUntilExpiry(medicine);
            var body = days < 0
                ? medicine.name + " has expired."
                : medicine.name + " is approaching its expiry date.";
            expiry.push({
                title: "Expiry Reminder",
                body: body
            });
        }
    }

    return { lowStock: lowStock, expiry: expiry };
}

function permissionLabel() {
    if (!("Notification" in window)) {
        return "Not supported by this browser";
    }
    if (Notification.permission === "granted") {
        return "Enabled";
    }
    if (Notification.permission === "denied") {
        return "Disabled (blocked by the browser)";
    }
    return "Not enabled yet";
}

function updatePermissionUi() {
    var status = document.getElementById("permission-status");
    var message = document.getElementById("permission-message");
    var button = document.getElementById("enable-notifications");

    status.textContent = permissionLabel();

    if (!("Notification" in window)) {
        message.textContent = "This browser does not support notifications. The alert lists below still work.";
        button.disabled = true;
        return;
    }

    if (Notification.permission === "denied") {
        message.textContent = "Notifications are disabled. The application still works normally.";
        button.disabled = true;
        return;
    }

    message.textContent = "";
    button.disabled = false;
    button.textContent = Notification.permission === "granted"
        ? "Show browser alerts"
        : "Enable Notifications";
}

function renderAlertList(elementId, alerts, emptyText) {
    var list = document.getElementById(elementId);
    list.innerHTML = "";
    if (alerts.length === 0) {
        var empty = document.createElement("li");
        empty.textContent = emptyText;
        list.appendChild(empty);
        return;
    }

    for (var i = 0; i < alerts.length; i++) {
        var item = document.createElement("li");
        item.innerHTML = "<strong>" + alerts[i].title + ":</strong> " + alerts[i].body;
        list.appendChild(item);
    }
}

function showPageAlerts() {
    var alerts = buildPharmacyAlerts();
    renderAlertList("low-stock-alerts", alerts.lowStock, "No low-stock medicines.");
    renderAlertList("expiry-alerts", alerts.expiry, "No expiry reminders.");
}

function sendBrowserNotifications() {
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }

    var alerts = buildPharmacyAlerts();
    var all = alerts.lowStock.concat(alerts.expiry);
    for (var i = 0; i < all.length; i++) {
        new Notification(all[i].title, {
            body: all[i].body,
            icon: "/icons/icon-192.png"
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updatePermissionUi();
    showPageAlerts();

    document.getElementById("enable-notifications").addEventListener("click", function () {
        if (!("Notification" in window)) {
            updatePermissionUi();
            return;
        }

        if (Notification.permission === "granted") {
            sendBrowserNotifications();
            return;
        }

        if (Notification.permission === "denied") {
            updatePermissionUi();
            return;
        }

        Notification.requestPermission().then(function (result) {
            updatePermissionUi();
            if (result === "granted") {
                sendBrowserNotifications();
            }
        });
    });
});

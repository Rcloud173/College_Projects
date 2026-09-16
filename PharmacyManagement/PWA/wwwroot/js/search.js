var availableMedicines = [];

function medicineMatches(medicine, nameQuery, categoryFilter) {
    var nameOk = true;
    var categoryOk = true;

    if (nameQuery) {
        nameOk = medicine.name.toLowerCase().indexOf(nameQuery) >= 0;
    }

    if (categoryFilter) {
        categoryOk = medicine.category.toLowerCase() === categoryFilter.toLowerCase();
    }

    return nameOk && categoryOk;
}

function setDataModeBanner(isOffline) {
    var banner = document.getElementById("cache-mode-banner");
    if (!banner) {
        return;
    }

    banner.classList.add("show");
    if (isOffline) {
        banner.className = "offline-banner show";
        banner.textContent = "Offline Mode — Showing cached medicine data";
    } else {
        banner.className = "online-banner show";
        banner.textContent = "Online — Showing current data";
    }
}

function renderMedicines(list) {
    var tableBody = document.getElementById("table-body");
    var cards = document.getElementById("cards");
    var empty = document.getElementById("empty");

    tableBody.innerHTML = "";
    cards.innerHTML = "";

    if (list.length === 0) {
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";

    for (var i = 0; i < list.length; i++) {
        var medicine = list[i];
        var status = getStockStatus(medicine);
        var css = statusClass(status);
        var price = Number(medicine.sellingPrice).toFixed(2);

        var row = document.createElement("tr");
        row.innerHTML =
            "<td>" + medicine.name + "</td>" +
            "<td>" + medicine.category + "</td>" +
            "<td>" + medicine.batchNumber + "</td>" +
            "<td>" + medicine.stockQuantity + "</td>" +
            "<td>" + price + "</td>" +
            "<td>" + medicine.expiryDate + "</td>" +
            "<td><span class=\"status-badge " + css + "\">" + status + "</span></td>";
        tableBody.appendChild(row);

        var card = document.createElement("div");
        card.className = "medicine-card";
        card.innerHTML =
            "<h2>" + medicine.name + "</h2>" +
            "<p><strong>Category:</strong> " + medicine.category + "</p>" +
            "<p><strong>Batch:</strong> " + medicine.batchNumber + "</p>" +
            "<p><strong>Stock:</strong> " + medicine.stockQuantity + "</p>" +
            "<p><strong>Price:</strong> " + price + "</p>" +
            "<p><strong>Expiry:</strong> " + medicine.expiryDate + "</p>" +
            "<p><span class=\"status-badge " + css + "\">" + status + "</span></p>";
        cards.appendChild(card);
    }
}

function applySearch() {
    var nameQuery = document.getElementById("name-search").value.trim().toLowerCase();
    var categoryFilter = document.getElementById("category-filter").value;
    var results = [];

    for (var i = 0; i < availableMedicines.length; i++) {
        if (medicineMatches(availableMedicines[i], nameQuery, categoryFilter)) {
            results.push(availableMedicines[i]);
        }
    }

    renderMedicines(results);
}

function fillCategories() {
    var select = document.getElementById("category-filter");
    var current = select.value;
    select.innerHTML = "";
    var allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All categories";
    select.appendChild(allOption);

    var seen = {};
    for (var i = 0; i < availableMedicines.length; i++) {
        var category = availableMedicines[i].category;
        if (!seen[category]) {
            seen[category] = true;
            var option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        }
    }

    select.value = current;
}

function useMedicineList(list, isOffline) {
    availableMedicines = list || [];
    setDataModeBanner(isOffline);
    fillCategories();
    applySearch();
}

function loadMedicineData() {
    if (navigator.onLine) {
        saveCachedMedicines(DEMO_MEDICINES).then(function () {
            useMedicineList(DEMO_MEDICINES, false);
        });
        return;
    }

    loadCachedMedicines().then(function (cached) {
        if (cached && cached.length > 0) {
            useMedicineList(cached, true);
        } else {
            useMedicineList(DEMO_MEDICINES, true);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("name-search").addEventListener("input", applySearch);
    document.getElementById("category-filter").addEventListener("change", applySearch);
    loadMedicineData();
});

window.addEventListener("online", loadMedicineData);
window.addEventListener("offline", loadMedicineData);

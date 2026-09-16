var MEDICINE_DB_NAME = "PharmacyPwaDb";
var MEDICINE_STORE = "medicines";
var MEDICINE_LS_KEY = "cachedMedicines";

function openMedicineDb() {
    return new Promise(function (resolve, reject) {
        if (!window.indexedDB) {
            reject(new Error("IndexedDB is not available."));
            return;
        }

        var request = indexedDB.open(MEDICINE_DB_NAME, 1);
        request.onupgradeneeded = function () {
            var db = request.result;
            if (!db.objectStoreNames.contains(MEDICINE_STORE)) {
                db.createObjectStore(MEDICINE_STORE, { keyPath: "name" });
            }
        };
        request.onsuccess = function () {
            resolve(request.result);
        };
        request.onerror = function () {
            reject(request.error);
        };
    });
}

function saveCachedMedicines(list) {
    try {
        localStorage.setItem(MEDICINE_LS_KEY, JSON.stringify(list));
    } catch (error) {
        console.log("localStorage save failed.", error);
    }

    return openMedicineDb().then(function (db) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(MEDICINE_STORE, "readwrite");
            var store = tx.objectStore(MEDICINE_STORE);
            store.clear();
            for (var i = 0; i < list.length; i++) {
                store.put(list[i]);
            }
            tx.oncomplete = function () {
                resolve();
            };
            tx.onerror = function () {
                reject(tx.error);
            };
        });
    }).catch(function () {
        return Promise.resolve();
    });
}

function loadCachedMedicines() {
    return openMedicineDb().then(function (db) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(MEDICINE_STORE, "readonly");
            var request = tx.objectStore(MEDICINE_STORE).getAll();
            request.onsuccess = function () {
                resolve(request.result || []);
            };
            request.onerror = function () {
                reject(request.error);
            };
        });
    }).catch(function () {
        try {
            var raw = localStorage.getItem(MEDICINE_LS_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (error) {
            console.log("localStorage read failed.", error);
        }
        return [];
    });
}

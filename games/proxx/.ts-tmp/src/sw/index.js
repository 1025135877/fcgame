import { __awaiter, __generator, __read, __spread } from "tslib";
import version from "consts:version";
import resourceList from "resource-list:";
var staticCache = "static-" + version;
var expectedCaches = [staticCache];
self.addEventListener("install", function (event) {
    var resourcesToCache = resourceList.filter(function (item) {
        return item !== "sw.js" &&
            item !== "bootstrap.js" &&
            item !== "_headers" &&
            !item.includes("manifest-") &&
            !item.includes("icon-") &&
            !item.includes("assetlinks-") &&
            !item.includes("social-");
    });
    var toCache = __spread(["/"], resourcesToCache);
    event.waitUntil((function () {
        return __awaiter(this, void 0, void 0, function () {
            var cache;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, caches.open(staticCache)];
                    case 1:
                        cache = _a.sent();
                        return [4 /*yield*/, cache.addAll(toCache)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    })());
});
self.addEventListener("activate", function (event) {
    self.clients.claim();
    event.waitUntil((function () {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, caches.keys()];
                    case 1:
                        promises = (_a.sent()).map(function (cacheName) {
                            if (!expectedCaches.includes(cacheName)) {
                                return caches.delete(cacheName);
                            }
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    })());
});
self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") {
        return;
    }
    event.respondWith((function () {
        return __awaiter(this, void 0, void 0, function () {
            var cachedResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, caches.match(event.request, {
                            ignoreSearch: true
                        })];
                    case 1:
                        cachedResponse = _a.sent();
                        return [2 /*return*/, cachedResponse || fetch(event.request)];
                }
            });
        });
    })());
});
self.addEventListener("message", function (event) {
    switch (event.data) {
        case "skip-waiting":
            self.skipWaiting();
            break;
    }
});
//# sourceMappingURL=index.js.map
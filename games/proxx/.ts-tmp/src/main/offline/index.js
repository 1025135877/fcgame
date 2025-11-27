import { __awaiter, __generator } from "tslib";
import { noCache } from "../utils/constants";
/** Tell the service worker to skip waiting. Resolves once the controller has changed. */
export function skipWaiting() {
    return __awaiter(this, void 0, void 0, function () {
        var reg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.serviceWorker.getRegistration()];
                case 1:
                    reg = _a.sent();
                    if (!reg || !reg.waiting) {
                        return [2 /*return*/];
                    }
                    reg.waiting.postMessage("skip-waiting");
                    return [2 /*return*/, new Promise(function (resolve) {
                            navigator.serviceWorker.addEventListener("controllerchange", function () { return resolve(); }, { once: true });
                        })];
            }
        });
    });
}
/** Is there currently a waiting worker? */
export var updateReady = false;
/** Wait for an installing worker */
function installingWorker(reg) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (reg.installing) {
                return [2 /*return*/, reg.installing];
            }
            return [2 /*return*/, new Promise(function (resolve) {
                    reg.addEventListener("updatefound", function () { return resolve(reg.installing); }, {
                        once: true
                    });
                })];
        });
    });
}
function watchForUpdate() {
    return __awaiter(this, void 0, void 0, function () {
        var hasController, reg, installing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hasController = !!navigator.serviceWorker.controller;
                    // If we don't have a controller, we don't need to check for updates – we've just loaded from the
                    // network.
                    if (!hasController) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, navigator.serviceWorker.getRegistration()];
                case 1:
                    reg = _a.sent();
                    // Service worker not registered yet.
                    if (!reg) {
                        return [2 /*return*/];
                    }
                    // Look for updates
                    if (reg.waiting) {
                        updateReady = true;
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, installingWorker(reg)];
                case 2:
                    installing = _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) {
                            installing.addEventListener("statechange", function () {
                                if (installing.state === "installed") {
                                    resolve();
                                }
                            });
                        })];
                case 3:
                    _a.sent();
                    updateReady = true;
                    return [2 /*return*/];
            }
        });
    });
}
/** Set up the service worker and monitor changes */
export function init() {
    return __awaiter(this, void 0, void 0, function () {
        var reg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!noCache) return [3 /*break*/, 4];
                    return [4 /*yield*/, navigator.serviceWorker.getRegistration()];
                case 1:
                    reg = _a.sent();
                    if (!reg) return [3 /*break*/, 3];
                    return [4 /*yield*/, reg.unregister()];
                case 2:
                    _a.sent();
                    location.reload();
                    _a.label = 3;
                case 3: return [2 /*return*/];
                case 4: return [4 /*yield*/, navigator.serviceWorker.register("/sw.js")];
                case 5:
                    _a.sent();
                    watchForUpdate();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=index.js.map
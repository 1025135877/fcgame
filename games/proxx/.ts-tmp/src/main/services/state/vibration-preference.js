import { __awaiter, __generator } from "tslib";
import { get, set } from "idb-keyval";
export var supportsVibration = "vibrate" in navigator;
/**
 * Set vibration preference (true means will vibrate)
 *
 * @param vibrate
 */
export function setVibrationPreference(vibrate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, set("vibrate", vibrate)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function getVibrationPreference() {
    return __awaiter(this, void 0, void 0, function () {
        var vibrate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get("vibrate")];
                case 1:
                    vibrate = _a.sent();
                    if (typeof vibrate === "boolean") {
                        return [2 /*return*/, vibrate];
                    }
                    // if no value is assigned to "vibrate", return default value
                    return [2 /*return*/, supportsVibration];
            }
        });
    });
}
//# sourceMappingURL=vibration-preference.js.map
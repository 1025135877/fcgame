import { __awaiter, __generator } from "tslib";
import { get, set } from "idb-keyval";
import { supportsSufficientWebGL } from "src/main/rendering/renderer";
import { forceMotionMode } from "../../utils/constants";
import { isFeaturePhone } from "../../utils/static-display";
var DEFAULT = !matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
/**
 * Set motion preference (true means animation is ON)
 *
 * @param motion
 */
export function setMotionPreference(motion) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, set("motion", motion)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function getMotionPreference() {
    return __awaiter(this, void 0, void 0, function () {
        var motion;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get("motion")];
                case 1:
                    motion = _a.sent();
                    if (typeof motion === "boolean") {
                        return [2 /*return*/, motion];
                    }
                    // if no value is assigned to "motion", return default value
                    return [2 /*return*/, DEFAULT];
            }
        });
    });
}
export function shouldUseMotion() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Whenever `motion` query flag is set, it is honoured regardless of device or user preference
            if (forceMotionMode !== undefined) {
                return [2 /*return*/, forceMotionMode];
            }
            if (!supportsSufficientWebGL || isFeaturePhone) {
                return [2 /*return*/, false];
            }
            return [2 /*return*/, getMotionPreference()];
        });
    });
}
//# sourceMappingURL=motion-preference.js.map
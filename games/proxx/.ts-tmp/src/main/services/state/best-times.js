import { __awaiter, __generator, __read } from "tslib";
import { get, set } from "idb-keyval";
function getKey(width, height, mines) {
    // Order width and height, because a 90 degree rotated board is the same thing in terms of
    // difficulty.
    var _a = __read([width, height].sort(function (a, b) { return a - b; }), 2), size1 = _a[0], size2 = _a[1];
    return "hs:" + size1 + ":" + size2 + ":" + mines;
}
/**
 * Submit a time. Returns the best time (which will equal `time` if it's a new best time)
 *
 * @param width
 * @param height
 * @param mines
 * @param time
 */
export function submitTime(width, height, mines, time) {
    return __awaiter(this, void 0, void 0, function () {
        var key, previousBest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    key = getKey(width, height, mines);
                    return [4 /*yield*/, get(key)];
                case 1:
                    previousBest = _a.sent();
                    if (typeof previousBest === "number" && time > previousBest) {
                        return [2 /*return*/, previousBest];
                    }
                    // This is technically racy if someone finishes two games at the same time, but… who?
                    set(key, time);
                    return [2 /*return*/, time];
            }
        });
    });
}
/** Get best time for a given board */
export function getBest(width, height, mines) {
    var key = getKey(width, height, mines);
    return get(key);
}
// Trigger Persistent Storage while we are at it.
// Firefox shows an ugly permission prompt that doesn't really make sense to users, so… nahhhh.
if (navigator.storage &&
    navigator.storage.persist &&
    !navigator.userAgent.includes("Firefox/")) {
    navigator.storage.persist();
}
//# sourceMappingURL=best-times.js.map
import { __awaiter, __generator } from "tslib";
/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import prerender from "consts:prerender";
import { get, set } from "idb-keyval";
import { presets } from "./grid-presets";
// WARNING: This module is part of the main bundle. Avoid adding to it if possible.
var key = "default-game";
export function setGridDefault(width, height, mines) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, set(key, { width: width, height: height, mines: mines })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
export function getGridDefault() {
    return __awaiter(this, void 0, void 0, function () {
        var gridDefault;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // The prerenderer doesn't have IndexedDB
                    if (prerender) {
                        return [2 /*return*/, presets.easy];
                    }
                    return [4 /*yield*/, get(key)];
                case 1:
                    gridDefault = _a.sent();
                    if (!gridDefault) {
                        return [2 /*return*/, presets.easy];
                    }
                    return [2 /*return*/, gridDefault];
            }
        });
    });
}
//# sourceMappingURL=grid-default.js.map
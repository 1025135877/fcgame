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
import { __awaiter, __generator } from "tslib";
import { getCellSizes } from "src/main/utils/cell-sizing";
import { idleAnimationNumFrames, spriteSize } from "./constants";
import { cacheTextureGenerator } from "./texture-cache";
import { idleAnimationTextureGeneratorFactory, staticTextureGeneratorFactory } from "./texture-generators";
// Calls and unsets the `done` callback if available.
export function processDoneCallback(animation) {
    if (!animation.done) {
        return;
    }
    animation.done();
    delete animation.done;
}
export var textureTileSize = null;
export var idleAnimationTextureDrawer = null;
export var idleSprites = null;
export var staticTextureDrawer = null;
export var staticSprites = null;
export function lazyGenerateTextures() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, cellPadding, cellSize, textureSize, uncachedIATG, uncachedSTG;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = getCellSizes(), cellPadding = _a.cellPadding, cellSize = _a.cellSize;
                    textureSize = cellSize + 2 * cellPadding;
                    textureTileSize = textureSize;
                    uncachedIATG = idleAnimationTextureGeneratorFactory(textureSize, cellPadding, idleAnimationNumFrames);
                    return [4 /*yield*/, cacheTextureGenerator("idle", uncachedIATG, textureSize, idleAnimationNumFrames, {
                            maxWidth: spriteSize,
                            maxHeight: spriteSize
                        })];
                case 1:
                    (_b = _d.sent(), idleAnimationTextureDrawer = _b.drawer, idleSprites = _b.caches);
                    uncachedSTG = staticTextureGeneratorFactory(textureSize, cellPadding);
                    return [4 /*yield*/, cacheTextureGenerator("static", uncachedSTG, textureSize, 14 /* LAST_MARKER */, { maxWidth: spriteSize, maxHeight: spriteSize })];
                case 2:
                    (_c = _d.sent(), staticTextureDrawer = _c.drawer, staticSprites = _c.caches);
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=animation.js.map
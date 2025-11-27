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
import { __assign, __awaiter, __generator } from "tslib";
import version from "consts:version";
import { del, get, set } from "idb-keyval";
import { noCache } from "src/main/utils/constants";
import { task } from "../../utils/scheduling";
import { staticDevicePixelRatio } from "../utils/static-display";
var defaultSizeConstraints = {
    // Allegedly, Chrome, Firefox and Safari have a maximum canvas size of 32k
    // pixels. We are *definitely* below that, but for some reason the draws to
    // the sprite sheet just seem to stop happening at higher indices when
    // tileSize is big (due to high dPR for exampe). The maxWidth of 8192 has been
    // determined by trial and error and seems to be safe.
    maxWidth: 8192,
    maxHeight: 32768
};
var TEXTURE_CACHE_IDB_PREFIX = "texturecache";
// Wraps an existing TextureGenerator and caches the generated
// frames in an img.
export function cacheTextureGenerator(name, drawTexture, textureSize, numFrames, constraints) {
    if (constraints === void 0) { constraints = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var fullConstraints, maxFramesPerRow, maxRowsPerSprite, maxFramesPerSprite, buffers, prefix, expectedVersion, cachedTextureVersion, caches, _loop_1, i, drawer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fullConstraints = __assign(__assign({}, defaultSizeConstraints), constraints);
                    maxFramesPerRow = Math.floor(fullConstraints.maxWidth / (textureSize * staticDevicePixelRatio));
                    maxRowsPerSprite = Math.floor(fullConstraints.maxHeight / (textureSize * staticDevicePixelRatio));
                    maxFramesPerSprite = maxFramesPerRow * maxRowsPerSprite;
                    prefix = TEXTURE_CACHE_IDB_PREFIX + ":" + name;
                    expectedVersion = version + ":" + textureSize + ":" + staticDevicePixelRatio;
                    return [4 /*yield*/, get(prefix + ":version")];
                case 1:
                    cachedTextureVersion = _a.sent();
                    if (!(cachedTextureVersion !== expectedVersion || noCache)) return [3 /*break*/, 7];
                    return [4 /*yield*/, del(prefix + ":version")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, del(prefix + ":buffers")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, createBuffers(drawTexture, textureSize, numFrames, fullConstraints)];
                case 4:
                    buffers = _a.sent();
                    return [4 /*yield*/, set(prefix + ":version", expectedVersion)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, set(prefix + ":buffers", buffers)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, get(prefix + ":buffers")];
                case 8:
                    buffers = _a.sent();
                    _a.label = 9;
                case 9:
                    caches = new Array(buffers.length);
                    _loop_1 = function (i) {
                        var image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    image = new Image();
                                    image.src = URL.createObjectURL(new Blob([buffers[i]], { type: "image/png" }));
                                    return [4 /*yield*/, new Promise(function (r) { return (image.onload = r); })];
                                case 1:
                                    _a.sent();
                                    caches[i] = image;
                                    return [4 /*yield*/, task()];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 10;
                case 10:
                    if (!(i < buffers.length)) return [3 /*break*/, 13];
                    return [5 /*yield**/, _loop_1(i)];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    i++;
                    return [3 /*break*/, 10];
                case 13:
                    drawer = function (idx, targetCtx, cellSize) {
                        idx = Math.floor(idx % numFrames);
                        var sprite = Math.floor(idx / maxFramesPerSprite);
                        var idxInSprite = idx % maxFramesPerSprite;
                        var xIndex = idxInSprite % maxFramesPerRow;
                        var yIndex = Math.floor(idxInSprite / maxFramesPerRow);
                        var img = caches[sprite];
                        var x = xIndex * textureSize;
                        var y = yIndex * textureSize;
                        targetCtx.drawImage(img, x * staticDevicePixelRatio, y * staticDevicePixelRatio, textureSize * staticDevicePixelRatio, textureSize * staticDevicePixelRatio, 0, 0, cellSize, cellSize);
                    };
                    return [2 /*return*/, { drawer: drawer, caches: caches }];
            }
        });
    });
}
function createBuffers(drawTexture, textureSize, numFrames, constraints) {
    return __awaiter(this, void 0, void 0, function () {
        var maxWidth, maxHeight, maxFramesPerRow, maxRowsPerSprite, maxFramesPerSprite, numSprites, buffers, _loop_2, spriteIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    maxWidth = constraints.maxWidth, maxHeight = constraints.maxHeight;
                    maxFramesPerRow = Math.floor(maxWidth / (textureSize * staticDevicePixelRatio));
                    maxRowsPerSprite = Math.floor(maxHeight / (textureSize * staticDevicePixelRatio));
                    maxFramesPerSprite = maxFramesPerRow * maxRowsPerSprite;
                    numSprites = Math.ceil(numFrames / maxFramesPerSprite);
                    buffers = [];
                    _loop_2 = function (spriteIndex) {
                        var framesLeftToCache, width, height, canvas, ctx, indexInSprite, frame, xIndex, yIndex, x, y, blob, buffer;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    framesLeftToCache = numFrames - spriteIndex * maxFramesPerSprite;
                                    width = maxWidth;
                                    height = maxHeight;
                                    canvas = document.createElement("canvas");
                                    canvas.width = width;
                                    canvas.height = height;
                                    ctx = canvas.getContext("2d");
                                    if (!ctx) {
                                        throw Error("Could not instantiate 2D rendering context");
                                    }
                                    ctx.scale(staticDevicePixelRatio, staticDevicePixelRatio);
                                    indexInSprite = 0;
                                    _a.label = 1;
                                case 1:
                                    if (!(indexInSprite < framesLeftToCache && indexInSprite < maxFramesPerSprite)) return [3 /*break*/, 4];
                                    frame = spriteIndex * maxFramesPerSprite + indexInSprite;
                                    xIndex = indexInSprite % maxFramesPerRow;
                                    yIndex = Math.floor(indexInSprite / maxFramesPerRow);
                                    x = xIndex * textureSize;
                                    y = yIndex * textureSize;
                                    ctx.save();
                                    ctx.translate(x, y);
                                    drawTexture(frame, ctx);
                                    ctx.restore();
                                    // Await a task to give the main thread a chance to breathe.
                                    return [4 /*yield*/, task()];
                                case 2:
                                    // Await a task to give the main thread a chance to breathe.
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    indexInSprite++;
                                    return [3 /*break*/, 1];
                                case 4: return [4 /*yield*/, new Promise(function (r) {
                                        return canvas.toBlob(r, "image/png");
                                    })];
                                case 5:
                                    blob = _a.sent();
                                    return [4 /*yield*/, new Response(blob).arrayBuffer()];
                                case 6:
                                    buffer = _a.sent();
                                    buffers.push(buffer);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    spriteIndex = 0;
                    _a.label = 1;
                case 1:
                    if (!(spriteIndex < numSprites)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_2(spriteIndex)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    spriteIndex++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, buffers];
            }
        });
    });
}
//# sourceMappingURL=texture-cache.js.map
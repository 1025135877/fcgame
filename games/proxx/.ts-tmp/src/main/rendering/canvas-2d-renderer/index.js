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
import { __values } from "tslib";
import { getCanvas } from "src/main/utils/canvas-pool";
import { getBarHeights, getCellSizes } from "src/main/utils/cell-sizing";
import { staticDevicePixelRatio } from "src/main/utils/static-display";
import { idleAnimationTextureDrawer, processDoneCallback, staticTextureDrawer } from "../animation";
import { easeInOutCubic, easeOutQuad, remap } from "../animation-helpers";
import { fadedLinesAlpha, fadeInAnimationLength, fadeOutAnimationLength, flashInAnimationLength, flashOutAnimationLength, idleAnimationLength, idleAnimationNumFrames, revealedAlpha, turquoise } from "../constants";
import { getTime } from "../time-provider";
var Canvas2DRenderer = /** @class */ (function () {
    function Canvas2DRenderer() {
        this._grid = [];
        this._lastFocus = [-1, -1];
    }
    Object.defineProperty(Canvas2DRenderer.prototype, "numTiles", {
        get: function () {
            return this._numTilesX * this._numTilesY;
        },
        enumerable: false,
        configurable: true
    });
    Canvas2DRenderer.prototype.createCanvas = function () {
        this._canvas = getCanvas("2d");
        this._ctx = this._canvas.getContext("2d");
        if (!this._ctx) {
            throw Error("Could not instantiate 2D renderer");
        }
        return this._canvas;
    };
    Canvas2DRenderer.prototype.init = function (numTilesX, numTilesY) {
        this._numTilesX = numTilesX;
        this._numTilesY = numTilesY;
        this._updateTileSize();
        this._initGrid();
        this.onResize();
    };
    Canvas2DRenderer.prototype.updateFirstRect = function (rect) {
        this._firstCellRect = rect;
        this._rerender();
    };
    Canvas2DRenderer.prototype.stop = function () {
        // Nothing to do here
    };
    Canvas2DRenderer.prototype.onResize = function () {
        if (!this._canvas) {
            return;
        }
        this._updateTileSize();
        this._canvasRect = this._canvas.getBoundingClientRect();
        this._canvas.width = this._canvasRect.width * staticDevicePixelRatio;
        this._canvas.height = this._canvasRect.height * staticDevicePixelRatio;
        this._prepareGradients();
        this._rerender();
    };
    Canvas2DRenderer.prototype.beforeUpdate = function () {
        // Nothing to do here
    };
    Canvas2DRenderer.prototype.afterUpdate = function () {
        this._rerender();
    };
    Canvas2DRenderer.prototype.beforeCell = function (x, y, cell, animationList, ts) {
        var gridCell = this._grid[y * this._numTilesX + x];
        gridCell.animationList = animationList.slice();
        gridCell.cell = cell;
    };
    Canvas2DRenderer.prototype.afterCell = function (x, y, cell, animationList, ts) {
        this._maybeRenderFocusRing(x, y);
    };
    Canvas2DRenderer.prototype.render = function (x, y, cell, animation, ts) {
        // Nothing to do here, ironically.
        // With the 2D renderer, we render the entire field after the entire chunk
        // has been ingested and call _renderCell for each cell.
    };
    Canvas2DRenderer.prototype.setFocus = function (x, y) {
        this._lastFocus = [x, y];
        this._rerender();
    };
    Canvas2DRenderer.prototype._renderCell = function (x, y, cell, animation, ts) {
        if (!this._isTileInView(x, y)) {
            return;
        }
        this._ctx.save();
        this._setupContextForTile(x, y);
        // @ts-ignore
        this[animation.name](x, y, cell, animation, ts);
        this._ctx.restore();
    };
    Canvas2DRenderer.prototype._updateTileSize = function () {
        var _a = getCellSizes(), cellPadding = _a.cellPadding, cellSize = _a.cellSize;
        // This does _not_ need to get multiplied by `devicePixelRatio` as we will
        // be scaling the canvas instead.
        this._tileSize = cellSize + 2 * cellPadding;
    };
    Canvas2DRenderer.prototype._initGrid = function () {
        var start = getTime();
        this._grid = new Array(this.numTiles);
        for (var y = 0; y < this._numTilesY; y++) {
            for (var x = 0; x < this._numTilesX; x++) {
                this._grid[y * this._numTilesX + x] = {
                    animationList: [
                        {
                            name: 0 /* IDLE */,
                            start: start
                        }
                    ],
                    x: x,
                    y: y
                };
            }
        }
    };
    Canvas2DRenderer.prototype._setupContextForTile = function (x, y) {
        this._ctx.scale(staticDevicePixelRatio, staticDevicePixelRatio);
        // Adjust for scroll position
        this._ctx.translate(this._firstCellRect.left, this._firstCellRect.top);
        // Put tile that is supposed to be rendered at (0, 0)
        this._ctx.translate(x * this._tileSize, y * this._tileSize);
    };
    Canvas2DRenderer.prototype._isTileInView = function (bx, by) {
        if (!this._firstCellRect) {
            return false;
        }
        var _a = this._firstCellRect, left = _a.left, top = _a.top, width = _a.width, height = _a.height;
        var x = bx * width + left;
        var y = by * height + top;
        if (x + width < 0 ||
            y + height < 0 ||
            x > this._canvasRect.width ||
            y > this._canvasRect.height) {
            return false;
        }
        return true;
    };
    Canvas2DRenderer.prototype[0 /* IDLE */] = function (x, y, cell, animation, ts) {
        var animationLength = idleAnimationLength;
        var normalized = ((ts - animation.start) / animationLength) % 1;
        var idx = Math.floor(normalized * idleAnimationNumFrames);
        var fadeInNormalized = (ts - (animation.fadeStart || 0)) / fadeInAnimationLength;
        if (fadeInNormalized > 1) {
            fadeInNormalized = 1;
        }
        this._ctx.save();
        this._ctx.globalAlpha = remap(0, 1, 1, fadedLinesAlpha, easeOutQuad(fadeInNormalized));
        idleAnimationTextureDrawer(idx, this._ctx, this._tileSize);
        this._ctx.globalAlpha = 1;
        staticTextureDrawer(0 /* OUTLINE */, this._ctx, this._tileSize);
        staticTextureDrawer(12 /* INNER_CIRCLE */, this._ctx, this._tileSize);
        this._ctx.restore();
    };
    Canvas2DRenderer.prototype[6 /* FLAGGED */] = function (x, y, cell, animation, ts) {
        var animationLength = idleAnimationLength;
        var normalized = ((ts - animation.start) / animationLength) % 1;
        var idx = Math.floor(normalized * idleAnimationNumFrames);
        var fadeOutNormalized = (ts - (animation.fadeStart || 0)) / fadeOutAnimationLength;
        if (fadeOutNormalized > 1) {
            fadeOutNormalized = 1;
        }
        this._ctx.save();
        this._ctx.globalAlpha = remap(0, 1, fadedLinesAlpha, 1, easeOutQuad(fadeOutNormalized));
        idleAnimationTextureDrawer(idx, this._ctx, this._tileSize);
        this._ctx.globalAlpha = 1;
        staticTextureDrawer(0 /* OUTLINE */, this._ctx, this._tileSize);
        staticTextureDrawer(12 /* INNER_CIRCLE */, this._ctx, this._tileSize);
        staticTextureDrawer(13 /* DOT */, this._ctx, this._tileSize);
        this._ctx.restore();
    };
    Canvas2DRenderer.prototype[5 /* NUMBER */] = function (x, y, cell, animation, ts) {
        this._ctx.save();
        if (cell.touchingMines > 0) {
            staticTextureDrawer(cell.touchingMines, this._ctx, this._tileSize);
        }
        else {
            this._ctx.globalAlpha = revealedAlpha;
            staticTextureDrawer(0 /* OUTLINE */, this._ctx, this._tileSize);
        }
        this._ctx.restore();
    };
    Canvas2DRenderer.prototype[7 /* MINED */] = function (x, y, cell, animation, ts) {
        if (animation.start > ts) {
            return;
        }
        staticTextureDrawer(10 /* MINE */, this._ctx, this._tileSize);
    };
    Canvas2DRenderer.prototype[3 /* HIGHLIGHT_IN */] = function (x, y, cell, animation, ts) {
        var start = animation.fadeStart || animation.start;
        var animationLength = fadeInAnimationLength;
        var normalized = (ts - start) / animationLength;
        if (normalized < 0) {
            normalized = 0;
        }
        if (normalized > 1) {
            processDoneCallback(animation);
            normalized = 1;
        }
        this._ctx.save();
        this._ctx.globalCompositeOperation = "source-atop";
        this._ctx.globalAlpha = easeOutQuad(normalized);
        this._ctx.fillStyle = turquoise;
        this._ctx.fillRect(0, 0, this._firstCellRect.width, this._firstCellRect.height);
        this._ctx.restore();
    };
    Canvas2DRenderer.prototype[4 /* HIGHLIGHT_OUT */] = function (x, y, cell, animation, ts) {
        var start = animation.fadeStart || animation.start;
        var animationLength = fadeOutAnimationLength;
        var normalized = (ts - start) / animationLength;
        if (normalized < 0) {
            normalized = 0;
        }
        if (normalized > 1) {
            processDoneCallback(animation);
            normalized = 1;
        }
        this._ctx.save();
        this._ctx.globalCompositeOperation = "source-atop";
        this._ctx.globalAlpha = 1 - easeOutQuad(normalized);
        this._ctx.fillStyle = turquoise;
        this._ctx.fillRect(0, 0, this._firstCellRect.width, this._firstCellRect.height);
        this._ctx.restore();
    };
    Canvas2DRenderer.prototype[1 /* FLASH_IN */] = function (x, y, cell, animation, ts) {
        var animationLength = flashInAnimationLength;
        var normalized = (ts - animation.start) / animationLength;
        if (normalized < 0) {
            return;
        }
        if (normalized > 1) {
            processDoneCallback(animation);
            normalized = 1;
        }
        this._ctx.save();
        this._ctx.globalAlpha = easeOutQuad(normalized);
        staticTextureDrawer(9 /* FLASH */, this._ctx, this._tileSize);
        this._ctx.restore();
    };
    Canvas2DRenderer.prototype[2 /* FLASH_OUT */] = function (x, y, cell, animation, ts) {
        var animationLength = flashOutAnimationLength;
        var normalized = (ts - animation.start) / animationLength;
        if (normalized < 0) {
            return;
        }
        if (normalized > 1) {
            processDoneCallback(animation);
            normalized = 1;
        }
        this._ctx.save();
        this._ctx.globalAlpha = 1 - easeInOutCubic(normalized);
        staticTextureDrawer(9 /* FLASH */, this._ctx, this._tileSize);
        this._ctx.restore();
    };
    Canvas2DRenderer.prototype._rerender = function () {
        var e_1, _a;
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        for (var y = 0; y < this._numTilesY; y++) {
            for (var x = 0; x < this._numTilesX; x++) {
                var _b = this._grid[y * this._numTilesX + x], cell = _b.cell, animationList = _b.animationList;
                var ts = getTime();
                try {
                    for (var animationList_1 = (e_1 = void 0, __values(animationList)), animationList_1_1 = animationList_1.next(); !animationList_1_1.done; animationList_1_1 = animationList_1.next()) {
                        var animation = animationList_1_1.value;
                        this._renderCell(x, y, cell, animation, ts);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (animationList_1_1 && !animationList_1_1.done && (_a = animationList_1.return)) _a.call(animationList_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                this._maybeRenderFocusRing(x, y);
            }
        }
        this._drawFadeOut();
    };
    Canvas2DRenderer.prototype._drawFadeOut = function () {
        var e_2, _a;
        var ctx = this._ctx;
        ctx.save();
        ctx.scale(staticDevicePixelRatio, staticDevicePixelRatio);
        ctx.globalCompositeOperation = "destination-out";
        try {
            for (var _b = __values(this._gradients), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = _c.value, gradient = _d.gradient, rect = _d.rect;
                ctx.fillStyle = gradient;
                this._ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        ctx.restore();
    };
    Canvas2DRenderer.prototype._prepareGradients = function () {
        var ctx = this._ctx;
        ctx.save();
        ctx.scale(staticDevicePixelRatio, staticDevicePixelRatio);
        var _a = getBarHeights(), topBarHeight = _a.topBarHeight, bottomBarHeight = _a.bottomBarHeight;
        var _b = this._canvasRect, width = _b.width, height = _b.height;
        var factor = 1.3;
        var gradients = [
            // Top border gradient
            {
                start: [0, topBarHeight],
                end: [0, topBarHeight * factor],
                rect: new DOMRect(0, 0, width, topBarHeight * factor)
            },
            // Bottom border gradient
            {
                start: [width, height - bottomBarHeight],
                end: [width, height - bottomBarHeight * factor],
                rect: new DOMRect(0, height - bottomBarHeight * factor, width, bottomBarHeight * factor)
            }
        ];
        this._gradients = gradients.map(function (_a) {
            var start = _a.start, end = _a.end, rect = _a.rect;
            var gradient = ctx.createLinearGradient(start[0], start[1], end[0], end[1]);
            // Implement the same opacity ramp as we have in the WebGL shader.
            var numStops = 10;
            for (var i = 0; i < numStops; i++) {
                var f = i / (numStops - 1);
                gradient.addColorStop(f, "rgba(255, 255, 255, " + (1 - easeInOutCubic(f)) + ")");
            }
            return { gradient: gradient, rect: rect };
        });
        ctx.restore();
    };
    Canvas2DRenderer.prototype._rerenderCell = function (x, y, _a) {
        var e_3, _b;
        var _c = (_a === void 0 ? {} : _a).clear, clear = _c === void 0 ? false : _c;
        if (clear) {
            this._ctx.save();
            this._setupContextForTile(x, y);
            this._ctx.clearRect(0, 0, this._tileSize, this._tileSize);
            this._ctx.restore();
        }
        var _d = this._grid[y * this._numTilesX + x], cell = _d.cell, animationList = _d.animationList;
        var ts = getTime();
        try {
            for (var animationList_2 = __values(animationList), animationList_2_1 = animationList_2.next(); !animationList_2_1.done; animationList_2_1 = animationList_2.next()) {
                var animation = animationList_2_1.value;
                this._renderCell(x, y, cell, animation, ts);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (animationList_2_1 && !animationList_2_1.done && (_b = animationList_2.return)) _b.call(animationList_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        this._maybeRenderFocusRing(x, y);
    };
    Canvas2DRenderer.prototype._maybeRenderFocusRing = function (x, y) {
        if (this._lastFocus[0] !== x || this._lastFocus[1] !== y) {
            return;
        }
        this._ctx.save();
        this._setupContextForTile(x, y);
        staticTextureDrawer(11 /* FOCUS */, this._ctx, this._tileSize);
        this._ctx.restore();
    };
    return Canvas2DRenderer;
}());
export default Canvas2DRenderer;
//# sourceMappingURL=index.js.map
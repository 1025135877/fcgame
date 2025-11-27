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
import { __decorate, __read, __spread, __values } from "tslib";
import { bind } from "src/utils/bind";
import { removeAnimations } from "../animation-helpers";
import { rippleSpeed } from "../constants";
import { getTime, unfreeze } from "../time-provider";
var MotionAnimator = /** @class */ (function () {
    function MotionAnimator(_numTilesX, _numTilesY, _renderer) {
        this._numTilesX = _numTilesX;
        this._numTilesY = _numTilesY;
        this._renderer = _renderer;
        this._renderLoopRunning = false;
        this._changeBuffer = [];
        this._lastTs = getTime();
        unfreeze();
        this._initCellDetails();
        this._startRenderLoop();
    }
    Object.defineProperty(MotionAnimator.prototype, "numTiles", {
        get: function () {
            return this._numTilesX * this._numTilesY;
        },
        enumerable: false,
        configurable: true
    });
    MotionAnimator.prototype.updateCells = function (changes) {
        var _a;
        // Queue up changes to be consumed by animation rAF
        (_a = this._changeBuffer).push.apply(_a, __spread(changes));
    };
    MotionAnimator.prototype.stop = function () {
        this._renderLoopRunning = false;
    };
    MotionAnimator.prototype._initCellDetails = function () {
        var startTime = getTime();
        var rippleFactor = rippleSpeed * Math.max(this._numTilesX, this._numTilesY);
        this._cellDetails = new Array(this.numTiles);
        for (var y = 0; y < this._numTilesY; y++) {
            for (var x = 0; x < this._numTilesX; x++) {
                this._cellDetails[y * this._numTilesX + x] = {
                    animationList: [
                        {
                            name: 0 /* IDLE */,
                            start: startTime -
                                rippleFactor +
                                distanceFromCenter(x, y, this._numTilesX, this._numTilesY) *
                                    rippleFactor
                        }
                    ],
                    hasFlashed: false,
                    x: x,
                    y: y
                };
            }
        }
    };
    MotionAnimator.prototype._updateAnimation = function (details) {
        // tslint:disable-next-line:prefer-const
        var cell = details.cell, animationList = details.animationList;
        var ts = getTime();
        if (!cell) {
            console.warn("Unknown cell");
            return;
        }
        if (!cell.revealed && !cell.flagged) {
            animationList[0].name = 0 /* IDLE */;
            animationList[0].fadeStart = ts;
            animationList = removeAnimations(animationList, [
                3 /* HIGHLIGHT_IN */,
                4 /* HIGHLIGHT_OUT */
            ]);
            animationList.push({
                name: 4 /* HIGHLIGHT_OUT */,
                start: ts,
                done: function () {
                    animationList = details.animationList;
                    animationList = removeAnimations(animationList, [
                        3 /* HIGHLIGHT_IN */,
                        4 /* HIGHLIGHT_OUT */
                    ]);
                    details.animationList = animationList;
                }
            });
        }
        else if (!cell.revealed && cell.flagged) {
            animationList[0].name = 6 /* FLAGGED */;
            animationList[0].fadeStart = ts;
            animationList.push({
                name: 3 /* HIGHLIGHT_IN */,
                start: ts
            });
        }
        else if (cell.revealed) {
            var isHighlighted = animationList.some(function (a) { return a.name === 3 /* HIGHLIGHT_IN */; });
            if (cell.touchingFlags >= cell.touchingMines &&
                cell.touchingMines > 0 &&
                !isHighlighted) {
                animationList.push({
                    name: 3 /* HIGHLIGHT_IN */,
                    start: ts
                });
            }
            else if (cell.touchingFlags < cell.touchingMines && isHighlighted) {
                animationList = removeAnimations(animationList, [
                    3 /* HIGHLIGHT_IN */,
                    4 /* HIGHLIGHT_OUT */
                ]);
                animationList.push({
                    name: 4 /* HIGHLIGHT_OUT */,
                    start: ts
                });
            }
            details.animationList = animationList;
            // This button already played the flash animation
            if (details.hasFlashed) {
                return;
            }
            animationList = removeAnimations(animationList, [0 /* IDLE */]);
            details.hasFlashed = true;
            animationList.push({
                name: 1 /* FLASH_IN */,
                start: ts,
                done: function () {
                    animationList = details.animationList;
                    animationList = removeAnimations(animationList, [
                        1 /* FLASH_IN */
                    ]);
                    details.animationList = animationList;
                }
            });
            if (cell.hasMine) {
                animationList.push({
                    name: 7 /* MINED */,
                    start: ts + 100
                });
            }
            else {
                animationList.unshift({
                    name: 5 /* NUMBER */,
                    start: ts + 100
                });
            }
            animationList.push({
                name: 2 /* FLASH_OUT */,
                start: ts + 100
            });
        }
        details.animationList = animationList;
    };
    MotionAnimator.prototype._animateTile = function (detail, ts) {
        var e_1, _a;
        try {
            for (var _b = __values(detail.animationList), _c = _b.next(); !_c.done; _c = _b.next()) {
                var animation = _c.value;
                this._renderer.render(detail.x, detail.y, detail.cell, animation, ts);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    MotionAnimator.prototype._startRenderLoop = function () {
        if (this._renderLoopRunning) {
            return;
        }
        this._renderLoopRunning = true;
        requestAnimationFrame(this._renderLoop);
    };
    MotionAnimator.prototype._consumeChangeBuffer = function (delta) {
        var e_2, _a;
        // Reveal ~5 fields per frame
        var numConsume = Math.floor((delta * 5) / 16);
        var slice = this._changeBuffer.splice(0, numConsume);
        try {
            for (var slice_1 = __values(slice), slice_1_1 = slice_1.next(); !slice_1_1.done; slice_1_1 = slice_1.next()) {
                var _b = __read(slice_1_1.value, 3), x = _b[0], y = _b[1], cellProps = _b[2];
                var detail = this._cellDetails[y * this._numTilesX + x];
                detail.cell = cellProps;
                this._updateAnimation(detail);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (slice_1_1 && !slice_1_1.done && (_a = slice_1.return)) _a.call(slice_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    MotionAnimator.prototype._renderLoop = function () {
        var e_3, _a;
        var ts = getTime();
        var delta = ts - this._lastTs;
        this._lastTs = ts;
        // Update animations according to incoming grid changes
        this._consumeChangeBuffer(delta);
        this._renderer.beforeUpdate();
        try {
            for (var _b = __values(this._cellDetails), _c = _b.next(); !_c.done; _c = _b.next()) {
                var detail = _c.value;
                this._renderer.beforeCell(detail.x, detail.y, detail.cell, detail.animationList, ts);
                this._animateTile(detail, ts);
                this._renderer.afterCell(detail.x, detail.y, detail.cell, detail.animationList, ts);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        this._renderer.afterUpdate();
        if (this._renderLoopRunning) {
            requestAnimationFrame(this._renderLoop);
        }
    };
    __decorate([
        bind
    ], MotionAnimator.prototype, "_renderLoop", null);
    return MotionAnimator;
}());
export default MotionAnimator;
function distanceFromCenter(x, y, width, height) {
    var centerX = width / 2;
    var centerY = height / 2;
    // Measure the distance from the center point of the game board
    // to the center of the field (hence the +0.5)
    var dx = x + 0.5 - centerX;
    var dy = y + 0.5 - centerY;
    // Distance of our point to origin
    return (Math.sqrt(dx * dx + dy * dy) /
        Math.sqrt(centerX * centerX + centerY * centerY));
}
//# sourceMappingURL=index.js.map
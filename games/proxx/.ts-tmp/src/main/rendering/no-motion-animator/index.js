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
import { __read, __values } from "tslib";
import { freeze, getTime } from "../time-provider";
var NoMotionAnimator = /** @class */ (function () {
    function NoMotionAnimator(_numTilesX, _numTilesY, _renderer) {
        this._numTilesX = _numTilesX;
        this._numTilesY = _numTilesY;
        this._renderer = _renderer;
        freeze();
    }
    Object.defineProperty(NoMotionAnimator.prototype, "numTiles", {
        get: function () {
            return this._numTilesX * this._numTilesY;
        },
        enumerable: false,
        configurable: true
    });
    NoMotionAnimator.prototype.updateCells = function (changes) {
        var e_1, _a;
        this._renderer.beforeUpdate();
        try {
            for (var changes_1 = __values(changes), changes_1_1 = changes_1.next(); !changes_1_1.done; changes_1_1 = changes_1.next()) {
                var _b = __read(changes_1_1.value, 3), x = _b[0], y = _b[1], cell = _b[2];
                this._renderCell(x, y, cell);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (changes_1_1 && !changes_1_1.done && (_a = changes_1.return)) _a.call(changes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this._renderer.afterUpdate();
    };
    NoMotionAnimator.prototype.stop = function () {
        // Nothing to do
    };
    NoMotionAnimator.prototype._renderCell = function (x, y, cell) {
        var e_2, _a;
        var animationList = [];
        var start = getTime();
        if (!cell.revealed && !cell.flagged) {
            animationList.push({
                name: 0 /* IDLE */,
                start: start
            });
        }
        else if (!cell.revealed && cell.flagged) {
            animationList.push({
                name: 6 /* FLAGGED */,
                fadeStart: start - 1000,
                start: start
            });
        }
        else if (cell.revealed && cell.hasMine) {
            animationList.push({
                name: 7 /* MINED */,
                start: start
            });
        }
        else {
            animationList.unshift({
                name: 5 /* NUMBER */,
                start: start
            });
        }
        if ((cell.revealed &&
            !cell.hasMine &&
            cell.touchingMines > 0 &&
            cell.touchingFlags >= cell.touchingMines) ||
            (!cell.revealed && cell.flagged)) {
            animationList.push({
                name: 3 /* HIGHLIGHT_IN */,
                fadeStart: start - 1000,
                start: start
            });
        }
        else {
            animationList.push({
                name: 4 /* HIGHLIGHT_OUT */,
                fadeStart: start - 1000,
                start: start
            });
        }
        this._renderer.beforeCell(x, y, cell, animationList, start);
        try {
            for (var animationList_1 = __values(animationList), animationList_1_1 = animationList_1.next(); !animationList_1_1.done; animationList_1_1 = animationList_1.next()) {
                var animation = animationList_1_1.value;
                this._renderer.render(x, y, cell, animation, start);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (animationList_1_1 && !animationList_1_1.done && (_a = animationList_1.return)) _a.call(animationList_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this._renderer.afterCell(x, y, cell, animationList, start);
    };
    return NoMotionAnimator;
}());
export default NoMotionAnimator;
//# sourceMappingURL=index.js.map
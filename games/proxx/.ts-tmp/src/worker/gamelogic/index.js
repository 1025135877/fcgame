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
function newCell() {
    return {
        flagged: false,
        hasMine: false,
        revealed: false,
        touchingFlags: 0,
        touchingMines: 0
    };
}
var FLUSH_GRID_CHANGE_THRESHOLD = 10;
var MinesweeperGame = /** @class */ (function () {
    function MinesweeperGame(_width, _height, _mines) {
        this._width = _width;
        this._height = _height;
        this._mines = _mines;
        this._playMode = 0 /* Pending */;
        this._toReveal = 0;
        this._flags = 0;
        this._stateChange = {};
        this._minedCells = [];
        if (_mines < 1) {
            throw Error("Invalid number of mines");
        }
        if (_width < 1 || _height < 1) {
            throw Error("Invalid dimensions");
        }
        var maxMines = _width * _height - 9;
        if (_mines > maxMines) {
            throw Error("Number of mines cannot fit in grid");
        }
        this._toReveal = _width * _height - _mines;
        this.grid = Array(_height)
            .fill(undefined)
            .map(function () {
            return Array(_width)
                .fill(undefined)
                .map(function () { return newCell(); });
        });
    }
    Object.defineProperty(MinesweeperGame.prototype, "toReveal", {
        get: function () {
            return this._toReveal;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MinesweeperGame.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MinesweeperGame.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MinesweeperGame.prototype, "mines", {
        get: function () {
            return this._mines;
        },
        enumerable: false,
        configurable: true
    });
    MinesweeperGame.prototype.subscribe = function (callback) {
        this._changeCallback = callback;
    };
    MinesweeperGame.prototype.unsubscribe = function () {
        this._changeCallback = undefined;
    };
    MinesweeperGame.prototype.reveal = function (x, y) {
        if (this._playMode === 0 /* Pending */) {
            this._placeMines(x, y);
        }
        else if (this._playMode !== 1 /* Playing */) {
            throw Error("Game is not in a playable state");
        }
        var cell = this.grid[y][x];
        if (cell.flagged) {
            throw Error("Cell flagged");
        }
        this._reveal(x, y);
        this._flushStateChange();
    };
    MinesweeperGame.prototype.setFlag = function (x, y, flagged) {
        var e_1, _a, e_2, _b;
        var cell = this.grid[y][x];
        if (cell.revealed) {
            throw Error("Revealed cell cannot be tagged");
        }
        if (cell.flagged === flagged) {
            return;
        }
        cell.flagged = flagged;
        this._pushGridChange(x, y);
        if (flagged) {
            this._setFlags(this._flags + 1);
            try {
                for (var _c = __values(this._getSurrounding(x, y)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var _e = __read(_d.value, 2), nextX = _e[0], nextY = _e[1];
                    var nextCell = this.grid[nextY][nextX];
                    nextCell.touchingFlags++;
                    // Emit this if it's just matched the number of mines
                    if (nextCell.revealed &&
                        nextCell.touchingFlags === nextCell.touchingMines) {
                        this._pushGridChange(nextX, nextY);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else {
            this._setFlags(this._flags - 1);
            try {
                for (var _f = __values(this._getSurrounding(x, y)), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var _h = __read(_g.value, 2), nextX = _h[0], nextY = _h[1];
                    var nextCell = this.grid[nextY][nextX];
                    nextCell.touchingFlags--;
                    // Emit this if it's just gone under the number of mines
                    if (nextCell.revealed &&
                        nextCell.touchingFlags === nextCell.touchingMines - 1) {
                        this._pushGridChange(nextX, nextY);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        this._flushStateChange();
    };
    /**
     * Reveal squares around the point. Returns true if successful.
     */
    MinesweeperGame.prototype.attemptSurroundingReveal = function (x, y) {
        var e_3, _a;
        var cell = this.grid[y][x];
        if (!cell.revealed ||
            cell.touchingMines === 0 ||
            cell.touchingMines > cell.touchingFlags) {
            return false;
        }
        var revealedSomething = false;
        try {
            for (var _b = __values(this._getSurrounding(x, y)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), nextX = _d[0], nextY = _d[1];
                var nextCell = this.grid[nextY][nextX];
                if (nextCell.flagged || nextCell.revealed) {
                    continue;
                }
                revealedSomething = true;
                this._reveal(nextX, nextY);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (!revealedSomething) {
            return false;
        }
        this._flushStateChange();
        return true;
    };
    MinesweeperGame.prototype._flushStateChange = function () {
        if (Object.keys(this._stateChange).length === 0) {
            return;
        }
        if (!this._changeCallback) {
            throw Error("No function present to emit with");
        }
        this._changeCallback(this._stateChange);
        this._stateChange = {};
    };
    MinesweeperGame.prototype._pushGridChange = function (x, y) {
        if (!this._stateChange.gridChanges) {
            this._stateChange.gridChanges = [];
        }
        this._stateChange.gridChanges.push([x, y, this.grid[y][x]]);
        if (this._stateChange.gridChanges.length >= FLUSH_GRID_CHANGE_THRESHOLD) {
            this._flushStateChange();
        }
    };
    MinesweeperGame.prototype._setPlayMode = function (newMode) {
        if (this._playMode === newMode) {
            return;
        }
        this._playMode = newMode;
        this._stateChange.playMode = newMode;
    };
    MinesweeperGame.prototype._setToReveal = function (newToReveal) {
        if (this._toReveal === newToReveal) {
            return;
        }
        this._toReveal = newToReveal;
        this._stateChange.toReveal = newToReveal;
    };
    MinesweeperGame.prototype._setFlags = function (newFlags) {
        if (this._flags === newFlags) {
            return;
        }
        this._flags = newFlags;
        this._stateChange.flags = newFlags;
    };
    MinesweeperGame.prototype._endGame = function (mode) {
        this._setPlayMode(mode);
    };
    MinesweeperGame.prototype._placeMines = function (avoidX, avoidY) {
        var e_4, _a, e_5, _b, e_6, _c;
        var flatCellIndexes = new Array(this._width * this._height)
            .fill(undefined)
            .map(function (_, i) { return i; });
        // Remove a 3x3 grid around the cell played.
        var indexesToRemove = [avoidY * this._width + avoidX];
        try {
            for (var _d = __values(this._getSurrounding(avoidX, avoidY)), _e = _d.next(); !_e.done; _e = _d.next()) {
                var _f = __read(_e.value, 2), nextX = _f[0], nextY = _f[1];
                indexesToRemove.push(nextY * this._width + nextX);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_4) throw e_4.error; }
        }
        indexesToRemove.sort(function (a, b) { return a - b; });
        try {
            for (var _g = __values(indexesToRemove.entries()), _h = _g.next(); !_h.done; _h = _g.next()) {
                var _j = __read(_h.value, 2), removed = _j[0], indexToRemove = _j[1];
                flatCellIndexes.splice(indexToRemove - removed, 1);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
            }
            finally { if (e_5) throw e_5.error; }
        }
        // Place mines in remaining squares
        var minesToPlace = this._mines;
        while (minesToPlace) {
            var index = flatCellIndexes.splice(Math.floor(Math.random() * flatCellIndexes.length), 1)[0];
            var x = index % this._width;
            var y = (index - x) / this._width;
            this.grid[y][x].hasMine = true;
            this._minedCells.push([x, y]);
            minesToPlace -= 1;
            try {
                for (var _k = (e_6 = void 0, __values(this._getSurrounding(x, y))), _l = _k.next(); !_l.done; _l = _k.next()) {
                    var _m = __read(_l.value, 2), nextX = _m[0], nextY = _m[1];
                    this.grid[nextY][nextX].touchingMines++;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                }
                finally { if (e_6) throw e_6.error; }
            }
        }
        this._setPlayMode(1 /* Playing */);
    };
    MinesweeperGame.prototype._getSurrounding = function (x, y) {
        var e_7, _a, e_8, _b;
        var surrounding = [];
        try {
            for (var _c = __values([y - 1, y, y + 1]), _d = _c.next(); !_d.done; _d = _c.next()) {
                var nextY = _d.value;
                if (nextY < 0) {
                    continue;
                }
                if (nextY >= this._height) {
                    continue;
                }
                try {
                    for (var _e = (e_8 = void 0, __values([x - 1, x, x + 1])), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var nextX = _f.value;
                        if (nextX < 0) {
                            continue;
                        }
                        if (nextX >= this._width) {
                            continue;
                        }
                        if (x === nextX && y === nextY) {
                            continue;
                        }
                        surrounding.push([nextX, nextY]);
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_7) throw e_7.error; }
        }
        return surrounding;
    };
    /**
     * When the user loses, reveal all the mines.
     */
    MinesweeperGame.prototype._revealAllMines = function (initialX, initialY) {
        var e_9, _a;
        // Ensure we push the clicked mine first.
        var initialCell = this.grid[initialY][initialX];
        initialCell.revealed = true;
        this._pushGridChange(initialX, initialY);
        try {
            for (var _b = __values(this._minedCells), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), x = _d[0], y = _d[1];
                var cell = this.grid[y][x];
                if (cell === initialCell) {
                    continue;
                }
                cell.revealed = true;
                this._pushGridChange(x, y);
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
    };
    /**
     * @param x
     * @param y
     */
    MinesweeperGame.prototype._reveal = function (x, y) {
        var e_10, _a, e_11, _b;
        // The set contains the cell position as if it were a single flat array.
        var revealSet = new Set([x + y * this._width]);
        try {
            for (var revealSet_1 = __values(revealSet), revealSet_1_1 = revealSet_1.next(); !revealSet_1_1.done; revealSet_1_1 = revealSet_1.next()) {
                var value = revealSet_1_1.value;
                var x_1 = value % this._width;
                var y_1 = (value - x_1) / this._width;
                var cell = this.grid[y_1][x_1];
                if (cell.revealed) {
                    throw Error("Cell already revealed");
                }
                if (cell.hasMine) {
                    this._revealAllMines(x_1, y_1);
                    this._endGame(2 /* Lost */);
                    break;
                }
                cell.revealed = true;
                this._pushGridChange(x_1, y_1);
                this._setToReveal(this._toReveal - 1);
                if (this._toReveal === 0) {
                    this._endGame(3 /* Won */);
                    break;
                }
                // Don't reveal the surrounding squares if this is touching a mine.
                if (cell.touchingMines) {
                    continue;
                }
                try {
                    for (var _c = (e_11 = void 0, __values(this._getSurrounding(x_1, y_1))), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var _e = __read(_d.value, 2), nextX = _e[0], nextY = _e[1];
                        var nextCell = this.grid[nextY][nextX];
                        if (!nextCell.revealed && !nextCell.flagged) {
                            revealSet.add(nextX + nextY * this._width);
                        }
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (revealSet_1_1 && !revealSet_1_1.done && (_a = revealSet_1.return)) _a.call(revealSet_1);
            }
            finally { if (e_10) throw e_10.error; }
        }
        this._flushStateChange();
    };
    return MinesweeperGame;
}());
export default MinesweeperGame;
//# sourceMappingURL=index.js.map
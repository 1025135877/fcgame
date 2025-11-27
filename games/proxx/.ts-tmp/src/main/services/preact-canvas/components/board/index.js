import { __decorate, __extends, __read, __values } from "tslib";
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
import { Component, h } from "preact";
import { putCanvas } from "src/main/utils/canvas-pool";
import { cellFocusMode } from "src/main/utils/constants";
import { isFeaturePhone } from "src/main/utils/static-display";
import { bind } from "src/utils/bind";
import { board, button as buttonStyle, canvas as canvasStyle, container as containerStyle, gameCell, gameRow, gameTable } from "./style.css";
var defaultCell = {
    flagged: false,
    hasMine: false,
    revealed: false,
    touchingFlags: 0,
    touchingMines: 0
};
var Board = /** @class */ (function (_super) {
    __extends(Board, _super);
    function Board() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            keyNavigation: false
        };
        _this._buttons = [];
        _this._additionalButtonData = new WeakMap();
        return _this;
    }
    Board.prototype.componentDidMount = function () {
        document.documentElement.classList.add("in-game");
        this._createTable(this.props.width, this.props.height);
        this.props.gameChangeSubscribe(this._doManualDomHandling);
        this._rendererInit();
        this._queryFirstCellRect();
        this.props.renderer.updateFirstRect(this._firstCellRect);
        // If the intro was scrolled to the bottom, we need to move it back up again. The nebula
        // overflows the viewport on devices that hide the URL bar on scroll.
        window.scrollTo(0, 0);
        // Set focus on a cell near the center of the board.
        var x = Math.floor(this.props.width * 0.5);
        var y = Math.floor(this.props.height * 0.5);
        var btn = this._buttons[y * this.props.width + x];
        this.setFocus(btn, { preventScroll: true });
        // Center scroll position
        var scroller = this.base.querySelector("." + containerStyle);
        scroller.scrollLeft = scroller.scrollWidth / 2 - scroller.offsetWidth / 2;
        scroller.scrollTop = scroller.scrollHeight / 2 - scroller.offsetHeight / 2;
        window.addEventListener("resize", this._onWindowResize);
        window.addEventListener("keyup", this._onGlobalKeyUp);
    };
    Board.prototype.componentWillUnmount = function () {
        document.documentElement.classList.remove("in-game");
        window.removeEventListener("resize", this._onWindowResize);
        window.removeEventListener("keyup", this._onGlobalKeyUp);
        this.props.gameChangeUnsubscribe(this._doManualDomHandling);
        this.props.renderer.stop();
        this.props.animator.stop();
        putCanvas(this._canvas);
    };
    Board.prototype.shouldComponentUpdate = function () {
        return false;
    };
    Board.prototype.render = function () {
        var _this = this;
        return (h("div", { class: board },
            h("div", { ref: function (el) { return (_this._tableContainer = el); }, class: containerStyle, onScroll: this._onTableScroll, onDblClick: this.onDblClick })));
    };
    Board.prototype._onWindowResize = function () {
        this._onTableScroll();
        this.props.renderer.onResize();
    };
    Board.prototype._onTableScroll = function () {
        this._queryFirstCellRect();
        this.props.renderer.updateFirstRect(this._firstCellRect);
    };
    Board.prototype._onGlobalKeyUp = function (event) {
        // This returns the focus to the board when one of these keys is pressed (on feature phones
        // only). This means the user doesn't have to manually refocus the board.
        if ((isFeaturePhone || cellFocusMode) &&
            (event.key === "9" ||
                event.key === "7" ||
                event.key === "5" ||
                event.key === "0" ||
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight" ||
                event.key === "ArrowUp" ||
                event.key === "ArrowDown")) {
            this.moveFocusByKey(event, 0, 0);
        }
    };
    Board.prototype._doManualDomHandling = function (stateChange) {
        var e_1, _a;
        if (!stateChange.gridChanges) {
            return;
        }
        try {
            // Update DOM straight away
            for (var _b = __values(stateChange.gridChanges), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 3), x = _d[0], y = _d[1], cell = _d[2];
                var btn = this._buttons[y * this.props.width + x];
                this._updateButton(btn, cell, x, y);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.props.animator.updateCells(stateChange.gridChanges);
    };
    Board.prototype._createTable = function (width, height) {
        var tableContainer = document.querySelector("." + containerStyle);
        this._table = document.createElement("table");
        this._table.classList.add(gameTable);
        this._table.setAttribute("role", "grid");
        this._table.setAttribute("aria-label", "The game grid");
        for (var row = 0; row < height; row++) {
            var tr = document.createElement("tr");
            tr.setAttribute("role", "row");
            tr.classList.add(gameRow);
            for (var col = 0; col < width; col++) {
                var y = row;
                var x = col;
                var td = document.createElement("td");
                td.setAttribute("role", "gridcell");
                td.classList.add(gameCell);
                var button = document.createElement("button");
                button.classList.add(buttonStyle);
                // A button is made focusable in componentDidMount
                button.setAttribute("tabindex", "-1");
                button.addEventListener("blur", this.removeFocusVisual);
                this._additionalButtonData.set(button, [x, y, defaultCell]);
                this._updateButton(button, defaultCell, x, y);
                this._buttons.push(button);
                td.appendChild(button);
                tr.appendChild(td);
            }
            this._table.appendChild(tr);
        }
        this._canvas = this.props.renderer.createCanvas();
        this._canvas.classList.add(canvasStyle);
        this.base.appendChild(this._canvas);
        tableContainer.appendChild(this._table);
        this._table.addEventListener("keydown", this.onKeyDownOnTable);
        this._table.addEventListener("keyup", this.onKeyUpOnTable);
        this._table.addEventListener("mouseup", this.onMouseUp);
        this._table.addEventListener("mousedown", this.onMouseDown);
        this._table.addEventListener("dblclick", this.onDblClick);
        this._table.addEventListener("contextmenu", function (event) {
            return event.preventDefault();
        });
        // On feature phone, show focus visual on mouse hover as well
        // Have to be mousemove on table, instead of mouseenter on buttons to avoid
        // unwanted focus move on scroll.
        if (isFeaturePhone || cellFocusMode) {
            this._table.addEventListener("mousemove", this.moveFocusWithMouse);
        }
    };
    Board.prototype._rendererInit = function () {
        this.props.renderer.init(this.props.width, this.props.height);
    };
    Board.prototype._queryFirstCellRect = function () {
        this._firstCellRect = this._buttons[0]
            .closest("td")
            .getBoundingClientRect();
    };
    Board.prototype.removeFocusVisual = function () {
        this.props.renderer.setFocus(-1, -1);
    };
    Board.prototype.setFocusVisual = function (button) {
        // We only want to render focus styles for keyboard and feature phone users.
        var showFocusStyle = button.classList.contains("focus-visible") ||
            isFeaturePhone ||
            cellFocusMode;
        if (!showFocusStyle) {
            this.props.renderer.setFocus(-1, -1);
            return;
        }
        var _a = __read(this._additionalButtonData.get(button), 2), x = _a[0], y = _a[1];
        this.props.renderer.setFocus(x, y);
    };
    Board.prototype.setFocus = function (newFocusBtn, _a) {
        var _b = (_a === void 0 ? {} : _a).preventScroll, preventScroll = _b === void 0 ? false : _b;
        // move tab index to targetBtn (necessary for roving tabindex)
        if (this._currentFocusableBtn) {
            this._currentFocusableBtn.tabIndex = -1;
        }
        newFocusBtn.tabIndex = 0;
        this._currentFocusableBtn = newFocusBtn;
        newFocusBtn.focus({ preventScroll: true });
        if (!preventScroll) {
            this.scrollBtnIntoView(newFocusBtn);
        }
        this.setFocusVisual(newFocusBtn);
    };
    Board.prototype.scrollBtnIntoView = function (btn) {
        // Having to do this manually, as Firefox 48 doesn't support the standard way (boo)
        var scroller = this._tableContainer;
        var containerRect = scroller.getBoundingClientRect();
        var btnRect = btn.getBoundingClientRect();
        var containerMiddleX = containerRect.width / 2;
        var containerMiddleY = containerRect.height / 2;
        var btnMiddleX = btnRect.left + btnRect.width / 2;
        var btnMiddleY = btnRect.top + btnRect.height / 2;
        var xDiff = btnMiddleX - containerMiddleX;
        var yDiff = btnMiddleY - containerMiddleY;
        scroller.scrollTo({
            left: scroller.scrollLeft + xDiff,
            top: scroller.scrollTop + yDiff,
            behavior: "smooth"
        });
    };
    Board.prototype.moveFocusWithMouse = function (event) {
        // Find if the mouse is on one of the button
        var targetBtn = event.target;
        var targetIsBtn = this._additionalButtonData.has(targetBtn);
        if (!targetIsBtn) {
            // the mouse is not on a button
            this.removeFocusVisual();
            return;
        }
        // Locate button that currently have focus
        var activeBtn = document.activeElement;
        var activeIsBtn = this._additionalButtonData.has(activeBtn);
        if (activeIsBtn && activeBtn !== targetBtn) {
            // If different button has focus, blur the button.
            activeBtn.blur();
        }
        this.setFocus(targetBtn, { preventScroll: true });
    };
    Board.prototype.moveFocusByKey = function (event, h, v) {
        event.stopPropagation();
        event.preventDefault();
        // Find which button has focus
        var currentBtn = document.activeElement;
        var btnInfo = this._additionalButtonData.get(currentBtn);
        // If no button has focus, key navigation must have came back to the table.
        // Focus back on tabindex=0 button first.
        if (!btnInfo) {
            this._currentFocusableBtn.focus();
            btnInfo = this._additionalButtonData.get(this._currentFocusableBtn);
        }
        var x = btnInfo[0];
        var y = btnInfo[1];
        var width = this.props.width;
        var height = this.props.height;
        // move x, y position by passed steps h:horizontal, v:vertical
        var newX = x + h;
        var newY = y + v;
        // Check if [newX, newY] position is out of the game field.
        if (newX < 0 || newX >= width || (newY < 0 || newY >= height)) {
            return;
        }
        var nextIndex = newX + newY * width;
        var nextBtn = this._buttons[nextIndex];
        this.setFocus(nextBtn);
    };
    Board.prototype.onKeyUpOnTable = function (event) {
        if (event.key === "Tab") {
            this.moveFocusByKey(event, 0, 0);
        }
    };
    Board.prototype.onKeyDownOnTable = function (event) {
        // Since click action is tied to mouseup event,
        // listen to Enter in case of key navigation click.
        // Key 8 support is for T9 navigation
        if (event.key === "Enter" || event.key === "8") {
            var button = document.activeElement;
            if (!button) {
                return;
            }
            event.preventDefault();
            this.simulateClick(button);
        }
        else if (event.key === "ArrowRight" || event.key === "9") {
            this.moveFocusByKey(event, 1, 0);
        }
        else if (event.key === "ArrowLeft" || event.key === "7") {
            this.moveFocusByKey(event, -1, 0);
        }
        else if (event.key === "ArrowUp" || event.key === "5") {
            this.moveFocusByKey(event, 0, -1);
        }
        else if (event.key === "ArrowDown" || event.key === "0") {
            this.moveFocusByKey(event, 0, 1);
        }
    };
    // Stopping event is necessary for preventing click event on KaiOS
    // which moves focus to the mouse and end up clicking two cells,
    // one under the mouse and one that is currently focused
    Board.prototype.onMouseUp = function (event) {
        // hit test if the mouse up was on a button if not, cancel.
        var targetButton = event.target;
        var targetButtonData = this._additionalButtonData.get(targetButton);
        if (!targetButtonData) {
            return;
        }
        event.preventDefault();
        if (isFeaturePhone || cellFocusMode) {
            // find currently focused element.
            var activeButton = document.activeElement;
            var isActiveBtn = this._additionalButtonData.has(activeButton);
            if (!isActiveBtn) {
                // no other butten has focus, so it's safe to focus on mouse
                this.setFocus(targetButton);
            }
            else {
                // If active button exists, then that button should be clicked.
                // This is needed for feature phone.
                targetButton = activeButton;
            }
        }
        if (event.button !== 2) {
            // normal click
            this.simulateClick(targetButton);
            return;
        }
        // right (two finger) click
        this.simulateClick(targetButton, true);
    };
    // Same as mouseup, necessary for preventing click event on KaiOS
    Board.prototype.onMouseDown = function (event) {
        event.preventDefault();
    };
    Board.prototype._toggleDangerMode = function () {
        this.props.onDangerModeChange(!this.props.dangerMode);
    };
    Board.prototype.onDblClick = function (event) {
        if (event.target === this._tableContainer) {
            this._toggleDangerMode();
            return;
        }
        var btn = event.target;
        if (!this._additionalButtonData.has(btn)) {
            return;
        }
        var _a = __read(this._additionalButtonData.get(btn), 3), x = _a[0], y = _a[1], cell = _a[2];
        if (cell.revealed && cell.touchingMines <= 0) {
            this._toggleDangerMode();
            event.stopPropagation();
        }
    };
    Board.prototype.simulateClick = function (button, alt) {
        if (alt === void 0) { alt = false; }
        var buttonData = this._additionalButtonData.get(button);
        this.props.onCellClick(buttonData, alt);
    };
    Board.prototype._updateButton = function (btn, cell, x, y) {
        var cellLabel;
        if (!cell.revealed) {
            cellLabel = cell.flagged ? "flag" : "hidden";
        }
        else if (cell.hasMine) {
            cellLabel = "black hole";
        }
        else if (cell.touchingMines === 0) {
            cellLabel = "blank";
        }
        else {
            cellLabel = "" + cell.touchingMines;
        }
        var clickable = !cell.revealed ||
            (cell.touchingMines && cell.touchingFlags >= cell.touchingMines);
        btn.setAttribute("aria-disabled", "" + !clickable);
        btn.setAttribute("aria-label", cellLabel);
        this._additionalButtonData.get(btn)[2] = cell;
    };
    __decorate([
        bind
    ], Board.prototype, "_onWindowResize", null);
    __decorate([
        bind
    ], Board.prototype, "_onTableScroll", null);
    __decorate([
        bind
    ], Board.prototype, "_onGlobalKeyUp", null);
    __decorate([
        bind
    ], Board.prototype, "_doManualDomHandling", null);
    __decorate([
        bind
    ], Board.prototype, "removeFocusVisual", null);
    __decorate([
        bind
    ], Board.prototype, "setFocusVisual", null);
    __decorate([
        bind
    ], Board.prototype, "setFocus", null);
    __decorate([
        bind
    ], Board.prototype, "moveFocusWithMouse", null);
    __decorate([
        bind
    ], Board.prototype, "moveFocusByKey", null);
    __decorate([
        bind
    ], Board.prototype, "onKeyUpOnTable", null);
    __decorate([
        bind
    ], Board.prototype, "onKeyDownOnTable", null);
    __decorate([
        bind
    ], Board.prototype, "onMouseUp", null);
    __decorate([
        bind
    ], Board.prototype, "onMouseDown", null);
    __decorate([
        bind
    ], Board.prototype, "onDblClick", null);
    __decorate([
        bind
    ], Board.prototype, "simulateClick", null);
    return Board;
}(Component));
export default Board;
//# sourceMappingURL=index.js.map
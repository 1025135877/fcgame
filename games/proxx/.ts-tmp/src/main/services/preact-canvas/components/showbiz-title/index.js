import { __extends, __read, __spread, __values } from "tslib";
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
import { animate as animateStyle, cell, cellInner, columnContainer, innerSquareColumn, innerSquareFlash, innerSquareItem, innerSquareOutline, innerSquareSizer, row, showbizTitle, showbizTitleFrame } from "./style.css";
var title = "PR0XX";
function removeRandom(arr) {
    return arr.splice(Math.floor(Math.random() * arr.length), 1)[0];
}
function createNumberItems() {
    var numbers = Array(8)
        .fill(null)
        .map(function (_, i) { return i + 1; });
    return Array(8)
        .fill(null)
        .map(function () { return (h("div", { class: innerSquareSizer },
        h("div", { class: innerSquareItem }, removeRandom(numbers)))); });
}
var columns = __spread(title).map(function (letter) { return (h("div", { class: columnContainer },
    h("div", { class: innerSquareColumn },
        h("div", { class: innerSquareSizer },
            h("div", { class: innerSquareItem }, letter)),
        createNumberItems()))); });
// tslint:disable-next-line:max-classes-per-file
var ShowbizTitle = /** @class */ (function (_super) {
    __extends(ShowbizTitle, _super);
    function ShowbizTitle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ShowbizTitle.prototype.shouldComponentUpdate = function (nextProps) {
        return this.props.motion !== nextProps.motion;
    };
    ShowbizTitle.prototype.componentDidMount = function () {
        var e_1, _a, e_2, _b;
        // Random numbers -> PR0XX
        var oneIteration = 266;
        var untilFirstReveal = 2000;
        var untilNextReveal = 70;
        var middleInners = __spread(this.base.querySelectorAll("." + cellInner));
        var indexLeft = 2;
        var indexRight = 2;
        var time = untilFirstReveal;
        var flashHeight = 600;
        while (indexLeft >= 0) {
            try {
                for (var _c = (e_1 = void 0, __values(new Set([indexLeft, indexRight]))), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var innerIndex = _d.value;
                    var inner = middleInners[innerIndex];
                    inner.querySelector("." + innerSquareColumn).style.animationIterationCount =
                        time / oneIteration + "";
                    var flash = inner.querySelector("." + innerSquareFlash);
                    flash.style.animationDelay = time + "ms";
                    flash.style.height = flashHeight + "%";
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            indexLeft--;
            indexRight++;
            flashHeight /= 1.5;
            time += untilNextReveal;
        }
        // Circles
        time += 500;
        indexLeft = 2;
        indexRight = 2;
        while (indexLeft >= 0) {
            try {
                for (var _e = (e_2 = void 0, __values(new Set([indexLeft, indexRight]))), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var index = _f.value;
                    var inner = middleInners[index];
                    inner.querySelector("." + innerSquareOutline).style.animationDelay = time + "ms";
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            indexLeft--;
            indexRight++;
            time += 150;
        }
    };
    ShowbizTitle.prototype.render = function (_a, _s) {
        var motion = _a.motion;
        return (h("div", { class: showbizTitle + " " + (motion ? animateStyle : ""), role: "heading", "aria-label": "PROXX" },
            h("div", { class: showbizTitleFrame, "aria-hidden": "true" },
                h("div", { class: row }, __spread(title).map(function (_, i) { return (h("div", { class: cell },
                    h("div", { class: cellInner },
                        columns[i],
                        h("div", { class: innerSquareOutline }),
                        h("div", { class: innerSquareFlash })))); })))));
    };
    return ShowbizTitle;
}(Component));
export default ShowbizTitle;
//# sourceMappingURL=index.js.map
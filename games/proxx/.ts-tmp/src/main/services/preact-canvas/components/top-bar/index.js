import { __extends } from "tslib";
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
import { minSec } from "../../../../utils/format";
import { Square, Star, Timer } from "../icons/additional";
import { squareIcon, squaresLeft, time, timeIcon, title, topBar } from "./style.css";
// Using a sub class to avoid Preact diffing every second.
var Time = /** @class */ (function (_super) {
    __extends(Time, _super);
    function Time() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Time.prototype.componentDidMount = function () {
        if (this.props.running) {
            this._startTimer();
        }
    };
    Time.prototype.componentWillReceiveProps = function (_a) {
        var running = _a.running;
        if (running === this.props.running) {
            return;
        }
        if (running) {
            this._startTimer();
        }
        else {
            this._stopTimer();
        }
    };
    Time.prototype.shouldComponentUpdate = function () {
        return false;
    };
    Time.prototype.componentWillUnmount = function () {
        this._stopTimer();
    };
    Time.prototype.render = function () {
        return h("div", { role: "timer" }, "00:00");
    };
    Time.prototype._startTimer = function () {
        var _this = this;
        this._start = Date.now();
        this._intervalId = setInterval(function () {
            requestAnimationFrame(function () {
                _this.base.textContent = minSec(Date.now() - _this._start);
            });
        }, 1000);
    };
    Time.prototype._stopTimer = function () {
        clearInterval(this._intervalId);
    };
    return Time;
}(Component));
function gameStatusText(playMode) {
    var text;
    if (playMode === 3 /* Won */) {
        text = "You win";
    }
    else if (playMode === 2 /* Lost */) {
        text = "Game over";
    }
    else {
        text = "Remaining";
    }
    return text;
}
// tslint:disable-next-line:max-classes-per-file
var TopBar = /** @class */ (function (_super) {
    __extends(TopBar, _super);
    function TopBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TopBar.prototype.render = function (_a) {
        var toReveal = _a.toReveal, toRevealTotal = _a.toRevealTotal, timerRunning = _a.timerRunning, playMode = _a.playMode, useMotion = _a.useMotion, bestTime = _a.bestTime, showBestTime = _a.showBestTime;
        return (h("div", { class: topBar, role: "banner" },
            h("h1", { class: title }, "Proxx"),
            h("div", { class: squaresLeft, "aria-label": gameStatusText(playMode) },
                h(Square, { class: squareIcon }),
                " ",
                toReveal.toString().padStart(toRevealTotal.toString().length, "0"),
                "/",
                toRevealTotal),
            h("div", { class: time }, showBestTime && bestTime
                ? [h("div", null, minSec(bestTime)), h(Star, { class: timeIcon })]
                : [
                    h(Time, { running: timerRunning }),
                    h(Timer, { class: timeIcon, animate: timerRunning && useMotion })
                ])));
    };
    return TopBar;
}(Component));
export default TopBar;
//# sourceMappingURL=index.js.map
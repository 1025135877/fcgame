import { __assign, __decorate, __extends, __rest } from "tslib";
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
import { Component, h } from "preact";
import { getPresetName, presets } from "src/main/services/state/grid-presets";
import { isFeaturePhone } from "src/main/utils/static-display";
import { bind } from "src/utils/bind";
import deferred from "../deferred";
import { Arrow } from "../icons/initial";
import { field as fieldStyle, intro as introStyle, label as labelStyle, labelText as labelTextStyle, numberDownArrow as numberDownArrowStyle, numberUpArrow as numberUpArrowStyle, selectArrow as selectArrowStyle, selectField as selectFieldStyle, settingsRow as settingsRowStyle, shortcutKey as shortcutKeyStyle, showbizIntro as showbizIntroStyle, showbizLoading as showbizLoadingStyle, startButton as startButtonStyle, startForm as startFormStyle } from "./style.css";
// WARNING: This module is part of the main bundle. Avoid adding to it if possible.
// tslint:disable-next-line: variable-name
var ShowbizTitleDeferred = deferred(new Promise(function (resolve) {
    if (!prerender) {
        resolve();
    }
}).then(function () { return import("../../lazy-components").then(function (m) { return m.ShowbizTitle; }); }));
var NumberField = /** @class */ (function (_super) {
    __extends(NumberField, _super);
    function NumberField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberField.prototype.render = function (props) {
        var _this = this;
        var children = props.children, inputRef = props.inputRef, inputProps = __rest(props, ["children", "inputRef"]);
        return (h("label", { class: labelStyle },
            h(Arrow, { class: numberUpArrowStyle, onClick: this._onUpClick }),
            h(Arrow, { class: numberDownArrowStyle, onClick: this._onDownClick }),
            h("span", { class: labelTextStyle }, props.children),
            h("input", __assign({ ref: function (el) {
                    _this._input = el;
                    if (inputRef) {
                        inputRef(el);
                    }
                }, class: fieldStyle, type: "number", inputmode: "numeric", pattern: "[0-9]*" }, inputProps))));
    };
    NumberField.prototype._onUpClick = function () {
        this._input.valueAsNumber = Math.min(this._input.valueAsNumber + 1, Number(this._input.max));
        this._dispatch();
    };
    NumberField.prototype._onDownClick = function () {
        this._input.valueAsNumber = Math.max(this._input.valueAsNumber - 1, Number(this._input.min));
        this._dispatch();
    };
    NumberField.prototype._dispatch = function () {
        this._input.dispatchEvent(new Event("change"));
    };
    __decorate([
        bind
    ], NumberField.prototype, "_onUpClick", null);
    __decorate([
        bind
    ], NumberField.prototype, "_onDownClick", null);
    return NumberField;
}(Component));
function getStateUpdateFromDefaults(defaults) {
    var width = defaults.width, height = defaults.height, mines = defaults.mines;
    return {
        width: width,
        height: height,
        mines: mines,
        presetName: getPresetName(width, height, mines)
    };
}
// tslint:disable-next-line:max-classes-per-file
var Intro = /** @class */ (function (_super) {
    __extends(Intro, _super);
    function Intro(props) {
        var _this = _super.call(this, props) || this;
        if (props.defaults) {
            _this.state = getStateUpdateFromDefaults(props.defaults);
        }
        return _this;
    }
    Intro.prototype.componentDidMount = function () {
        window.scrollTo(0, 0);
        window.addEventListener("keyup", this._onKeyUp);
    };
    Intro.prototype.componentWillUnmount = function () {
        window.removeEventListener("keyup", this._onKeyUp);
    };
    Intro.prototype.componentWillReceiveProps = function (_a) {
        var defaults = _a.defaults;
        if (defaults && !this.props.defaults) {
            this.setState(getStateUpdateFromDefaults(defaults));
        }
    };
    Intro.prototype.render = function (_a, _b) {
        var _this = this;
        var motion = _a.motion;
        var width = _b.width, height = _b.height, mines = _b.mines, presetName = _b.presetName;
        return (h("div", { class: introStyle },
            h("div", { class: showbizIntroStyle },
                h(ShowbizTitleDeferred, { loading: function () { return h("div", { class: showbizLoadingStyle }); }, 
                    // tslint:disable-next-line: variable-name
                    loaded: function (ShowbizTitle) { return h(ShowbizTitle, { motion: motion }); } })),
            h("form", { onSubmit: this._startGame, class: startFormStyle, "aria-label": "game settings" },
                h("div", { class: settingsRowStyle },
                    h("label", { class: labelStyle },
                        h("span", { class: labelTextStyle }, "Difficulty"),
                        h(Arrow, { class: selectArrowStyle }),
                        h("select", { required: true, class: selectFieldStyle, ref: function (el) { return (_this._presetSelect = el); }, onChange: this._onSelectChange, value: presetName || "" }, presetName && [
                            h("option", { value: "easy" }, "Easy"),
                            h("option", { value: "medium" }, "Medium"),
                            h("option", { value: "hard" }, "Hard"),
                            h("option", { value: "custom" }, "Custom")
                        ]))),
                h("div", { class: settingsRowStyle },
                    h(NumberField, { required: true, min: "5", max: "40", step: "1", value: width || "", inputRef: function (el) { return (_this._widthInput = el); }, onChange: this._onSettingInput }, "Width"),
                    h(NumberField, { required: true, min: "5", max: "40", step: "1", value: height || "", inputRef: function (el) { return (_this._heightInput = el); }, onChange: this._onSettingInput }, "Height")),
                h("div", { class: settingsRowStyle },
                    h(NumberField, { required: true, min: "1", max: width && height ? width * height : "", step: "1", value: mines, inputRef: function (el) { return (_this._minesInput = el); }, onChange: this._onSettingInput }, "Black holes")),
                h("div", { class: settingsRowStyle },
                    h("button", { class: startButtonStyle },
                        isFeaturePhone ? h("span", { class: shortcutKeyStyle }, "#") : "",
                        " ",
                        "Start")))));
    };
    Intro.prototype._onKeyUp = function (event) {
        if (event.key === "#") {
            this._startGame(event);
        }
    };
    Intro.prototype._onSelectChange = function () {
        var presetName = this._presetSelect.value;
        if (presetName === "custom") {
            this.setState({ presetName: presetName });
            return;
        }
        var preset = presets[presetName];
        this.setState({
            height: preset.height,
            mines: preset.mines,
            presetName: presetName,
            width: preset.width
        });
    };
    Intro.prototype._onSettingInput = function () {
        var width = this._widthInput.valueAsNumber;
        var height = this._heightInput.valueAsNumber;
        var mines = this._minesInput.valueAsNumber;
        var maxMines = width * height - 9;
        this.setState({
            height: height,
            mines: mines > maxMines ? maxMines : mines,
            presetName: getPresetName(width, height, mines),
            width: width
        });
    };
    Intro.prototype._startGame = function (event) {
        event.preventDefault();
        this.props.onStartGame(this.state.width, this.state.height, this.state.mines);
    };
    __decorate([
        bind
    ], Intro.prototype, "_onKeyUp", null);
    __decorate([
        bind
    ], Intro.prototype, "_onSelectChange", null);
    __decorate([
        bind
    ], Intro.prototype, "_onSettingInput", null);
    __decorate([
        bind
    ], Intro.prototype, "_startGame", null);
    return Intro;
}(Component));
export default Intro;
//# sourceMappingURL=index.js.map
import { __decorate, __extends } from "tslib";
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
import { isFeaturePhone } from "src/main/utils/static-display";
import { bind } from "src/utils/bind";
import { supportsVibration } from "../../../state/vibration-preference";
import About from "../about";
import { Close } from "../icons/additional";
import { buttonOff as btnOffStyle, buttonOn as btnOnStyle, closeButton as closebtnStyle, closeContainer as closeContainerStyle, fpCloseButton as fpCloseBtnStyle, fpCloseContainer as fpCloseContainerStyle, keyshortcut as keyshortcutStyle, settings as settingsStyle, settingsContent as settingsContentStyle, settingsWindow as settingsWindowStyle } from "./style.css";
var Settings = /** @class */ (function (_super) {
    __extends(Settings, _super);
    function Settings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Settings.prototype.render = function (_a) {
        var _this = this;
        var onCloseClicked = _a.onCloseClicked, onMotionPrefChange = _a.onMotionPrefChange, motion = _a.motion, texturePromise = _a.texturePromise, supportsSufficientWebGL = _a.supportsSufficientWebGL, disableAnimationBtn = _a.disableAnimationBtn, useVibration = _a.useVibration, onVibrationPrefChange = _a.onVibrationPrefChange;
        var closeBtn = isFeaturePhone ? (h("button", { "aria-label": "close button", ref: function (focusItem) { return (_this.focusItem = focusItem); }, class: fpCloseBtnStyle, onClick: onCloseClicked },
            h("span", { class: keyshortcutStyle }, "*"),
            " close")) : (h("button", { "aria-label": "close button", ref: function (focusItem) { return (_this.focusItem = focusItem); }, class: closebtnStyle, onClick: onCloseClicked },
            h(Close, null)));
        return (h("div", { role: "dialog", "aria-label": "settings dialog", class: settingsStyle },
            h("div", { class: isFeaturePhone ? fpCloseContainerStyle : closeContainerStyle }, closeBtn),
            h("div", { class: settingsWindowStyle },
                h("div", { class: settingsContentStyle },
                    h("h1", null, "Settings"),
                    h("button", { class: motion ? btnOnStyle : btnOffStyle, onClick: onMotionPrefChange, disabled: disableAnimationBtn },
                        "Animations ",
                        motion ? "on" : "off"),
                    h("button", { class: useVibration ? btnOnStyle : btnOffStyle, onClick: onVibrationPrefChange, disabled: !supportsVibration },
                        "Vibrate ",
                        useVibration ? "on" : "off"),
                    h(About, { motion: motion, texturePromise: texturePromise, supportsSufficientWebGL: supportsSufficientWebGL })))));
    };
    Settings.prototype.componentDidMount = function () {
        window.scrollTo(0, 0);
        this.focusItem.focus();
        window.addEventListener("keyup", this._onKeyUp);
    };
    Settings.prototype.componentWillUnmount = function () {
        window.removeEventListener("keyup", this._onKeyUp);
    };
    Settings.prototype._onKeyUp = function (event) {
        if (event.key === "Escape" || event.key === "*") {
            this.props.onCloseClicked();
        }
    };
    __decorate([
        bind
    ], Settings.prototype, "_onKeyUp", null);
    return Settings;
}(Component));
export default Settings;
//# sourceMappingURL=index.js.map
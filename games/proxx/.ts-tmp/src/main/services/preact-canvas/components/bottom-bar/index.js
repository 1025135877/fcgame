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
import { Back, Fullscreen, Information } from "../icons/initial";
import { bottomBar, checkbox, fpToggle, fullscreen, hidden, leftIcon, leftKeyIcon, leftToggleLabel, noFullscreen, rightToggleLabel, shortcutKey, toggle, toggleContainer, toggleLabel } from "./style.css";
// WARNING: This module is part of the main bundle. Avoid adding to it if possible.
function goFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
    else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    }
}
var fullscreenSupported = !!(document.documentElement.requestFullscreen ||
    document.documentElement.webkitRequestFullscreen);
var BottomBar = /** @class */ (function (_super) {
    __extends(BottomBar, _super);
    function BottomBar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            flagModeAnnouncement: ""
        };
        return _this;
    }
    BottomBar.prototype.render = function (_a, _b) {
        var _this = this;
        var onSettingsClick = _a.onSettingsClick, onBackClick = _a.onBackClick, buttonType = _a.buttonType, display = _a.display, showDangerModeToggle = _a.showDangerModeToggle, dangerMode = _a.dangerMode;
        var flagModeAnnouncement = _b.flagModeAnnouncement;
        var backBtn = isFeaturePhone ? (h("button", { class: leftKeyIcon, onClick: onBackClick, "aria-label": "Back to main menu" },
            h("span", { class: shortcutKey }, "*"),
            " back")) : (h("button", { class: leftIcon, onClick: onBackClick, "aria-label": "Back to main menu" },
            h(Back, null)));
        var infoBtn = isFeaturePhone ? (h("button", { class: leftKeyIcon, onClick: onSettingsClick, "aria-label": "Open information and settings" },
            h("span", { class: shortcutKey }, "*"),
            " info")) : (h("button", { class: leftIcon, onClick: onSettingsClick, "aria-label": "Open information and settings" },
            h(Information, null)));
        var toggleBtn = isFeaturePhone ? (h("div", { class: fpToggle },
            h("span", { class: shortcutKey }, "#"),
            " ",
            h("label", null,
                h("input", { class: checkbox, type: "checkbox", role: "switch checkbox", onChange: this._onDangerModeSwitchToggle, checked: !dangerMode, "aria-label": "flag mode", ref: function (el) { return (_this._flagCheckbox = el); } }),
                h("span", { "aria-hidden": "true" },
                    "Flag:",
                    dangerMode ? "OFF" : "ON")),
            h("span", { role: "status", "aria-live": "assertive", "aria-label": flagModeAnnouncement }))) : (h("div", { class: toggleContainer, onTouchStart: this._onDangerModeTouchStart },
            h("label", { class: toggleLabel },
                h("span", { "aria-hidden": "true", class: leftToggleLabel }, "Clear"),
                h("input", { class: checkbox, type: "checkbox", role: "switch checkbox", onChange: this._onDangerModeSwitchToggle, checked: !dangerMode, "aria-label": "flag mode", ref: function (el) { return (_this._flagCheckbox = el); } }),
                h("svg", { viewBox: "0 0 32 16", class: toggle },
                    h("defs", null,
                        h("mask", { id: "flag-toggle-mask" },
                            h("rect", { fill: "#fff", x: "0", y: "0", width: "32", height: "16" }),
                            h("circle", { cx: dangerMode ? 8 : 24, cy: "8", fill: "#000", r: "4" }))),
                    h("rect", { fill: "#fff", x: "0", y: "0", width: "32", height: "16", rx: "8", ry: "8", mask: "url(#flag-toggle-mask)" })),
                h("span", { "aria-hidden": "true", class: rightToggleLabel }, "Flag")),
            h("span", { role: "status", "aria-live": "assertive", "aria-label": flagModeAnnouncement })));
        var fullscreenBtn = isFeaturePhone ? ("") : fullscreenSupported ? (h("button", { class: fullscreen, onClick: goFullscreen, "aria-label": "fullscreen mode" },
            h(Fullscreen, null))) : (h("div", { class: noFullscreen }));
        return (h("div", { class: [bottomBar, display ? "" : hidden].join(" "), role: "menubar" },
            buttonType === "back" ? backBtn : infoBtn,
            showDangerModeToggle && toggleBtn,
            fullscreenSupported ? fullscreenBtn : h("div", { class: noFullscreen })));
    };
    BottomBar.prototype.componentDidMount = function () {
        window.addEventListener("keyup", this._onKeyUp);
    };
    BottomBar.prototype.componentWillUnmount = function () {
        window.removeEventListener("keyup", this._onKeyUp);
    };
    BottomBar.prototype._onKeyUp = function (event) {
        if (event.key === "*") {
            if (this.props.buttonType === "back") {
                this.props.onBackClick();
            }
            else {
                this.props.onSettingsClick();
            }
        }
        else if (this.props.showDangerModeToggle &&
            (event.key === "f" || event.key === "#")) {
            this._dangerModeChange(!this.props.dangerMode, true);
        }
    };
    BottomBar.prototype._dangerModeChange = function (newVal, announce) {
        this.props.onDangerModeChange(newVal);
        // We need to clear the announcement when the input is interacted with, so if we need to
        // announce a change later, we aren't setting it to the same value it already has (which would
        // mean no announcement).
        var flagModeAnnouncement = "";
        if (announce) {
            flagModeAnnouncement = newVal ? "flag mode off" : "flag mode on";
        }
        this.setState({ flagModeAnnouncement: flagModeAnnouncement });
    };
    BottomBar.prototype._onDangerModeTouchStart = function (event) {
        event.preventDefault();
        this._dangerModeChange(this._flagCheckbox.checked, true);
    };
    BottomBar.prototype._onDangerModeSwitchToggle = function () {
        this._dangerModeChange(!this._flagCheckbox.checked, false);
    };
    __decorate([
        bind
    ], BottomBar.prototype, "_onKeyUp", null);
    __decorate([
        bind
    ], BottomBar.prototype, "_onDangerModeTouchStart", null);
    __decorate([
        bind
    ], BottomBar.prototype, "_onDangerModeSwitchToggle", null);
    return BottomBar;
}(Component));
export default BottomBar;
//# sourceMappingURL=index.js.map
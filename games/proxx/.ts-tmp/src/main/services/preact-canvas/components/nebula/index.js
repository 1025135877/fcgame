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
import { __decorate, __extends } from "tslib";
import { Component, h } from "preact";
import { bind } from "../../../../../utils/bind";
import ShaderBox from "../../../../utils/shaderbox";
import { nebula as nebulaStyle, nebulaContainer } from "./style.css";
import { toShaderColor } from "src/main/rendering/constants";
import toRGB from "src/main/utils/to-rgb";
import { debug } from "../../../../utils/constants";
import fragmentShader from "./fragment.glsl";
import vertexShader from "./vertex.glsl";
var metaTheme = document.querySelector('meta[name="theme-color"]');
var Nebula = /** @class */ (function (_super) {
    __extends(Nebula, _super);
    function Nebula() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._timePeriod = 60000;
        _this._fadeSpeed = 10;
        _this._colorBlend = 0;
        _this._loopRunning = false;
        _this._prevColors = [];
        return _this;
    }
    Nebula.prototype.componentDidMount = function () {
        // if no animation mode, skip WebGL setup
        if (this.props.useMotion) {
            this._initShaderbox();
        }
        window.addEventListener("resize", this._onResize);
    };
    Nebula.prototype.shouldComponentUpdate = function (_a) {
        var colorLight = _a.colorLight, colorDark = _a.colorDark, useMotion = _a.useMotion;
        if (useMotion !== this.props.useMotion) {
            return true;
        }
        var didLightColorChange = !colorEqual(this.props.colorLight, colorLight);
        var didDarkColorChange = !colorEqual(this.props.colorDark, colorDark);
        return didLightColorChange || didDarkColorChange;
    };
    Nebula.prototype.componentWillUnmount = function () {
        this._stop();
        window.removeEventListener("resize", this._onResize);
    };
    Nebula.prototype.componentWillUpdate = function () {
        if (!this._shaderBox) {
            return;
        }
        this._prevColors = [this.props.colorLight, this.props.colorDark];
        this._colorBlend = 0;
    };
    Nebula.prototype.componentDidUpdate = function (oldProps) {
        if (this.props.useMotion !== oldProps.useMotion) {
            if (this.props.useMotion) {
                this._initShaderbox();
            }
            else {
                this._stop();
            }
        }
        this._updateColors();
    };
    Nebula.prototype.render = function (_a) {
        var colorLight = _a.colorLight, colorDark = _a.colorDark, useMotion = _a.useMotion;
        return (h("div", { class: nebulaContainer, style: "background: linear-gradient(to bottom, " + toRGB(colorLight) + ", " + toRGB(colorDark) }, useMotion && h("canvas", { class: nebulaStyle, "aria-hidden": "true" })));
    };
    Nebula.prototype._initShaderbox = function () {
        var _this = this;
        this._shaderBox = new ShaderBox(vertexShader, fragmentShader, {
            canvas: this.base.querySelector("canvas"),
            scaling: 1 / 5,
            antialias: false,
            alpha: false,
            uniforms: [
                "alt_color",
                "time",
                "nebula_movement_range",
                "nebula_zoom",
                "vortex_strength",
                "circle1_offset",
                "circle2_offset",
                "circle3_offset",
                "alt_color_dark",
                "alt_color_light",
                "main_color_dark",
                "main_color_light"
            ]
        });
        this._shaderBox.setUniform1f("alt_color", 0);
        this._shaderBox.setUniform1f("nebula_movement_range", 2);
        this._shaderBox.setUniform1f("nebula_zoom", 0.5);
        this._shaderBox.setUniform1f("vortex_strength", 0.1);
        this._shaderBox.setUniform1f("circle1_offset", 0);
        this._shaderBox.setUniform1f("circle2_offset", 1.4);
        this._shaderBox.setUniform1f("circle3_offset", 0);
        this._onResize();
        this._prevColors = [this.props.colorLight, this.props.colorDark];
        this._updateColors();
        this._start();
        if (debug) {
            import("src/main/services/debug").then(function (m) {
                return m.nebula(_this, _this._shaderBox);
            });
        }
    };
    Nebula.prototype._updateColors = function () {
        var colorDark = this.props.colorDark;
        metaTheme.setAttribute("content", "rgb(" + colorDark[0] + ", " + colorDark[1] + ", " + colorDark[2] + ")");
        if (!this._shaderBox) {
            return;
        }
        this._shaderBox.setUniform4f("main_color_light", toShaderColor(this._prevColors[0]));
        this._shaderBox.setUniform4f("main_color_dark", toShaderColor(this._prevColors[1]));
        this._shaderBox.setUniform4f("alt_color_light", toShaderColor(this.props.colorLight));
        this._shaderBox.setUniform4f("alt_color_dark", toShaderColor(colorDark));
    };
    Nebula.prototype._start = function () {
        if (this._loopRunning) {
            return;
        }
        this._loopRunning = true;
        requestAnimationFrame(this._loop);
    };
    Nebula.prototype._stop = function () {
        this._loopRunning = false;
    };
    Nebula.prototype._onResize = function () {
        if (!this._shaderBox) {
            return;
        }
        this._shaderBox.resize();
    };
    Nebula.prototype._loop = function (ts) {
        this._shaderBox.setUniform1f("time", (ts % this._timePeriod) / this._timePeriod);
        this._colorBlend += (1 - this._colorBlend) / this._fadeSpeed;
        this._shaderBox.setUniform1f("alt_color", this._colorBlend);
        this._shaderBox.draw();
        if (this._loopRunning) {
            requestAnimationFrame(this._loop);
        }
    };
    __decorate([
        bind
    ], Nebula.prototype, "_onResize", null);
    __decorate([
        bind
    ], Nebula.prototype, "_loop", null);
    return Nebula;
}(Component));
export default Nebula;
function colorEqual(c1, c2) {
    return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2];
}
//# sourceMappingURL=index.js.map
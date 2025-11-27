import { __awaiter, __decorate, __extends, __generator } from "tslib";
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
import version from "consts:version";
import { Component, h } from "preact";
import { idleAnimationTextureDrawer, staticTextureDrawer } from "src/main/rendering/animation";
import { turquoise } from "src/main/rendering/constants";
import { getCellSizes } from "src/main/utils/cell-sizing";
import { bind } from "src/utils/bind";
import { isFeaturePhone, staticDevicePixelRatio } from "../../../../utils/static-display";
import { RightClick } from "../icons/additional";
import { aboutWrapper as aboutWrapperStyle, iconGuideItem, iconGuideRow, shortcutIcon as shortcutIconStyle, shortcutKey as shortcutKeyStyle, shortcutList as shortcutListStyle, systemData as systemDataStyle, tile as tileStyle } from "./style.css";
var navigator;
navigator = window.navigator;
var About = /** @class */ (function (_super) {
    __extends(About, _super);
    function About() {
        var _this = _super.call(this) || this;
        var _a = getCellSizes(), cellPadding = _a.cellPadding, cellSize = _a.cellSize;
        _this._tileSize = (cellSize + 2 * cellPadding) * staticDevicePixelRatio;
        return _this;
    }
    About.prototype.render = function () {
        return (h("div", { class: aboutWrapperStyle },
            h("h1", null, "How to play"),
            h("div", { class: iconGuideRow },
                h("div", { class: iconGuideItem },
                    h("canvas", { class: tileStyle, ref: this._renderCanvas, width: this._tileSize, height: this._tileSize, "data-sprite": "idle", "data-frame": "0", "data-highlight": "false", "data-border": "true", "data-circle": "true", "data-dot": "false" }),
                    "Unrevealed"),
                h("div", { class: iconGuideItem },
                    h("canvas", { class: tileStyle, ref: this._renderCanvas, width: this._tileSize, height: this._tileSize, "data-sprite": "static", "data-frame": 10 /* MINE */.toString(), "data-highlight": "false", "data-border": "false", "data-circle": "false", "data-dot": "false" }),
                    "Black hole")),
            h("p", null,
                "An unrevealed tile might have a black hole behind it, it might not. The idea is to clear all the tiles that ",
                h("strong", null, "don't"),
                " have black holes behind them."),
            h("p", null, "But, the thing about a black hole \u2013 its main distinguishing feature \u2013 is it's black. And the thing about space, the color of space, your basic space color, is black. So how are you supposed to avoid them? Here's how:"),
            h("div", { class: iconGuideRow },
                h("div", { class: iconGuideItem },
                    h("canvas", { class: tileStyle, ref: this._renderCanvas, width: this._tileSize, height: this._tileSize, "data-sprite": "none", "data-frame": "0", "data-highlight": "false", "data-border": "true", "data-circle": "false" }),
                    "Cleared"),
                h("div", { class: iconGuideItem },
                    h("canvas", { class: tileStyle, ref: this._renderCanvas, width: this._tileSize, height: this._tileSize, "data-sprite": "static", "data-frame": 1 /* NUMBER_1 */.toString(), "data-highlight": "false", "data-border": "false", "data-circle": "false", "data-dot": "false" }),
                    "Clue")),
            h("p", null,
                "If you avoid a black hole, the number tells you how many of the 8 surrounding tiles are a black hole. If it's blank,",
                " ",
                h("strong", null, "none"),
                " of the surrounding tiles is a black hole."),
            h("p", null, "If you think you know where a black hole is, flag it!"),
            h("div", { class: iconGuideRow },
                h("div", { class: iconGuideItem },
                    h("canvas", { class: tileStyle, ref: this._renderCanvas, width: this._tileSize, height: this._tileSize, "data-sprite": "idle", "data-frame": "0", "data-highlight": "true", "data-border": "true", "data-circle": "true", "data-dot": "true" }),
                    "Flagged"),
                h("div", { class: iconGuideItem },
                    h("canvas", { class: tileStyle, ref: this._renderCanvas, width: this._tileSize, height: this._tileSize, "data-sprite": "static", "data-frame": 1 /* NUMBER_1 */.toString(), "data-highlight": "true", "data-border": "false", "data-circle": "false", "data-dot": "false" }),
                    "Active clue")),
            h("p", null, "Switch into flag mode, and tap the suspected tile. Once you've flagged enough tiles around a clue, it'll become active. Tap an active clue to clear all the non-flagged tiles around it."),
            h("h1", null, "Shortcuts"),
            isFeaturePhone ? (h("ul", { class: shortcutListStyle },
                h("li", null,
                    h("span", { class: shortcutKeyStyle, "aria-label": "5 key" }, "5"),
                    "Move up"),
                h("li", null,
                    h("span", { class: shortcutKeyStyle, "aria-label": "0 key" }, "0"),
                    "Move down"),
                h("li", null,
                    h("span", { class: shortcutKeyStyle, "aria-label": "7 key" }, "7"),
                    "Move left"),
                h("li", null,
                    h("span", { class: shortcutKeyStyle, "aria-label": "9 key" }, "9"),
                    "Move right"),
                h("li", null,
                    h("span", { class: shortcutKeyStyle, "aria-label": "8 key" }, "8"),
                    "Click the highlighted cell"),
                h("li", null,
                    h("span", { class: shortcutKeyStyle, "aria-label": "# key" }, "#"),
                    "Switch between Clear and Flag mode"))) : (h("ul", { class: shortcutListStyle },
                h("li", null,
                    h("span", { class: shortcutKeyStyle, "aria-label": "f key" }, "F"),
                    "Switch between Clear and Flag mode"),
                h("li", null,
                    h(RightClick, { class: shortcutIconStyle, "aria-label": "Right click" }),
                    "Flag when in clear mode, or clear when in flag mode."))),
            h("h1", null, "GitHub"),
            h("p", null,
                "Source code can be found at our",
                " ",
                h("a", { href: "https://github.com/GoogleChromeLabs/proxx" }, "GitHub repository"),
                "."),
            h("h1", null, "Privacy policy"),
            h("p", null,
                "Google Analytics is used to record",
                " ",
                h("a", { href: "https://support.google.com/analytics/answer/6004245?ref_topic=2919631" }, "basic visit data"),
                ". Highscores and your user preference are saved locally. No additional data is sent to the server."),
            h("h1", null, "Credit"),
            h("p", null, "Built by Google Chrome Labs"),
            h("p", null,
                "Thanks to ",
                h("a", { href: "https://www.tokyo-wolf.com/" }, "Tokyo Wolf"),
                " for the visual design concept."),
            h("h1", null, "System Information"),
            h("ul", { class: systemDataStyle },
                h("li", null,
                    "Version: ",
                    version),
                h("li", null,
                    "Motion: ",
                    this.props.motion ? "true" : "false"),
                h("li", null,
                    "Supports WebGL:",
                    " ",
                    this.props.supportsSufficientWebGL ? "true" : "false"),
                h("li", null,
                    "Feature Phone: ",
                    isFeaturePhone ? "yes" : "no"),
                h("li", null,
                    "Standalone Mode:",
                    " ",
                    window.matchMedia("(display-mode: standalone)").matches
                        ? "yes"
                        : "no"),
                h("li", null,
                    "Screen Width: ",
                    window.innerWidth,
                    "px"),
                h("li", null,
                    "Screen Height: ",
                    window.innerHeight,
                    "px"),
                h("li", null,
                    "DPR: ",
                    staticDevicePixelRatio),
                h("li", null,
                    "Device Memory: ",
                    navigator.deviceMemory),
                h("li", null,
                    "Concurrency: ",
                    navigator.hardwareConcurrency),
                h("li", null,
                    "UA: ",
                    navigator.userAgent))));
    };
    About.prototype._renderCanvas = function (canvas) {
        return __awaiter(this, void 0, void 0, function () {
            var spriteName, drawer, ctx, frame, hasBorder, hasCircle, hasDot, hasHighlight;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.props.texturePromise];
                    case 1:
                        _a.sent();
                        spriteName = canvas.dataset.sprite;
                        drawer = null;
                        switch (spriteName) {
                            case "idle":
                                drawer = idleAnimationTextureDrawer;
                                break;
                            case "static":
                                drawer = staticTextureDrawer;
                                break;
                        }
                        ctx = canvas.getContext("2d");
                        ctx.save();
                        if (drawer) {
                            frame = Number(canvas.dataset.frame);
                            drawer(frame, ctx, this._tileSize);
                        }
                        hasBorder = canvas.dataset.border.toLowerCase() === "true";
                        if (hasBorder) {
                            staticTextureDrawer(0 /* OUTLINE */, ctx, this._tileSize);
                        }
                        hasCircle = canvas.dataset.circle.toLowerCase() === "true";
                        if (hasCircle) {
                            staticTextureDrawer(12 /* INNER_CIRCLE */, ctx, this._tileSize);
                        }
                        hasDot = canvas.dataset.dot.toLowerCase() === "true";
                        if (hasDot) {
                            staticTextureDrawer(13 /* DOT */, ctx, this._tileSize);
                        }
                        hasHighlight = canvas.dataset.highlight.toLowerCase() === "true";
                        if (hasHighlight) {
                            ctx.globalCompositeOperation = "source-atop";
                            ctx.fillStyle = turquoise;
                            ctx.fillRect(0, 0, this._tileSize, this._tileSize);
                        }
                        ctx.restore();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        bind
    ], About.prototype, "_renderCanvas", null);
    return About;
}(Component));
export default About;
//# sourceMappingURL=index.js.map
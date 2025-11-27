import { __read, __spread } from "tslib";
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
export var spriteSize = 1024;
export var numInnerRects = 5;
// 3s delay per 8 fields
export var rippleSpeed = 3000 / 8;
export function toShaderColor(x) {
    return __spread(x.map(function (x) { return x / 255; }), [1]);
}
export var focusRing = "rgb(122, 244, 66)";
export var turquoise = "rgb(109, 205, 218)";
export var white = "#fff";
// Animation durations
export var idleAnimationLength = 5000;
export var fadeInAnimationLength = 300;
export var fadeOutAnimationLength = 300;
export var flashInAnimationLength = 50;
export var flashOutAnimationLength = 300;
// Texture constants
export var revealedAlpha = 0.3;
export var fadedLinesAlpha = 0.3;
export var safetyBufferFactor = 0.97;
export var thickLine = 20 / 650;
export var thinLine = 12 / 650;
export var borderRadius = 76 / 650;
export var innerCircleRadius = 64 / 650;
export var flagCircleRadius = 32 / 650;
export var numberCircleRadius = 0.8;
export var numberFontSizeFactor = 0.45;
// The font doesn't center well by default
export var numberFontTopShiftFactor = 0.03;
export var glowFactor = 1 / 50;
export var glowAlpha = 0.5;
export var blackHoleInnerRed = "255, 40, 75";
export var blackHoleOuterRed = "255, 34, 106";
export var blackHoleOuterRadius = 1;
export var blackHoleInnerRadius = 0.9;
export var blackHoleRadius = 0.75;
export var idleAnimationNumFrames = (idleAnimationLength * 60) / 1000;
//# sourceMappingURL=constants.js.map
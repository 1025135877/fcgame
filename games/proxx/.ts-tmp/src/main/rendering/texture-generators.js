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
import { staticDevicePixelRatio } from "../utils/static-display";
import { deg2rad, remap, smoothpulse } from "./animation-helpers";
import { roundedRectangle } from "./canvas-helper";
import { blackHoleInnerRadius, blackHoleInnerRed, blackHoleOuterRadius, blackHoleOuterRed, blackHoleRadius, borderRadius, flagCircleRadius, glowAlpha, glowFactor, innerCircleRadius, numberCircleRadius, numberFontSizeFactor, numberFontTopShiftFactor, numInnerRects, safetyBufferFactor, thickLine, thinLine, white } from "./constants";
export function idleAnimationTextureGeneratorFactory(textureSize, cellPadding, numFrames) {
    var size = (textureSize - cellPadding * 2) * safetyBufferFactor;
    var halfSize = size / 2;
    return function (idx, ctx) {
        ctx.clearRect(0, 0, textureSize, textureSize);
        var ts = Math.floor(idx % numFrames) / numFrames;
        ctx.save();
        ctx.translate(textureSize / 2, textureSize / 2);
        roundedRectangle(ctx, -halfSize, -halfSize, size, size, size * borderRadius);
        ctx.clip();
        ctx.strokeStyle = white;
        ctx.lineWidth = size * thinLine;
        var magnification = remap(0, 1, 1, 1.4, smoothpulse(0, 0.5, 0.5, 1, ts));
        for (var i = 0; i < numInnerRects; i++) {
            ctx.save();
            var offset = ((numInnerRects - i) / numInnerRects) * 0.14;
            var angle = 5 +
                i * 9 +
                (i * (i + 1)) / 2 +
                smoothpulse(0, 0.5 + offset, 0.5 + offset, 1, ts) * 180;
            ctx.rotate(deg2rad(-angle));
            var subsize = size * magnification * (0.92 - 0.13 * i);
            roundedRectangle(ctx, -subsize / 2, -subsize / 2, subsize, subsize, subsize * borderRadius);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    };
}
export function staticTextureGeneratorFactory(textureSize, cellPadding) {
    var fullSize = textureSize - cellPadding * 2;
    var size = fullSize * safetyBufferFactor;
    var halfSize = size / 2;
    // If a texture needs a glow effect, the routine can paint
    // to this canvas instead. This temporary canvas will
    // be blitted to the output canvas twice — once with a blur,
    // and once without, yielding a glow.
    var cvs2 = document.createElement("canvas");
    cvs2.width = cvs2.height = textureSize * staticDevicePixelRatio;
    var ctx2 = cvs2.getContext("2d");
    ctx2.scale(staticDevicePixelRatio, staticDevicePixelRatio);
    var blurIntensity = glowFactor;
    var blitOnTop = true;
    return function (idx, ctx) {
        ctx2.clearRect(0, 0, textureSize, textureSize);
        ctx2.save();
        ctx.save();
        ctx.translate(textureSize / 2, textureSize / 2);
        ctx2.translate(textureSize / 2, textureSize / 2);
        if (idx === 0 /* OUTLINE */) {
            ctx2.strokeStyle = "white";
            // Outline
            // Size: 650, stroke: 20, radius: 76
            roundedRectangle(ctx2, -halfSize, -halfSize, size, size, size * borderRadius);
            ctx2.lineWidth = size * thickLine;
            ctx2.stroke();
        }
        else if (idx === 12 /* INNER_CIRCLE */) {
            ctx2.strokeStyle = "white";
            ctx2.lineWidth = size * thickLine;
            var radius = size * innerCircleRadius;
            ctx2.beginPath();
            ctx2.moveTo(radius, 0);
            ctx2.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx2.closePath();
            ctx2.stroke();
        }
        else if (idx >= 1 && idx <= 8) {
            ctx2.strokeStyle = white;
            ctx2.lineWidth = size * thickLine;
            ctx2.beginPath();
            ctx2.arc(0, 0, halfSize * numberCircleRadius, 0, 2 * Math.PI);
            ctx2.closePath();
            ctx2.stroke();
            ctx2.fillStyle = white;
            ctx2.textAlign = "center";
            ctx2.textBaseline = "middle";
            ctx2.font = size * numberFontSizeFactor + "px/1 \"Space Mono\", sans-serif";
            var measure = ctx2.measureText("" + idx);
            var yOffset = size * numberFontTopShiftFactor;
            if ("actualBoundingBoxAscent" in measure) {
                yOffset =
                    (measure.actualBoundingBoxAscent - measure.actualBoundingBoxDescent) /
                        2;
            }
            ctx2.fillText("" + idx, 0, yOffset);
        }
        else if (idx === 9 /* FLASH */) {
            roundedRectangle(ctx2, -halfSize, -halfSize, size, size, size * borderRadius);
            ctx2.clip();
            ctx2.fillStyle = white;
            ctx2.fillRect(-halfSize, -halfSize, size, size);
        }
        else if (idx === 10 /* MINE */) {
            var radius = halfSize * safetyBufferFactor * blackHoleOuterRadius;
            // Pink disc to form outer pink ring
            ctx.fillStyle = "rgb(" + blackHoleOuterRed + ")";
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            // Black disc as background for the radial ring.
            radius *= blackHoleInnerRadius;
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            // Radial gradient on top of black disc to form the
            // inner red ring.
            var gradient = ctx.createRadialGradient(0, 0, radius * blackHoleRadius, 0, 0, radius);
            gradient.addColorStop(0, "rgba(" + blackHoleInnerRed + ", .5)");
            gradient.addColorStop(1, "rgba(" + blackHoleInnerRed + ", .1)");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            // Black disc for the actual black hole
            radius *= blackHoleRadius;
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
        }
        else if (idx === 11 /* FOCUS */) {
            ctx.globalAlpha = 0.3;
            roundedRectangle(ctx, -halfSize, -halfSize, size, size, size * borderRadius);
            ctx.clip();
            ctx.fillStyle = white;
            ctx.fillRect(-halfSize, -halfSize, size, size);
        }
        else if (idx === 13 /* DOT */) {
            ctx2.fillStyle = "white";
            ctx2.lineWidth = size * thickLine;
            var radius = size * flagCircleRadius;
            ctx2.beginPath();
            ctx2.moveTo(radius, 0);
            ctx2.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx2.closePath();
            ctx2.fill();
        }
        ctx.restore();
        ctx2.restore();
        ctx.save();
        var blur = (textureSize * staticDevicePixelRatio * blurIntensity).toFixed(1);
        ctx.filter = "blur(" + blur + "px)";
        ctx.globalAlpha = glowAlpha;
        ctx.drawImage(cvs2, 0, 0, cvs2.width, cvs2.height, 0, 0, textureSize, textureSize);
        if (blitOnTop) {
            ctx.filter = "none";
            ctx.globalAlpha = 1;
            ctx.drawImage(cvs2, 0, 0, cvs2.width, cvs2.height, 0, 0, textureSize, textureSize);
        }
        ctx.restore();
    };
}
//# sourceMappingURL=texture-generators.js.map
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
import { __decorate, __read, __spread } from "tslib";
// tslint:disable:no-bitwise Forgive me, father.
import { getCanvas } from "src/main/utils/canvas-pool";
import { getBarHeights, getCellSizes } from "src/main/utils/cell-sizing";
import ShaderBox from "src/main/utils/shaderbox";
import { staticDevicePixelRatio } from "src/main/utils/static-display";
import { bind } from "src/utils/bind";
import { idleSprites, processDoneCallback, staticSprites, textureTileSize } from "../animation";
import { easeInOutCubic, easeOutQuad, remap } from "../animation-helpers";
import { fadedLinesAlpha, fadeInAnimationLength, fadeOutAnimationLength, flashInAnimationLength, flashOutAnimationLength, idleAnimationLength, idleAnimationNumFrames, revealedAlpha, spriteSize } from "../constants";
import fragmentShader from "./fragment.glsl";
import vertexShader from "./vertex.glsl";
function generateCoords(x1, y1, x2, y2) {
    return [x1, y1, x1, y2, x2, y1, x2, y2];
}
function generateGameFieldMesh(numTilesX, numTilesY, tileSize) {
    // TODO optimize me (avoid allocations)
    var vertices = [];
    for (var y = 0; y < numTilesY; y++) {
        for (var x = 0; x < numTilesX; x++) {
            vertices.push.apply(vertices, __spread(generateCoords(x * tileSize, y * tileSize, (x + 1) * tileSize, (y + 1) * tileSize)));
        }
    }
    return new Float32Array(vertices);
}
function generateVertexIndices(numTilesX, numTilesY) {
    // TODO optimize me (avoid allocations)
    var indices = [];
    for (var i = 0; i < numTilesX * numTilesY; i++) {
        indices.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 2, i * 4 + 1, i * 4 + 3);
    }
    return indices;
}
var WebGlRenderer = /** @class */ (function () {
    function WebGlRenderer() {
        this._lastFocus = [-1, -1];
        this._renderLoopRunning = false;
    }
    WebGlRenderer.prototype.createCanvas = function () {
        this._canvas = getCanvas("webgl");
        return this._canvas;
    };
    WebGlRenderer.prototype.init = function (numTilesX, numTilesY) {
        this._numTilesX = numTilesX;
        this._numTilesY = numTilesY;
        this._updateTileSize();
        this._initShaderBox();
        this._setupMesh();
        this._setupTextures();
        this._shaderBox.setUniform1f("sprite_size", spriteSize);
        this._shaderBox.setUniform1f("tile_size", textureTileSize * staticDevicePixelRatio);
        this._shaderBox.setUniform1f("idle_frames", idleAnimationNumFrames);
        this._updateFadeoutParameters();
        this._startRenderLoop();
    };
    WebGlRenderer.prototype.updateFirstRect = function (rect) {
        this._assertShaderBox();
        this._shaderBox.setUniform2f("offset", [
            rect.left * staticDevicePixelRatio,
            rect.top * staticDevicePixelRatio
        ]);
    };
    WebGlRenderer.prototype.stop = function () {
        this._renderLoopRunning = false;
    };
    WebGlRenderer.prototype.onResize = function () {
        if (!this._shaderBox) {
            return;
        }
        this._shaderBox.resize();
        if (this._updateTileSize()) {
            this._updateGridMesh();
        }
        this._updateFadeoutParameters();
    };
    WebGlRenderer.prototype.beforeUpdate = function () {
        // Nothing to do here
    };
    WebGlRenderer.prototype.afterUpdate = function () {
        // Nothing to do here
    };
    WebGlRenderer.prototype.beforeCell = function (x, y, cell, animationList, ts) {
        // Nothing to do here
    };
    WebGlRenderer.prototype.afterCell = function (x, y, cell, animationList, ts) {
        // Nothing to do here
    };
    WebGlRenderer.prototype.render = function (x, y, cell, animation, ts) {
        this._assertShaderBox();
        // @ts-ignore
        this[animation.name](x, y, cell, animation, ts);
        this._updateDynamicTileData(x, y);
    };
    WebGlRenderer.prototype.setFocus = function (x, y) {
        if (this._lastFocus[0] > -1 && this._lastFocus[1] > -1) {
            var _a = __read(this._lastFocus, 2), lastX = _a[0], lastY = _a[1];
            var dynamicTileDataA = this._getDynamicTileDataAForTile(lastX, lastY);
            dynamicTileDataA[0 /* BITFIELD */] &= ~(1 << 0 /* FOCUS */);
            this._updateDynamicTileData(lastX, lastY);
        }
        if (x > -1 && y > -1) {
            var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
            dynamicTileDataA[0 /* BITFIELD */] |= 1 << 0 /* FOCUS */;
            this._updateDynamicTileData(x, y);
            this._lastFocus = [x, y];
        }
    };
    WebGlRenderer.prototype._updateFadeoutParameters = function () {
        var _a = getBarHeights(), topBarHeight = _a.topBarHeight, bottomBarHeight = _a.bottomBarHeight;
        this._shaderBox.setUniform2f("paddings", [
            topBarHeight * staticDevicePixelRatio,
            bottomBarHeight * staticDevicePixelRatio
        ]);
    };
    WebGlRenderer.prototype._updateTileSize = function () {
        var _a = getCellSizes(), cellPadding = _a.cellPadding, cellSize = _a.cellSize;
        var newTileSize = (cellSize + 2 * cellPadding) * staticDevicePixelRatio;
        var hasChanged = newTileSize !== this._tileSize;
        this._tileSize = newTileSize;
        return hasChanged;
    };
    WebGlRenderer.prototype._updateDynamicTileData = function (x, y) {
        // Go through the _other_ 3 vertices and copy the (potentially modified)
        // dynamic tile data from vertex 0 to their respective buffers.
        // TODO: We can prevent running these loops by switching to ANGLE instanced
        // rendering.
        var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
        var dynamicTileDataB = this._getDynamicTileDataBForTile(x, y);
        for (var i = 1; i < 4; i++) {
            this._getDynamicTileDataAForTile(x, y, i).set(dynamicTileDataA);
            this._getDynamicTileDataBForTile(x, y, i).set(dynamicTileDataB);
        }
    };
    WebGlRenderer.prototype[0 /* IDLE */] = function (x, y, cell, animation, ts) {
        var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
        var dynamicTileDataB = this._getDynamicTileDataBForTile(x, y);
        var animationLength = idleAnimationLength;
        var normalized = ((ts - animation.start) / animationLength) % 1;
        dynamicTileDataA[3 /* IDLE_ANIMATION_TIME */] = normalized;
        var fadeInNormalized = (ts - (animation.fadeStart || 0)) / fadeInAnimationLength;
        if (fadeInNormalized > 1) {
            fadeInNormalized = 1;
        }
        dynamicTileDataB[3 /* BOXES_OPACITY */] = remap(0, 1, 1, fadedLinesAlpha, easeOutQuad(fadeInNormalized));
        dynamicTileDataA[1 /* DOT */] = remap(0, 1, 1, 0, easeOutQuad(fadeInNormalized));
        dynamicTileDataB[2 /* BORDER_OPACITY */] = 1;
        dynamicTileDataA[0 /* BITFIELD */] |=
            1 << 1 /* INNER_CIRCLE */;
    };
    WebGlRenderer.prototype[6 /* FLAGGED */] = function (x, y, cell, animation, ts) {
        var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
        var dynamicTileDataB = this._getDynamicTileDataBForTile(x, y);
        var animationLength = idleAnimationLength;
        var normalized = ((ts - animation.start) / animationLength) % 1;
        dynamicTileDataA[3 /* IDLE_ANIMATION_TIME */] = normalized;
        var fadeOutNormalized = (ts - (animation.fadeStart || 0)) / fadeOutAnimationLength;
        if (fadeOutNormalized > 1) {
            fadeOutNormalized = 1;
        }
        dynamicTileDataB[3 /* BOXES_OPACITY */] = remap(0, 1, fadedLinesAlpha, 1, easeOutQuad(fadeOutNormalized));
        dynamicTileDataA[1 /* DOT */] = remap(0, 1, 0, 1, easeOutQuad(fadeOutNormalized));
        dynamicTileDataB[2 /* BORDER_OPACITY */] = 1;
        dynamicTileDataB[2 /* BORDER_OPACITY */] = 1;
    };
    WebGlRenderer.prototype[5 /* NUMBER */] = function (x, y, cell, animation, ts) {
        if (ts < animation.start) {
            return;
        }
        var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
        var dynamicTileDataB = this._getDynamicTileDataBForTile(x, y);
        dynamicTileDataA[2 /* STATIC_TILE */] = cell.touchingMines;
        dynamicTileDataB[2 /* BORDER_OPACITY */] =
            cell.touchingMines <= 0 ? revealedAlpha : 0;
        dynamicTileDataA[0 /* BITFIELD */] &= ~(1 << 1 /* INNER_CIRCLE */);
        dynamicTileDataA[1 /* DOT */] = 0;
        dynamicTileDataB[3 /* BOXES_OPACITY */] = 0;
    };
    WebGlRenderer.prototype[3 /* HIGHLIGHT_IN */] = function (x, y, cell, animation, ts) {
        var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
        var dynamicTileDataB = this._getDynamicTileDataBForTile(x, y);
        var animationLength = fadeInAnimationLength;
        var normalized = (ts - animation.start) / animationLength;
        if (normalized < 0) {
            normalized = 0;
        }
        if (normalized > 1) {
            processDoneCallback(animation);
            normalized = 1;
        }
        dynamicTileDataB[0 /* HIGHLIGHT_OPACITY */] = easeOutQuad(normalized);
    };
    WebGlRenderer.prototype[4 /* HIGHLIGHT_OUT */] = function (x, y, cell, animation, ts) {
        var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
        var dynamicTileDataB = this._getDynamicTileDataBForTile(x, y);
        var animationLength = fadeOutAnimationLength;
        var normalized = (ts - animation.start) / animationLength;
        if (normalized < 0) {
            normalized = 0;
        }
        if (normalized > 1) {
            processDoneCallback(animation);
            normalized = 1;
        }
        dynamicTileDataB[0 /* HIGHLIGHT_OPACITY */] =
            1 - easeOutQuad(normalized);
    };
    WebGlRenderer.prototype[1 /* FLASH_IN */] = function (x, y, cell, animation, ts) {
        var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
        var dynamicTileDataB = this._getDynamicTileDataBForTile(x, y);
        var animationLength = flashInAnimationLength;
        var normalized = (ts - animation.start) / animationLength;
        if (normalized < 0) {
            return;
        }
        if (normalized > 1) {
            processDoneCallback(animation);
            normalized = 1;
        }
        dynamicTileDataB[1 /* FLASH_OPACITY */] = easeOutQuad(normalized);
    };
    WebGlRenderer.prototype[2 /* FLASH_OUT */] = function (x, y, cell, animation, ts) {
        var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
        var dynamicTileDataB = this._getDynamicTileDataBForTile(x, y);
        var animationLength = flashOutAnimationLength;
        var normalized = (ts - animation.start) / animationLength;
        if (normalized < 0) {
            return;
        }
        if (normalized > 1) {
            processDoneCallback(animation);
            normalized = 1;
        }
        dynamicTileDataB[1 /* FLASH_OPACITY */] =
            1 - easeInOutCubic(normalized);
    };
    WebGlRenderer.prototype[7 /* MINED */] = function (x, y, cell, animation, ts) {
        if (ts < animation.start) {
            return;
        }
        var dynamicTileDataA = this._getDynamicTileDataAForTile(x, y);
        var dynamicTileDataB = this._getDynamicTileDataBForTile(x, y);
        dynamicTileDataA[2 /* STATIC_TILE */] = 10 /* MINE */;
        dynamicTileDataA[0 /* BITFIELD */] &= ~(1 << 1 /* INNER_CIRCLE */);
        dynamicTileDataB[2 /* BORDER_OPACITY */] = 0;
        dynamicTileDataB[3 /* BOXES_OPACITY */] = 0;
    };
    WebGlRenderer.prototype._getDynamicTileDataAForTile = function (x, y, vertex) {
        if (vertex === void 0) { vertex = 0; }
        var tileOffset = y * this._numTilesX + x;
        var vertexOffset = tileOffset * 4 + vertex;
        var floatOffset = vertexOffset * 4;
        var byteOffset = floatOffset * 4;
        return new Float32Array(this._dynamicTileDataA.buffer, byteOffset, 4);
    };
    WebGlRenderer.prototype._getDynamicTileDataBForTile = function (x, y, vertex) {
        if (vertex === void 0) { vertex = 0; }
        var tileOffset = y * this._numTilesX + x;
        var vertexOffset = tileOffset * 4 + vertex;
        var floatOffset = vertexOffset * 4;
        var byteOffset = floatOffset * 4;
        return new Float32Array(this._dynamicTileDataB.buffer, byteOffset, 4);
    };
    WebGlRenderer.prototype._initShaderBox = function () {
        /**
         * We are setting up a WebGL context here.
         *
         * Per-vertex attributes:
         * - `pos`: Position of the vertex on screen in pixels. Starting at (0, 0)
         *   in the top left corner.
         * - `tile_uv`: UV coordinates within each tile. Top-left corner is (0, 0),
         *   bottom right corner is (1, 1).
         * - `dynamic_tile_data_a`: A `vec4` containing data according to the
         *   `DynamicTileDataA` enum
         * - `dynamic_tile_data_b`: A `vec4` containing data according to the
         *   `DynamicTileDataB` enum
         *
         * Uniforms:
         * - `offset`: Offset of the first tile’s top left corner from the top-left
         *   corner of the screen. This effectively makes sure our WebGL tiles are
         *   perfectly aligned with the inivisible table, including scroll position.
         * - `idle_sprites[n]`: Up to 4 texture samplers for the sprite of the idle
         *   animation.
         * - `static_sprite`: Sampler for the static sprite.
         * - `sprite_size`: A single float for the size of the sprites in pixels
         *   (they are assumed to be square).
         * - `tile_size`: A single float for the size of each tile in pixels.
         * - `idle_frames`: Number of frames the idle animation has.
         * - `paddings`: The vertical and horizontal paddings that define the fade-out.
         */
        this._shaderBox = new ShaderBox(vertexShader, fragmentShader, {
            canvas: this._canvas,
            uniforms: [
                "offset",
                "idle_sprites[0]",
                "idle_sprites[1]",
                "idle_sprites[2]",
                "idle_sprites[3]",
                "static_sprite",
                "sprite_size",
                "tile_size",
                "idle_frames",
                "paddings"
            ],
            scaling: staticDevicePixelRatio,
            antialias: false,
            mesh: [
                {
                    dimensions: 2,
                    name: "pos"
                },
                {
                    dimensions: 2,
                    name: "tile_uv"
                },
                {
                    name: "dynamic_tile_data_a",
                    dimensions: 4,
                    usage: "DYNAMIC_DRAW"
                },
                {
                    name: "dynamic_tile_data_b",
                    dimensions: 4,
                    usage: "DYNAMIC_DRAW"
                }
            ],
            indices: generateVertexIndices(this._numTilesX, this._numTilesY),
            clearColor: [0, 0, 0, 0]
        });
        this._shaderBox.resize();
    };
    WebGlRenderer.prototype._updateGridMesh = function () {
        var mesh = generateGameFieldMesh(this._numTilesX, this._numTilesY, this._tileSize);
        this._shaderBox.updateVBO("pos", mesh);
        return mesh;
    };
    WebGlRenderer.prototype._setupMesh = function () {
        var _this = this;
        var mesh = this._updateGridMesh();
        // Repeat these UVs for all tiles.
        var uvs = [0, 1, 0, 0, 1, 1, 1, 0];
        this._shaderBox.updateVBO("tile_uv", mesh.map(function (_, idx) { return uvs[idx % uvs.length]; }));
        var numTiles = this._numTilesX * this._numTilesY;
        this._dynamicTileDataA = new Float32Array(new Array(numTiles * 4 * 4).fill(0).map(function (_, idx) {
            var fieldIdx = Math.floor(idx / 16);
            var x = fieldIdx % _this._numTilesX;
            var y = Math.floor(fieldIdx / _this._numTilesX);
            switch (idx % 4) {
                case 0 /* BITFIELD */:
                    return 1 << 1 /* INNER_CIRCLE */;
                case 1 /* DOT */:
                    return 0;
                case 2 /* STATIC_TILE */:
                    return -1; // Equivalent to “unrevealed”
                case 3 /* IDLE_ANIMATION_TIME */:
                    return 0;
                default:
                    return -1; // Never reached. Just to make TypeScript happy.
            }
        }));
        this._shaderBox.updateVBO("dynamic_tile_data_a", this._dynamicTileDataA);
        this._dynamicTileDataB = new Float32Array(new Array(numTiles * 4 * 4).fill(0).map(function (_, idx) {
            switch (idx % 4) {
                case 2 /* BORDER_OPACITY */:
                    return 1;
                case 3 /* BOXES_OPACITY */:
                    return fadedLinesAlpha;
                case 1 /* FLASH_OPACITY */:
                    return 0;
                case 0 /* HIGHLIGHT_OPACITY */:
                    return 0;
                default:
                    return -1; // Never reached. Just to make TypeScript happy.
            }
        }));
        this._shaderBox.updateVBO("dynamic_tile_data_b", this._dynamicTileDataB);
    };
    WebGlRenderer.prototype._setupTextures = function () {
        // Due to the way internal WebGL state handling works, we
        // have to add all the textures first before we bind them.
        this._shaderBox.addTexture("staticSprite", staticSprites[0]);
        for (var i = 0; i < idleSprites.length; i++) {
            this._shaderBox.addTexture("idleSprite" + i, idleSprites[i]);
        }
        for (var i = 0; i < idleSprites.length; i++) {
            this._shaderBox.activateTexture("idleSprite" + i, i + 1);
            this._shaderBox.setUniform1i("idle_sprites[" + i + "]", i + 1);
        }
        this._shaderBox.activateTexture("staticSprite", 0);
        this._shaderBox.setUniform1i("static_sprite", 0);
    };
    WebGlRenderer.prototype._startRenderLoop = function () {
        this._renderLoopRunning = true;
        requestAnimationFrame(this._renderLoop);
    };
    WebGlRenderer.prototype._assertShaderBox = function () {
        if (!this._shaderBox) {
            throw Error("ShaderBox not initialized for WebGL renderer");
        }
    };
    WebGlRenderer.prototype._renderLoop = function () {
        this._shaderBox.updateVBO("dynamic_tile_data_a", this._dynamicTileDataA);
        this._shaderBox.updateVBO("dynamic_tile_data_b", this._dynamicTileDataB);
        this._shaderBox.draw();
        if (this._renderLoopRunning) {
            requestAnimationFrame(this._renderLoop);
        }
    };
    __decorate([
        bind
    ], WebGlRenderer.prototype, "_renderLoop", null);
    return WebGlRenderer;
}());
export default WebGlRenderer;
//# sourceMappingURL=index.js.map
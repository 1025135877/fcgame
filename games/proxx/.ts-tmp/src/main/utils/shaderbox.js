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
import { __assign, __read, __spread, __values } from "tslib";
export function setShader(gl, program, type, src) {
    var shader = gl.createShader(type);
    if (!shader) {
        throw Error("Could not create shader");
    }
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error("Error compiling " + (type === gl.VERTEX_SHADER ? "vertex" : "fragment") + " shader: " + gl.getShaderInfoLog(shader));
    }
    gl.attachShader(program, shader);
}
var defaultOpts = {
    antialias: true,
    alpha: true,
    scaling: devicePixelRatio,
    timing: function (ts) { return ts; },
    uniforms: [],
    mesh: [
        {
            data: new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]),
            dimensions: 2,
            name: "pos"
        }
    ],
    indices: [0, 1, 2, 2, 1, 3],
    clearColor: [1, 0, 0, 1]
};
var defaultAddTextureOpts = {
    interpolation: "LINEAR"
};
var ShaderBox = /** @class */ (function () {
    function ShaderBox(_vertexShader, _fragmentShader, opts) {
        var e_1, _a, e_2, _b, _c;
        if (opts === void 0) { opts = {}; }
        this._vertexShader = _vertexShader;
        this._fragmentShader = _fragmentShader;
        this._uniformLocations = new Map();
        this._uniformValues = new Map();
        this._textures = new Map();
        this._vbos = new Map();
        this._opts = __assign(__assign(__assign({}, defaultOpts), opts), { canvas: opts.canvas || document.createElement("canvas") });
        this._opts.uniforms = this._opts.uniforms.slice();
        this.canvas = this._opts.canvas;
        this._gl = this.canvas.getContext("webgl", {
            antialias: this._opts.antialias,
            alpha: this._opts.alpha
        });
        if (!this._gl) {
            throw Error("No support for WebGL");
        }
        var program = this._gl.createProgram();
        if (!program) {
            throw Error("Could not create program");
        }
        setShader(this._gl, program, this._gl.VERTEX_SHADER, this._vertexShader);
        setShader(this._gl, program, this._gl.FRAGMENT_SHADER, this._fragmentShader);
        this._gl.linkProgram(program);
        if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) {
            throw Error("Couldn\u2019t link program: " + this._gl.getProgramInfoLog(program));
        }
        this._gl.validateProgram(program);
        if (!this._gl.getProgramParameter(program, this._gl.VALIDATE_STATUS)) {
            throw Error("Couldn\u2019t validate program: " + this._gl.getProgramInfoLog(program));
        }
        this._gl.useProgram(program);
        this._opts.uniforms.push("iResolution");
        try {
            for (var _d = __values(this._opts.uniforms), _e = _d.next(); !_e.done; _e = _d.next()) {
                var name_1 = _e.value;
                var uniformLocation = this._gl.getUniformLocation(program, name_1);
                if (!uniformLocation) {
                    console.error("Couldn\u2019t find uniform location of " + name_1);
                    continue;
                }
                this._uniformLocations.set(name_1, uniformLocation);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var _f = __values(this._opts.mesh), _g = _f.next(); !_g.done; _g = _f.next()) {
                var data = _g.value;
                var vbo = this._gl.createBuffer();
                if (!vbo) {
                    throw Error("Could not create VBO");
                }
                this._vbos.set(data.name, vbo);
                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
                this._gl.bufferData(this._gl.ARRAY_BUFFER, data.data || new Float32Array([]), this._gl[data.usage || "STATIC_DRAW"]);
                var loc = this._gl.getAttribLocation(program, data.name);
                this._gl.vertexAttribPointer(loc, data.dimensions, this._gl.FLOAT, false, 0, 0);
                this._gl.enableVertexAttribArray(loc);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var idxVbo = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, idxVbo);
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._opts.indices), this._gl.STATIC_DRAW);
        (_c = this._gl).clearColor.apply(_c, __spread(this._opts.clearColor));
    }
    ShaderBox.prototype.updateVBO = function (name, data) {
        this._assertVBOExists(name);
        var vbo = this._vbos.get(name);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
    };
    ShaderBox.prototype.resize = function () {
        var rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this._opts.scaling;
        this.canvas.height = rect.height * this._opts.scaling;
        this.setUniform2f("iResolution", [this.canvas.width, this.canvas.height]);
        this._gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    };
    ShaderBox.prototype.hasUniform = function (name) {
        return this._uniformLocations.has(name);
    };
    Object.defineProperty(ShaderBox.prototype, "uniforms", {
        get: function () {
            return __spread(this._uniformLocations.keys());
        },
        enumerable: false,
        configurable: true
    });
    ShaderBox.prototype.getUniform = function (name) {
        this._assertUniformExists(name);
        return this._uniformValues.get(name);
    };
    ShaderBox.prototype.setUniform1i = function (name, val) {
        if (!this.hasUniform(name)) {
            return;
        }
        this._gl.uniform1i(this._getUniformLocation(name), val);
        this._uniformValues.set(name, [val]);
    };
    ShaderBox.prototype.setUniform1f = function (name, val) {
        if (!this.hasUniform(name)) {
            return;
        }
        this._gl.uniform1f(this._getUniformLocation(name), val);
        this._uniformValues.set(name, [val]);
    };
    ShaderBox.prototype.setUniform2f = function (name, val) {
        if (!this.hasUniform(name)) {
            return;
        }
        this._gl.uniform2fv(this._getUniformLocation(name), val);
        this._uniformValues.set(name, val);
    };
    ShaderBox.prototype.setUniform3f = function (name, val) {
        if (!this.hasUniform(name)) {
            return;
        }
        this._gl.uniform3fv(this._getUniformLocation(name), val);
        this._uniformValues.set(name, val);
    };
    ShaderBox.prototype.setUniform4f = function (name, val) {
        if (!this.hasUniform(name)) {
            return;
        }
        this._gl.uniform4fv(this._getUniformLocation(name), val);
        this._uniformValues.set(name, val);
    };
    ShaderBox.prototype.draw = function () {
        // tslint:disable-next-line:no-bitwise
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this._gl.drawElements(this._gl.TRIANGLES, this._opts.indices.length, this._gl.UNSIGNED_SHORT, 0);
    };
    ShaderBox.prototype.getUniformNames = function () {
        return __spread(this._uniformLocations.keys());
    };
    ShaderBox.prototype.activateTexture = function (name, unit) {
        if (!this._textures.has(name)) {
            throw Error("Unknown texture name");
        }
        var texture = this._textures.get(name);
        this._gl.activeTexture(this._gl["TEXTURE" + unit]);
        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
    };
    ShaderBox.prototype.addTexture = function (name, imageData, userOpts) {
        if (userOpts === void 0) { userOpts = {}; }
        var opts = __assign(__assign({}, defaultAddTextureOpts), userOpts);
        if (!this._textures.has(name)) {
            var texture_1 = this._gl.createTexture();
            if (!texture_1) {
                throw Error("Could not create texture");
            }
            this._textures.set(name, texture_1);
        }
        var texture = this._textures.get(name);
        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
        // Disable mipmapping
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl[opts.interpolation]);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl[opts.interpolation]);
        // Repeat
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, imageData);
    };
    ShaderBox.prototype._assertVBOExists = function (name) {
        if (!this._vbos.has(name)) {
            throw Error("Unknown VBO " + name);
        }
    };
    ShaderBox.prototype._assertUniformExists = function (name) {
        if (!this._uniformLocations.has(name)) {
            throw Error("Unknown uniform " + name);
        }
    };
    ShaderBox.prototype._getUniformLocation = function (name) {
        this._assertUniformExists(name);
        return this._uniformLocations.get(name);
    };
    return ShaderBox;
}());
export default ShaderBox;
//# sourceMappingURL=shaderbox.js.map
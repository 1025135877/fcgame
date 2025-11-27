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
import { __values } from "tslib";
// @ts-ignore
import * as dat from "dat.gui/build/dat.gui.module.js";
var gui = new dat.GUI();
export function nebula(nebula, shaderBox) {
    var e_1, _a;
    var nebulaUniforms = {};
    var nebulaF = gui.addFolder("Nebula");
    var _loop_1 = function (uniformName) {
        // `dangerMode` has special handling due to being a boolean
        if (uniformName === "dangerMode") {
            return "continue";
        }
        Object.defineProperty(nebulaUniforms, uniformName, {
            get: function () {
                return shaderBox.getUniform(uniformName)[0];
            },
            set: function (v) {
                shaderBox.setUniform1f(uniformName, v);
            }
        });
        nebulaF.add(nebulaUniforms, uniformName, 0, 10);
    };
    try {
        for (var _b = __values(shaderBox.getUniformNames()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var uniformName = _c.value;
            _loop_1(uniformName);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    nebulaF.add(nebula, "_timePeriod", 1, 100000);
}
//# sourceMappingURL=index.js.map
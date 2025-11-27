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
import { __extends } from "tslib";
// WARNING: This module is part of the main bundle. Avoid adding to it if possible.
import { Component } from "preact";
/**
 * Create a lazy-loading component.
 *
 * @param componentPromise A promise for a component class.
 */
export default function deferred(componentPromise) {
    return /** @class */ (function (_super) {
        __extends(Deferred, _super);
        function Deferred(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                LoadedComponent: undefined
            };
            componentPromise.then(function (component) {
                _this.setState({ LoadedComponent: component });
            });
            return _this;
        }
        Deferred.prototype.render = function (_a, _b) {
            var loaded = _a.loaded, loading = _a.loading;
            var LoadedComponent = _b.LoadedComponent;
            if (LoadedComponent) {
                return loaded(LoadedComponent);
            }
            return loading();
        };
        return Deferred;
    }(Component));
}
//# sourceMappingURL=index.js.map
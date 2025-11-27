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
// WARNING: This module is part of the main bundle. Avoid adding to it if possible.
var url = new URL(location.href);
export var debug = url.searchParams.has("debug");
export var noCache = url.searchParams.has("no-cache");
export var cellFocusMode = url.searchParams.has("cell-focus");
export var fpmode = url.searchParams.has("fpmode");
var forceMotionParam = url.searchParams.get("motion");
export var forceMotionMode = forceMotionParam === "0"
    ? false
    : forceMotionParam === "1"
        ? true
        : undefined;
export var vibrationLength = 300;
//# sourceMappingURL=constants.js.map
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
import { bottomBar as bottomBarStyle } from "../services/preact-canvas/components/bottom-bar/style.css";
import { topBar as topBarStyle } from "../services/preact-canvas/components/top-bar/style.css";
import toSelector from "./to-selector";
export function getCellSizes() {
    var cellPadding = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cell-padding"));
    var cellSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cell-size"));
    return { cellSize: cellSize, cellPadding: cellPadding };
}
export function getBarHeights() {
    var bottomBar = document.querySelector(toSelector(bottomBarStyle));
    var bottomBarRect = bottomBar.getBoundingClientRect();
    var bottomBarMargins = parseFloat(getComputedStyle(bottomBar).marginTop || "0") +
        parseFloat(getComputedStyle(bottomBar).marginBottom || "0");
    var bottomBarHeight = bottomBarRect.height + bottomBarMargins;
    // The top bar has a margin
    var topBar = document.querySelector(toSelector(topBarStyle));
    var topBarRect = topBar.getBoundingClientRect();
    var topBarMargins = parseFloat(getComputedStyle(topBar).marginTop || "0") +
        parseFloat(getComputedStyle(topBar).marginBottom || "0");
    var topBarHeight = topBarRect.height + topBarMargins;
    return { topBarHeight: topBarHeight, bottomBarHeight: bottomBarHeight };
}
//# sourceMappingURL=cell-sizing.js.map
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
import MinesweeperGame from "./gamelogic";
function StateChangeEventFactory(typeArg, eventInitDict) {
    var evt = new Event(typeArg, eventInitDict);
    evt.stateChange = eventInitDict.stateChange;
    Object.setPrototypeOf(evt, Event.prototype);
    return evt;
}
var StateService = /** @class */ (function () {
    function StateService() {
        this._eventTarget = new MessageChannel().port1;
    }
    StateService.prototype.initGame = function (width, height, numBombs) {
        var _this = this;
        var gameActiveChange = false;
        if (this._game) {
            this._game.unsubscribe();
        }
        else {
            gameActiveChange = true;
        }
        this._game = new MinesweeperGame(width, height, numBombs);
        if (gameActiveChange) {
            this._notify({
                game: {
                    width: width,
                    height: height,
                    mines: numBombs,
                    toRevealTotal: this._game.toReveal,
                    id: Math.random()
                }
            });
        }
        this._game.subscribe(function (stateChange) {
            _this._notify({ gameStateChange: stateChange });
        });
    };
    StateService.prototype.subscribe = function (callback) {
        this._eventTarget.addEventListener("state-update", function (event) {
            callback(event.stateChange);
        });
    };
    StateService.prototype.reset = function () {
        if (!this._game) {
            return;
        }
        this._game.unsubscribe();
        this._game = undefined;
        this._notify({ game: undefined });
    };
    StateService.prototype.restart = function () {
        if (!this._game) {
            return;
        }
        this._game.unsubscribe();
        var oldGame = this._game;
        this._game = undefined;
        this.initGame(oldGame.width, oldGame.height, oldGame.mines);
    };
    StateService.prototype.flag = function (x, y) {
        this._game.setFlag(x, y, true);
    };
    StateService.prototype.unflag = function (x, y) {
        this._game.setFlag(x, y, false);
    };
    StateService.prototype.reveal = function (x, y) {
        this._game.reveal(x, y);
    };
    StateService.prototype.revealSurrounding = function (x, y) {
        this._game.attemptSurroundingReveal(x, y);
    };
    StateService.prototype._notify = function (stateChange) {
        this._eventTarget.dispatchEvent(
        // @ts-ignore
        StateChangeEventFactory("state-update", { stateChange: stateChange }));
    };
    return StateService;
}());
export default StateService;
//# sourceMappingURL=state-service.js.map
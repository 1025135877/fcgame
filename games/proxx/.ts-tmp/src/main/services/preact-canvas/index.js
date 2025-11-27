import { __awaiter, __decorate, __extends, __generator, __values } from "tslib";
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
import workerURL from "chunk-name:./../../../worker";
import nebulaSafeDark from "consts:nebulaSafeDark";
import prerender from "consts:prerender";
import { Component, h } from "preact";
import toRGB from "src/main/utils/to-rgb";
import { bind } from "src/utils/bind";
import { isFeaturePhone } from "../../utils/static-display";
import { getGridDefault, setGridDefault } from "../state/grid-default";
import localStateSubscribe from "../state/local-state-subscribe";
import BottomBar from "./components/bottom-bar";
import deferred from "./components/deferred";
import GameLoading from "./components/game-loading";
import Intro from "./components/intro";
import { game as gameClassName, nebulaContainer } from "./style.css";
// WARNING: This module is part of the main bundle. Avoid adding to it if possible.
var lazyImport;
var lazyImportReady = import("./lazy-load").then(function (m) { return (lazyImport = m); });
var lazyComponents = new Promise(function (resolve) {
    // Prevent component CSS loading in prerender mode
    if (!prerender) {
        var lazyComponentImport_1 = import("./lazy-components");
        resolve(lazyImportReady.then(function () { return lazyComponentImport_1; }));
    }
});
var stateServicePromise = (function () { return __awaiter(void 0, void 0, void 0, function () {
    var worker, nextMessageEvent, remoteServices;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // We don't need the worker if we're prerendering
                if (prerender) {
                    // tslint:disable-next-line: no-empty
                    return [2 /*return*/, new Promise(function () { })];
                }
                worker = new Worker(workerURL);
                // @ts-ignore - iOS Safari seems to wrongly GC the worker. Throwing it to the global to prevent
                // that happening.
                self.w = worker;
                return [4 /*yield*/, lazyImportReady];
            case 1:
                _a.sent();
                nextMessageEvent = lazyImport.nextEvent(worker, "message");
                worker.postMessage("ready?");
                return [4 /*yield*/, nextMessageEvent];
            case 2:
                _a.sent();
                remoteServices = lazyImport.comlinkWrap(worker);
                return [2 /*return*/, remoteServices.stateService];
        }
    });
}); })();
var nebulaDangerDark = [40, 0, 0];
var nebulaDangerLight = [131, 23, 71];
// Looking for nebulaSafeDark? It's defined in lib/nebula-safe-dark.js
var nebulaSafeLight = [54, 49, 176];
var nebulaSettingDark = [0, 0, 0];
var nebulaSettingLight = [41, 41, 41];
// If the user tries to start a game when we aren't ready, how long do we wait before showing the
// loading screen?
var loadingScreenTimeout = 1000;
// tslint:disable-next-line:variable-name
var NebulaDeferred = deferred(lazyComponents.then(function (m) { return m.Nebula; }));
// tslint:disable-next-line:variable-name
var GameDeferred = deferred(lazyComponents.then(function (m) { return m.Game; }));
// tslint:disable-next-line:variable-name
var SettingsDeferred = deferred(lazyComponents.then(function (m) { return m.Settings; }));
var texturePromise = lazyImportReady.then(function () {
    return lazyImport.lazyGenerateTextures();
});
var gamePerquisites = texturePromise;
var immedateGameSessionKey = "instantGame";
var Root = /** @class */ (function (_super) {
    __extends(Root, _super);
    function Root() {
        var _this = _super.call(this) || this;
        _this.state = {
            dangerMode: false,
            awaitingGame: false,
            settingsOpen: false,
            motionPreference: true,
            gameInPlay: false,
            allowIntroAnim: true,
            vibrationPreference: true
        };
        _this.previousFocus = null;
        _this._gameChangeSubscribers = new Set();
        _this._awaitingGameTimeout = -1;
        getGridDefault().then(function (gridDefaults) {
            _this.setState({ gridDefaults: gridDefaults });
        });
        lazyImportReady.then(function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        lazyImport.initOffline();
                        _a = this.setState;
                        _b = {};
                        return [4 /*yield*/, lazyImport.shouldUseMotion()];
                    case 1:
                        _b.motionPreference = _c.sent();
                        return [4 /*yield*/, lazyImport.getVibrationPreference()];
                    case 2:
                        _a.apply(this, [(_b.vibrationPreference = _c.sent(),
                                _b)]);
                        return [2 /*return*/];
                }
            });
        }); });
        // Is this the reload after an update?
        var instantGameDataStr = prerender
            ? false
            : sessionStorage.getItem(immedateGameSessionKey);
        if (instantGameDataStr) {
            sessionStorage.removeItem(immedateGameSessionKey);
            _this.setState({ awaitingGame: true });
        }
        stateServicePromise.then(function (stateService) { return __awaiter(_this, void 0, void 0, function () {
            var _a, width, height, mines, usedKeyboard;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._stateService = stateService;
                        return [4 /*yield*/, localStateSubscribe(this._stateService, function (stateChange) { return __awaiter(_this, void 0, void 0, function () {
                                var game, _a, _b, playMode, _c, _d, callback;
                                var e_1, _e;
                                return __generator(this, function (_f) {
                                    switch (_f.label) {
                                        case 0: return [4 /*yield*/, lazyImportReady];
                                        case 1:
                                            _f.sent();
                                            if (!("game" in stateChange)) return [3 /*break*/, 4];
                                            game = stateChange.game;
                                            if (!game) return [3 /*break*/, 3];
                                            clearTimeout(this._awaitingGameTimeout);
                                            setGridDefault(game.width, game.height, game.mines);
                                            _a = this.setState;
                                            _b = {
                                                game: game,
                                                awaitingGame: false,
                                                gridDefaults: game,
                                                gameInPlay: true
                                            };
                                            return [4 /*yield*/, lazyImport.getBestTime(game.width, game.height, game.mines)];
                                        case 2:
                                            _a.apply(this, [(_b.bestTime = _f.sent(),
                                                    _b.allowIntroAnim = false,
                                                    _b)]);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            this.setState({ game: game, gameInPlay: false });
                                            _f.label = 4;
                                        case 4:
                                            if ("gameStateChange" in stateChange) {
                                                playMode = stateChange.gameStateChange.playMode;
                                                if (playMode === 2 /* Lost */ || playMode === 3 /* Won */) {
                                                    this.setState({ gameInPlay: false });
                                                }
                                                try {
                                                    for (_c = __values(this._gameChangeSubscribers), _d = _c.next(); !_d.done; _d = _c.next()) {
                                                        callback = _d.value;
                                                        callback(stateChange.gameStateChange);
                                                    }
                                                }
                                                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                                finally {
                                                    try {
                                                        if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                                                    }
                                                    finally { if (e_1) throw e_1.error; }
                                                }
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        if (!instantGameDataStr) return [3 /*break*/, 3];
                        return [4 /*yield*/, gamePerquisites];
                    case 2:
                        _b.sent();
                        _a = JSON.parse(instantGameDataStr), width = _a.width, height = _a.height, mines = _a.mines, usedKeyboard = _a.usedKeyboard;
                        if (!usedKeyboard) {
                            // This is a horrible hack to tell focus-visible.js not to initially show focus styles.
                            document.body.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
                        }
                        this._stateService.initGame(width, height, mines);
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return _this;
    }
    Root.prototype.componentDidMount = function () {
        if (prerender) {
            prerenderDone();
        }
    };
    Root.prototype.render = function (_, _a) {
        var _this = this;
        var game = _a.game, dangerMode = _a.dangerMode, awaitingGame = _a.awaitingGame, gridDefaults = _a.gridDefaults, settingsOpen = _a.settingsOpen, motionPreference = _a.motionPreference, gameInPlay = _a.gameInPlay, bestTime = _a.bestTime, allowIntroAnim = _a.allowIntroAnim, vibrationPreference = _a.vibrationPreference;
        var mainComponent;
        if (!game) {
            if (awaitingGame) {
                mainComponent = h(GameLoading, null);
            }
            else {
                mainComponent = settingsOpen ? (h(SettingsDeferred, { loading: function () { return h("div", null); }, 
                    // tslint:disable-next-line: variable-name
                    loaded: function (Settings) { return (h(Settings, { onCloseClicked: _this._onSettingsCloseClick, motion: motionPreference, onMotionPrefChange: _this._onMotionPrefChange, disableAnimationBtn: !lazyImport.supportsSufficientWebGL || isFeaturePhone, supportsSufficientWebGL: lazyImport.supportsSufficientWebGL, texturePromise: texturePromise, useVibration: vibrationPreference, onVibrationPrefChange: _this._onVibrationPrefChange })); } })) : (h(Intro, { onStartGame: this._onStartGame, defaults: prerender ? undefined : gridDefaults, motion: motionPreference && allowIntroAnim }));
            }
        }
        else {
            mainComponent = (h(GameDeferred, { loading: function () { return h("div", null); }, 
                // tslint:disable-next-line: variable-name
                loaded: function (Game) { return (h(Game, { key: game.id, width: game.width, height: game.height, mines: game.mines, toRevealTotal: game.toRevealTotal, gameChangeSubscribe: _this._onGameChangeSubscribe, gameChangeUnsubscribe: _this._onGameChangeUnsubscribe, stateService: _this._stateService, dangerMode: dangerMode, onDangerModeChange: _this._onDangerModeChange, useMotion: motionPreference, bestTime: bestTime, useVibration: vibrationPreference })); } }));
        }
        return (h("div", { class: gameClassName },
            h(NebulaDeferred, { loading: function () { return (h("div", { class: nebulaContainer, style: {
                        background: "linear-gradient(to bottom, " + toRGB(nebulaSafeLight) + ", " + toRGB(nebulaSafeDark) + ")"
                    } })); }, 
                // tslint:disable-next-line: variable-name
                loaded: function (Nebula) { return (h(Nebula, { colorDark: _this._nebulaDarkColor(), colorLight: _this._nebulaLightColor(), useMotion: motionPreference })); } }),
            mainComponent,
            h(BottomBar, { onSettingsClick: this._onSettingsClick, onBackClick: this._onBackClick, onDangerModeChange: this._onDangerModeChange, buttonType: game ? "back" : "info", display: !settingsOpen, dangerMode: dangerMode, showDangerModeToggle: gameInPlay })));
    };
    Root.prototype._nebulaLightColor = function () {
        if (this.state.settingsOpen) {
            return nebulaSettingLight;
        }
        if (!this.state.game) {
            return nebulaSafeLight;
        }
        if (this.state.dangerMode) {
            return nebulaDangerLight;
        }
        return nebulaSafeLight;
    };
    Root.prototype._nebulaDarkColor = function () {
        if (this.state.settingsOpen) {
            return nebulaSettingDark;
        }
        if (!this.state.game) {
            return nebulaSafeDark;
        }
        if (this.state.dangerMode) {
            return nebulaDangerDark;
        }
        return nebulaSafeDark;
    };
    Root.prototype._onMotionPrefChange = function () {
        return __awaiter(this, void 0, void 0, function () {
            var motionPreference, setMotionPreference;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        motionPreference = !this.state.motionPreference;
                        this.setState({ motionPreference: motionPreference });
                        return [4 /*yield*/, lazyImportReady];
                    case 1:
                        setMotionPreference = (_a.sent()).setMotionPreference;
                        setMotionPreference(motionPreference);
                        return [2 /*return*/];
                }
            });
        });
    };
    Root.prototype._onVibrationPrefChange = function () {
        return __awaiter(this, void 0, void 0, function () {
            var vibrationPreference, setVibrationPreference;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vibrationPreference = !this.state.vibrationPreference;
                        this.setState({ vibrationPreference: vibrationPreference });
                        return [4 /*yield*/, lazyImportReady];
                    case 1:
                        setVibrationPreference = (_a.sent()).setVibrationPreference;
                        setVibrationPreference(vibrationPreference);
                        return [2 /*return*/];
                }
            });
        });
    };
    Root.prototype._onDangerModeChange = function (dangerMode) {
        this.setState({ dangerMode: dangerMode });
    };
    Root.prototype._onGameChangeSubscribe = function (func) {
        this._gameChangeSubscribers.add(func);
    };
    Root.prototype._onGameChangeUnsubscribe = function (func) {
        this._gameChangeSubscribers.delete(func);
    };
    Root.prototype._onSettingsCloseClick = function () {
        var _this = this;
        this.setState({ settingsOpen: false }, function () {
            _this.previousFocus.focus();
        });
    };
    Root.prototype._onSettingsClick = function () {
        this.previousFocus = document.activeElement;
        this.setState({ settingsOpen: true, allowIntroAnim: false });
    };
    Root.prototype._onStartGame = function (width, height, mines) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, updateReady, skipWaiting, usedKeyboard, stateService;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._awaitingGameTimeout = setTimeout(function () {
                            _this.setState({ awaitingGame: true });
                        }, loadingScreenTimeout);
                        return [4 /*yield*/, lazyImportReady];
                    case 1:
                        _a = _b.sent(), updateReady = _a.updateReady, skipWaiting = _a.skipWaiting;
                        if (!updateReady) return [3 /*break*/, 3];
                        // There's an update available. Let's load it as part of starting the game…
                        return [4 /*yield*/, skipWaiting()];
                    case 2:
                        // There's an update available. Let's load it as part of starting the game…
                        _b.sent();
                        usedKeyboard = !!document.querySelector(".focus-visible");
                        sessionStorage.setItem(immedateGameSessionKey, JSON.stringify({ width: width, height: height, mines: mines, usedKeyboard: usedKeyboard }));
                        location.reload();
                        return [2 /*return*/];
                    case 3: 
                    // Wait for everything to be ready:
                    return [4 /*yield*/, gamePerquisites];
                    case 4:
                        // Wait for everything to be ready:
                        _b.sent();
                        return [4 /*yield*/, stateServicePromise];
                    case 5:
                        stateService = _b.sent();
                        stateService.initGame(width, height, mines);
                        return [2 /*return*/];
                }
            });
        });
    };
    Root.prototype._onBackClick = function () {
        this.setState({ dangerMode: false });
        this._stateService.reset();
    };
    __decorate([
        bind
    ], Root.prototype, "_onMotionPrefChange", null);
    __decorate([
        bind
    ], Root.prototype, "_onVibrationPrefChange", null);
    __decorate([
        bind
    ], Root.prototype, "_onDangerModeChange", null);
    __decorate([
        bind
    ], Root.prototype, "_onGameChangeSubscribe", null);
    __decorate([
        bind
    ], Root.prototype, "_onGameChangeUnsubscribe", null);
    __decorate([
        bind
    ], Root.prototype, "_onSettingsCloseClick", null);
    __decorate([
        bind
    ], Root.prototype, "_onSettingsClick", null);
    __decorate([
        bind
    ], Root.prototype, "_onStartGame", null);
    __decorate([
        bind
    ], Root.prototype, "_onBackClick", null);
    return Root;
}(Component));
export default Root;
//# sourceMappingURL=index.js.map
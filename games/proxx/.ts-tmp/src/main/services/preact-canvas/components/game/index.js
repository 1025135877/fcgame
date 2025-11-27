import { __awaiter, __decorate, __extends, __generator, __read } from "tslib";
import { Component, h } from "preact";
import { submitTime } from "src/main/services/state/best-times";
import { supportsVibration } from "src/main/services/state/vibration-preference";
import { vibrationLength } from "src/main/utils/constants";
import { isFeaturePhone } from "src/main/utils/static-display";
import { bind } from "src/utils/bind";
import initFocusHandling from "../../../../utils/focus-visible";
import Board from "../board";
import TopBar from "../top-bar";
import Win from "../win";
import { againButton, againShortcutKey, exitRow, exitRowInner, game as gameClass, mainButton, shortcutKey } from "./style.css";
// The second this file is loaded, activate focus handling
initFocusHandling();
var Game = /** @class */ (function (_super) {
    __extends(Game, _super);
    function Game(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            playMode: 0 /* Pending */,
            toReveal: props.toRevealTotal,
            startTime: 0,
            completeTime: 0,
            bestTime: 0,
            endTime: 0
        };
        _this._init();
        return _this;
    }
    Game.prototype.render = function (_a, _b) {
        var _this = this;
        var dangerMode = _a.dangerMode, width = _a.width, height = _a.height, mines = _a.mines, gameChangeSubscribe = _a.gameChangeSubscribe, gameChangeUnsubscribe = _a.gameChangeUnsubscribe, toRevealTotal = _a.toRevealTotal, useMotion = _a.useMotion, previousBestTime = _a.bestTime;
        var playMode = _b.playMode, toReveal = _b.toReveal, animator = _b.animator, renderer = _b.renderer, completeTime = _b.completeTime, bestTime = _b.bestTime;
        var timerRunning = playMode === 1 /* Playing */;
        return (h("div", { class: gameClass },
            h(TopBar, { timerRunning: timerRunning, toReveal: toReveal, toRevealTotal: toRevealTotal, playMode: playMode, useMotion: useMotion, bestTime: previousBestTime, showBestTime: playMode === 0 /* Pending */ }),
            playMode === 3 /* Won */ ? (h(Win, { onMainMenu: this.onReset, onRestart: this.onRestart, time: completeTime, bestTime: bestTime, width: width, height: height, mines: mines, useMotion: this.props.useMotion })) : renderer && animator ? ([
                h(Board, { width: width, height: height, dangerMode: dangerMode, animator: animator, renderer: renderer, gameChangeSubscribe: gameChangeSubscribe, gameChangeUnsubscribe: gameChangeUnsubscribe, onCellClick: this.onCellClick, onDangerModeChange: this.props.onDangerModeChange }),
                playMode === 2 /* Lost */ ? (h("div", { class: exitRow },
                    h("div", { class: exitRowInner },
                        h("button", { class: againButton, onClick: this.onRestart, ref: function (el) { return (_this._tryAgainBtn = el); } },
                            isFeaturePhone && (h("span", { class: [shortcutKey, againShortcutKey].join(" ") }, "#")),
                            " ",
                            "Try again"),
                        h("button", { class: mainButton, onClick: this.onReset },
                            isFeaturePhone ? h("span", { class: shortcutKey }, "*") : "",
                            " ",
                            "Main menu")))) : (undefined)
            ]) : (h("div", null))));
    };
    Game.prototype.componentDidMount = function () {
        this.props.gameChangeSubscribe(this.onGameChange);
        if (!this.props.dangerMode) {
            this.props.onDangerModeChange(true);
        }
        window.addEventListener("keyup", this.onKeyUp);
    };
    Game.prototype.componentWillUnmount = function () {
        this.props.gameChangeUnsubscribe(this.onGameChange);
        window.removeEventListener("keyup", this.onKeyUp);
    };
    Game.prototype.componentDidUpdate = function (_, previousState) {
        if (this.state.playMode === 2 /* Lost */ &&
            previousState.playMode !== 2 /* Lost */ &&
            this._tryAgainBtn) {
            this._tryAgainBtn.focus();
            if (this.props.useVibration && supportsVibration) {
                navigator.vibrate(vibrationLength);
            }
        }
    };
    Game.prototype._init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var renderer, animator, _a, RendererClass, AnimatorClass, _b, RendererClass, AnimatorClass;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.props.useMotion) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all([
                                import("src/main/rendering/webgl-renderer").then(function (m) { return m.default; }),
                                import("src/main/rendering/motion-animator").then(function (m) { return m.default; })
                            ])];
                    case 1:
                        _a = __read.apply(void 0, [_c.sent(), 2]), RendererClass = _a[0], AnimatorClass = _a[1];
                        renderer = new RendererClass();
                        animator = new AnimatorClass(this.props.width, this.props.height, renderer);
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, Promise.all([
                            import("src/main/rendering/canvas-2d-renderer").then(function (m) { return m.default; }),
                            import("src/main/rendering/no-motion-animator").then(function (m) { return m.default; })
                        ])];
                    case 3:
                        _b = __read.apply(void 0, [_c.sent(), 2]), RendererClass = _b[0], AnimatorClass = _b[1];
                        renderer = new RendererClass();
                        animator = new AnimatorClass(this.props.width, this.props.height, renderer);
                        _c.label = 4;
                    case 4:
                        this.setState({ renderer: renderer, animator: animator });
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.onKeyUp = function (event) {
        if (event.key === "#") {
            if (this.state.playMode === 2 /* Lost */) {
                this.onRestart();
            }
        }
        else if (event.key === "*") {
            this.onReset();
        }
    };
    Game.prototype.onReset = function () {
        this.props.stateService.reset();
    };
    Game.prototype.onRestart = function () {
        this.props.stateService.restart();
    };
    Game.prototype.onGameChange = function (gameChange) {
        return __awaiter(this, void 0, void 0, function () {
            var newState, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        newState = {};
                        if (!("playMode" in gameChange &&
                            this.state.playMode !== gameChange.playMode)) return [3 /*break*/, 3];
                        newState.playMode = gameChange.playMode;
                        if (!(gameChange.playMode === 1 /* Playing */)) return [3 /*break*/, 1];
                        newState.startTime = Date.now();
                        return [3 /*break*/, 3];
                    case 1:
                        if (!(gameChange.playMode === 3 /* Won */)) return [3 /*break*/, 3];
                        newState.completeTime = Date.now() - this.state.startTime;
                        _a = newState;
                        return [4 /*yield*/, submitTime(this.props.width, this.props.height, this.props.mines, newState.completeTime)];
                    case 2:
                        _a.bestTime = _b.sent();
                        this.props.onDangerModeChange(false);
                        _b.label = 3;
                    case 3:
                        if ("toReveal" in gameChange &&
                            this.state.toReveal !== gameChange.toReveal) {
                            newState.toReveal = gameChange.toReveal;
                        }
                        if (Object.keys(newState).length) {
                            this.setState(newState);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.onCellClick = function (cellData, alt) {
        if (this.state.playMode !== 0 /* Pending */ &&
            this.state.playMode !== 1 /* Playing */) {
            return;
        }
        var _a = __read(cellData, 3), x = _a[0], y = _a[1], cell = _a[2];
        var dangerMode = this.props.dangerMode;
        if (alt) {
            dangerMode = !dangerMode;
        }
        if (!cell.revealed) {
            if (!dangerMode) {
                if (cell.flagged) {
                    this.props.stateService.unflag(x, y);
                }
                else {
                    this.props.stateService.flag(x, y);
                }
            }
            else if (!cell.flagged) {
                this.props.stateService.reveal(x, y);
            }
        }
        else if (cell.touchingFlags >= cell.touchingMines) {
            this.props.stateService.revealSurrounding(x, y);
        }
    };
    __decorate([
        bind
    ], Game.prototype, "onKeyUp", null);
    __decorate([
        bind
    ], Game.prototype, "onReset", null);
    __decorate([
        bind
    ], Game.prototype, "onRestart", null);
    __decorate([
        bind
    ], Game.prototype, "onGameChange", null);
    __decorate([
        bind
    ], Game.prototype, "onCellClick", null);
    return Game;
}(Component));
export default Game;
//# sourceMappingURL=index.js.map
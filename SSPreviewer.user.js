// ==UserScript==
// @name        SSPreviewer (beta)
// @namespace   11powder
// @description 七海で色々なプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @version     0.1.017
// @grant       none
// ==/UserScript==
//
// !!!:第二回更新時に向けてのチェックリスト。現在は暫定的な仕様のため実際の動作と異なる可能性がある
// 日記/メッセージ/台詞の正確なフォーマット
// 改行の変更後の仕様を要確認。
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("lib/ss/profile", ["require", "exports"], function (require, exports) {
    "use strict";
    var Profile = (function () {
        function Profile(c) {
            if (c) {
                this.iconURLArray = c.iconURLArray;
                this.nickname = c.nickname;
                this.nameColor = c.nameColor;
            }
            else {
                this.iconURLArray = Profile.LoadIconURLArray();
                this.nickname = Profile.LoadNickname();
                this.nameColor = Profile.LoadNameColor();
            }
        }
        Profile.prototype.SaveIconURLArray = function (overwriteWith) {
            if (overwriteWith !== undefined) {
                this.iconURLArray = overwriteWith;
            }
            Profile.SaveIconURLArray(this.iconURLArray);
            return this;
        };
        Profile.prototype.SaveNickname = function (overwriteWith) {
            if (overwriteWith !== undefined) {
                this.nickname = overwriteWith;
            }
            Profile.SaveNickname(this.nickname);
            return this;
        };
        Profile.prototype.SaveNameColor = function (overwriteWith) {
            if (overwriteWith !== undefined) {
                this.nameColor = overwriteWith;
            }
            Profile.SaveNameColor(this.nickname);
            return this;
        };
        Profile.LoadIconURLArray = function () {
            var json = localStorage.getItem("SSPreview_IconURLArray");
            if (json === null) {
                return [];
            }
            return JSON.parse(json);
        };
        Profile.SaveIconURLArray = function (iconURLArray) {
            localStorage.setItem("SSPreview_IconURLArray", JSON.stringify(iconURLArray));
        };
        Profile.LoadNickname = function () {
            var name = localStorage.getItem("SSPreview_Nickname");
            if (name === null) {
                return "(名称)";
            }
            return name;
        };
        Profile.SaveNickname = function (nickname) {
            localStorage.setItem("SSPreview_Nickname", nickname);
        };
        Profile.LoadNameColor = function () {
            var color = localStorage.getItem("SSPreview_NameColor");
            if (color === null) {
                return "";
            }
            return color;
        };
        Profile.SaveNameColor = function (nameColor) {
            localStorage.setItem("SSPreview_NameColor", nameColor);
        };
        return Profile;
    }());
    exports.Profile = Profile;
});
define("lib/ss/page", ["require", "exports"], function (require, exports) {
    "use strict";
    var Page = (function () {
        function Page(profile, initializer) {
            this.profile = profile;
            this.initializer = initializer;
        }
        Page.prototype.Init = function (profile) {
            this.initializer(profile);
        };
        Object.defineProperty(Page.prototype, "Settings", {
            get: function () {
                return this.profile;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "Initializer", {
            get: function () {
                return this.initializer;
            },
            enumerable: true,
            configurable: true
        });
        return Page;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Page;
});
define("lib/ss/pageConfig", ["require", "exports"], function (require, exports) {
    "use strict";
    var PageConfig = (function () {
        function PageConfig() {
        }
        Object.defineProperty(PageConfig, "pathnameToPage", {
            get: function () {
                return {
                    "/d/mainaction.aspx": PageConfig.MainPage,
                    "/d/pbbs.aspx": PageConfig.PartyBBS,
                    "/d/tradeaction.aspx": PageConfig.Trade,
                    "/d/strgsaction.aspx": PageConfig.Reinforcement,
                    "/d/battle.aspx": PageConfig.BattleSettings,
                    "/d/battlemessage.aspx": PageConfig.BattleWords,
                    "/d/messageaction.aspx": PageConfig.Message,
                    "/d/commesaction.aspx": PageConfig.GroupMessage,
                    "/d/chara.aspx": PageConfig.CharacterSettings,
                    "/d/com.aspx": PageConfig.Community,
                };
            },
            enumerable: true,
            configurable: true
        });
        PageConfig.RunInitializer = function (profile, location) {
            if (this.Common) {
                this.Common.Init(profile);
            }
            var path = location.pathname;
            if (PageConfig.pathnameToPage.hasOwnProperty(path) && PageConfig.pathnameToPage[path]) {
                PageConfig.pathnameToPage[path].Init(profile);
            }
        };
        return PageConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = PageConfig;
});
define("lib/util/jquery/customEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    var Event = (function () {
        function Event(name, callback) {
            var _this = this;
            this.name = name;
            this.callback = callback;
            this._wrappedCallback = function (e) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (_this.callback) {
                    _this.callback(e, args);
                }
                $(_this).triggerHandler(_this.name);
            };
            // code...
        }
        Object.defineProperty(Event.prototype, "Name", {
            get: function () {
                return this.name;
            },
            enumerable: true,
            configurable: true
        });
        Event.prototype.RegisterEvent = function (arg, eventType) {
            if (arg instanceof jQuery) {
                this.evts = [{ target: arg, eventType: eventType }];
            }
            else {
                this.evts = arg;
            }
            for (var _i = 0, _a = this.evts; _i < _a.length; _i++) {
                var evt = _a[_i];
                $(evt.target).on(evt.eventType, this._wrappedCallback);
            }
            return this;
        };
        Event.prototype.UnregisterEvent = function (arg, eventType) {
            var currentEvts = this.evts;
            if (arg === undefined) {
                // no args
                for (var _i = 0, currentEvts_1 = currentEvts; _i < currentEvts_1.length; _i++) {
                    var evt = currentEvts_1[_i];
                    $(evt.target).off(evt.eventType, this._wrappedCallback);
                }
                this.evts = [];
                return this;
            }
            var seekedEvts;
            if (arg instanceof jQuery) {
                seekedEvts = [{ target: arg, eventType: eventType }];
            }
            else {
                seekedEvts = arg;
            }
            // 'Set' object needs es6-
            var newEvts = [];
            var removedEvts = [];
            for (var eri = currentEvts.length - 1; eri >= 0; eri--) {
                for (var sri = seekedEvts.length - 1; sri >= 0; sri--) {
                    var e = currentEvts[eri];
                    var se = seekedEvts[sri];
                    if (se.target.is(e.target)) {
                        removedEvts.push(e);
                        break;
                    }
                    if (sri === 0) {
                        newEvts.push(e);
                    }
                }
            }
            for (var _a = 0, removedEvts_1 = removedEvts; _a < removedEvts_1.length; _a++) {
                var evt = removedEvts_1[_a];
                $(evt.target).off(evt.eventType, this._wrappedCallback);
            }
            this.evts = newEvts;
            return this;
        };
        Event.prototype.Dispose = function () {
            this.UnregisterEvent();
        };
        return Event;
    }());
    exports.Event = Event;
});
define("lib/util/jquery/replaceTo", ["require", "exports"], function (require, exports) {
    "use strict";
    // replaceWithとは異なり、戻り値は置換先オブジェクト
    function replaceTo(from, to) {
        var $to = $(to);
        $(from).replaceWith($to);
        return $to;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = replaceTo;
});
define("lib/util/timer/timer", ["require", "exports"], function (require, exports) {
    "use strict";
    // start, stop, resetTime, time
    var Timer = (function () {
        function Timer() {
            this.date_start = 0;
            this.time_ms = 0;
            this.resetTimeWhenStarting = false;
        }
        Object.defineProperty(Timer.prototype, "Time_ms", {
            get: function () {
                return this.time_ms + Date.now() - this.date_start;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Timer.prototype, "isRunning", {
            get: function () {
                return !!this.date_start;
            },
            enumerable: true,
            configurable: true
        });
        Timer.prototype.Start = function () {
            if (this.isRunning && !this.resetTimeWhenStarting) {
                return;
            }
            if (this.resetTimeWhenStarting) {
                this.ResetTime();
            }
            this.date_start = Date.now();
            return this;
        };
        Timer.prototype.Stop = function () {
            return this.Pause().ResetTime();
        };
        Timer.prototype.Pause = function () {
            if (!this.isRunning) {
                return;
            }
            this.time_ms += Date.now() - this.date_start;
            this.date_start = 0;
            return this;
        };
        Timer.prototype.ResetTime = function () {
            if (this.isRunning) {
                this.date_start = Date.now();
            }
            else {
                this.date_start = 0;
            }
            this.time_ms = 0;
            return this;
        };
        Timer.prototype.PrintTime = function () {
            console.log("time(ms): " + this.Time_ms);
            return this;
        };
        return Timer;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Timer;
});
define("lib/util/timer/timerEvent", ["require", "exports", "lib/util/timer/timer"], function (require, exports, timer_1) {
    "use strict";
    var TimerEvent = (function (_super) {
        __extends(TimerEvent, _super);
        function TimerEvent(afterPeriod, period_ms) {
            _super.call(this);
            this.afterPeriod = afterPeriod;
            this.period_ms = period_ms;
            this.id = 0;
        }
        TimerEvent.prototype.setCallbackArg = function (a) {
            if (a === undefined) {
                return;
            }
            this.callbackArg = a;
        };
        TimerEvent.prototype.Start = function (callbackArg) {
            this.setCallbackArg(callbackArg);
            if (!this.isRunning) {
                var period_ms = this.period_ms - this.time_ms;
                if (period_ms < 0) {
                    period_ms = 0;
                }
                this.id = setTimeout(this.afterPeriod, period_ms, callbackArg);
            }
            _super.prototype.Start.call(this);
            return this;
        };
        TimerEvent.prototype.Stop = function (callsCallback, newCallbackArg) {
            if (callsCallback === void 0) { callsCallback = false; }
            if (callsCallback) {
                this.setCallbackArg(newCallbackArg);
                this.afterPeriod((newCallbackArg === undefined ? this.callbackArg : newCallbackArg));
            }
            return this.Pause().ResetTime();
        };
        TimerEvent.prototype.Pause = function () {
            if (!this.isRunning) {
                return;
            }
            clearTimeout(this.id);
            this.id = 0;
            _super.prototype.Pause.call(this);
            return this;
        };
        TimerEvent.prototype.ResetTime = function (newCallbackArg) {
            this.setCallbackArg(newCallbackArg);
            if (this.isRunning) {
                clearTimeout(this.id);
                this.id = setTimeout(this.afterPeriod, this.period_ms, (newCallbackArg === undefined ? this.callbackArg : newCallbackArg));
            }
            _super.prototype.ResetTime.call(this);
            return this;
        };
        return TimerEvent;
    }(timer_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TimerEvent;
});
define("lib/preview", ["require", "exports", "lib/util/jquery/customEvent", "lib/util/jquery/replaceTo", "lib/util/timer/timerEvent"], function (require, exports, customEvent_1, replaceTo_1, timerEvent_1) {
    "use strict";
    (function (InsertionMode) {
        InsertionMode[InsertionMode["InsertAfter"] = 0] = "InsertAfter";
        InsertionMode[InsertionMode["InsertBefore"] = 1] = "InsertBefore";
        InsertionMode[InsertionMode["AppendTo"] = 2] = "AppendTo";
        InsertionMode[InsertionMode["PrependTo"] = 3] = "PrependTo";
    })(exports.InsertionMode || (exports.InsertionMode = {}));
    var InsertionMode = exports.InsertionMode;
    var Preview = (function () {
        function Preview(arg) {
            var _this = this;
            this.isDisabled = false;
            this._eventCallback = function (eventObject) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (_this.isDisabled) {
                    return false;
                }
                _this.timerEvt.Start();
                return true;
            };
            this.onUpdate = new customEvent_1.Event("updatePreview", this._eventCallback);
            this.insTarget = arg.insTarget;
            this.insMode = arg.insMode;
            this._delay_ms = arg.delay_ms || Preview._DEFAULT_DELAY_MS;
            this.timerEvt = new timerEvent_1.default(function () { _this.Update(); }, this._delay_ms);
            this.timerEvt.resetTimeWhenStarting = true;
        }
        Object.defineProperty(Preview.prototype, "Delay_ms", {
            get: function () {
                return this._delay_ms;
            },
            set: function (n) {
                this._delay_ms = n;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Preview.prototype, "IsDisabled", {
            get: function () {
                return this.isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        Preview.prototype.Pause = function () {
            this.isDisabled = true;
            return this;
        };
        Preview.prototype.Disable = function () {
            this.isDisabled = true;
            return this.Hide();
        };
        Preview.prototype.Enable = function () {
            this.isDisabled = false;
            return this.Update();
        };
        Object.defineProperty(Preview.prototype, "OnUpdate", {
            get: function () {
                return this.onUpdate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Preview.prototype, "PreviewElement", {
            get: function () {
                return this.preview;
            },
            enumerable: true,
            configurable: true
        });
        Preview.prototype.InsertPreview = function (newHtml) {
            var $preview = $(newHtml);
            this.preview = $preview[0];
            switch (this.insMode) {
                case InsertionMode.InsertAfter:
                    $preview.insertAfter(this.insTarget);
                    break;
                case InsertionMode.InsertBefore:
                    $preview.insertBefore(this.insTarget);
                    break;
                case InsertionMode.AppendTo:
                    $preview.appendTo(this.insTarget);
                    break;
                case InsertionMode.PrependTo:
                    $preview.prependTo(this.insTarget);
                    break;
                default:
                    throw new Error("InsertionMode指定エラー");
            }
            return this;
        };
        Preview.prototype.OverwritePreview = function (newHtml) {
            if (this.preview) {
                this.preview = replaceTo_1.default(this.preview, newHtml)[0];
            }
            else {
                this.InsertPreview(newHtml);
            }
            return this;
        };
        Preview.prototype.Show = function () {
            return this.Update();
        };
        Preview.prototype.Hide = function () {
            $(this.preview).hide();
            return this;
        };
        Preview.prototype.Dispose = function () {
            this.onUpdate.Dispose();
            this.Disable().Hide();
        };
        Preview._DEFAULT_DELAY_MS = 0;
        return Preview;
    }());
    exports.Preview = Preview;
});
define("lib/util/string/format", ["require", "exports"], function (require, exports) {
    "use strict";
    function format(template, args) {
        if (template === null || template === undefined) {
            return template;
        }
        var s = "" + template;
        for (var label in args) {
            if (args[label] === undefined && args[label] === null) {
                continue;
            }
            s = s.replace(new RegExp("\{" + label + "\}", "g"), "" + args[label]);
        }
        return s;
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = format;
});
define("lib/util/string/replaceLoop", ["require", "exports"], function (require, exports) {
    "use strict";
    function replaceLoop(searchTarget, searchValue, replaceTo) {
        if (searchTarget === null || searchTarget === undefined) {
            return searchTarget;
        }
        var strTarget = "" + searchTarget;
        if (typeof searchValue === "string") {
            for (;;) {
                if (strTarget.indexOf(searchValue) === -1) {
                    return strTarget;
                }
                strTarget = strTarget.replace(searchValue, replaceTo);
            }
        }
        // searchValue: RegExp
        for (;;) {
            if (!searchValue.test(strTarget)) {
                return strTarget;
            }
            strTarget = strTarget.replace(searchValue, replaceTo);
        }
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = replaceLoop;
});
define("lib/util/html/escape", ["require", "exports"], function (require, exports) {
    "use strict";
    var escapeMap = {
        "&": "&amp;",
        "'": "&#x27;",
        "`": "&#x60;",
        "\"": "&quot;",
        "<": "&lt;",
        ">": "&gt;"
    };
    var escapeRegex = new RegExp("[" + Object.keys(escapeMap).join("") + "]", "g");
    function escape(s, findPattern, regexFlags) {
        if (s === undefined || s === null) {
            return s;
        }
        if (findPattern === undefined || findPattern === null) {
            return s.replace(escapeRegex, function (match) { return escapeMap[match]; });
        }
        return s.replace(new RegExp(findPattern, regexFlags), function (match) { return escape(match); });
    }
    exports.escape = escape;
    var unescapeMap = {};
    for (var _i = 0, _a = Object.keys(escapeMap); _i < _a.length; _i++) {
        var k = _a[_i];
        unescapeMap[escapeMap[k]] = k;
    }
    var unescapeRegex = new RegExp("(?:" + Object.keys(unescapeMap).join("|") + ")", "g");
    function unescape(s, findPattern, regexFlags) {
        if (s === undefined || s === null) {
            return s;
        }
        if (findPattern === undefined || findPattern === null) {
            return s.replace(unescapeRegex, function (match) { return unescapeMap[match]; });
        }
        return s.replace(new RegExp(escape(findPattern), regexFlags), function (match) { return unescape(match); });
    }
    exports.unescape = unescape;
});
define("lib/util/html/tag", ["require", "exports"], function (require, exports) {
    "use strict";
    function lineBreaksToBR(html) {
        return html.replace(/(?:\r\n|\r|\n)/g, "<BR>");
    }
    exports.lineBreaksToBR = lineBreaksToBR;
});
define("lib/ss/expr/parser", ["require", "exports"], function (require, exports) {
    "use strict";
    var ParsedExpr = (function () {
        function ParsedExpr(arg) {
            this.enableAt3Mode = arg.enableAt3Mode;
            this.iconNumber = arg.iconNumber;
            this.text = arg.text;
            this.changedName = arg.hasOwnProperty("changedName") ? arg.changedName : null;
        }
        Object.defineProperty(ParsedExpr.prototype, "EnableAt3Mode", {
            get: function () {
                return this.enableAt3Mode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParsedExpr.prototype, "Text", {
            get: function () {
                return this.text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParsedExpr.prototype, "IconNumber", {
            get: function () {
                return this.iconNumber;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParsedExpr.prototype, "ChangedName", {
            get: function () {
                return this.changedName;
            },
            enumerable: true,
            configurable: true
        });
        return ParsedExpr;
    }());
    var Parser = (function () {
        function Parser() {
        }
        Parser.Parse = function (source, at3ModeAsDefault) {
            // source: /\d+/,       capture: 5n + [-4:undefined, -3:undefined, -2:iundefined, -1:iconNum  , 0: bodyText]
            // source: @@@,         capture: 5n + [-4:@@@,       -3:undefined, -2:undefined,  -1:undefined, 0: bodyText]
            // source: @@@/\d+/,    capture: 5n + [-4:@@@,       -3:undefined, -2:iconNum,    -1:undefined, 0: bodyText]
            // source: @name@,      capture: 5n + [-4:@name@,    -3:name,      -2:undefined,  -1:undefined, 0: bodyText]
            // source: @name@/\d+/, capture: 5n + [-4:@name@,    -3:name,      -2:iconNum,    -1:undefined, 0: bodyText]
            var defaultIconNumber = at3ModeAsDefault ? -1 : 0;
            // @name@周りの正規表現が複雑なのはname部分にアイコンタグ/\d+/を入れ子にされるのを防止するため。
            // /1/を先にsplitしてから@@@をsplitするように、二段階で処理する方法よりこっちの方が変更実装が楽だった。
            // これ以上手を加える場合は正規表現を簡単にして段階式にsplitする方法を採用すべき
            var texts = source.split(/(?:(@@@|@((?![^<@]*\/\d+\/)[^<@]+)@)(?:\/(\d+)\/)?|\/(\d+)\/)/g);
            if (texts.length === 1) {
                return [new ParsedExpr({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: source })];
            }
            var exps = [];
            for (var ti = 0, tiEnd = texts.length; ti < tiEnd; ti += 5) {
                var text = texts[ti];
                if (ti === 0) {
                    if (text !== "") {
                        exps.push(new ParsedExpr({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: texts[ti] }));
                    }
                    continue;
                }
                var changedName = null;
                var enableAt3Mode = at3ModeAsDefault;
                var strIconNumber = void 0;
                if (texts[ti - 4] === undefined) {
                    // /\d/
                    strIconNumber = texts[ti - 1];
                }
                else if (texts[ti - 4] === "@@@") {
                    // @@@ or @@@/\d/
                    strIconNumber = texts[ti - 2];
                    enableAt3Mode = true;
                }
                else {
                    // @changedName@ or @changedName@/\d/
                    strIconNumber = texts[ti - 2];
                    changedName = texts[ti - 3];
                    enableAt3Mode = false;
                }
                var iconNumber = enableAt3Mode ? -1 : 0;
                if (strIconNumber !== undefined) {
                    iconNumber = parseInt(strIconNumber);
                }
                exps.push(new ParsedExpr({
                    enableAt3Mode: enableAt3Mode, changedName: changedName, iconNumber: iconNumber, text: text
                }));
            }
            return exps;
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
define("lib/ss/expr/formatter", ["require", "exports", "lib/util/string/format", "lib/util/string/replaceLoop", "lib/util/html/escape", "lib/util/html/tag", "lib/ss/expr/parser"], function (require, exports, format_1, replaceLoop_1, htmlEscape, tag_1, parser_1) {
    "use strict";
    var Formatter = (function () {
        function Formatter(args) {
            this.profile = args.profile;
            this.template = args.template || Formatter._DEFAULT_TEMPLATE;
            this.separator = args.separator || "";
            this.at3ModeAsDefault = args.at3ModeAsDefault || false;
            this.randomizesDiceTag = args.randomizesDiceTag || false;
        }
        Object.defineProperty(Formatter.prototype, "Templates", {
            get: function () {
                return this.template;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Formatter.prototype, "Separator", {
            get: function () {
                return this.separator;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Formatter.prototype, "Profile", {
            get: function () {
                return this.profile;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Formatter.prototype, "At3ModeAsDefault", {
            // 名前の通りデフォルトで@@@タグモードを有効にするかどうか。
            get: function () {
                return this.at3ModeAsDefault;
            },
            enumerable: true,
            configurable: true
        });
        Formatter.GenerateDiceTag = function (randomize) {
            if (randomize === void 0) { randomize = false; }
            var resultNum = 1;
            if (randomize) {
                resultNum = Math.floor(Math.random() * 6) + 1;
            }
            return format_1.default(Formatter._DEFAULT_DICE_TEMPLATE, { imgDir: Formatter._DEFAULT_IMG_DIR, resultNum: resultNum });
        };
        Formatter.prototype.Exec = function (source) {
            var _this = this;
            // 1: escape
            var html = htmlEscape.escape(source);
            // 2: replace Deco-tags
            html = replaceLoop_1.default(html, Formatter.reReplace_EscapedDecoTag, "<span class='$1'>$2</span>");
            // 3: parse and format
            html = this.Format(parser_1.Parser.Parse(html, this.at3ModeAsDefault));
            // 4: dice
            html = html.replace(Formatter.reReplace_EscapedDiceTag, function (match) {
                return Formatter.GenerateDiceTag(_this.randomizesDiceTag);
            });
            // 5: BR
            html = tag_1.lineBreaksToBR(html);
            html = htmlEscape.unescape(html, "<BR>", "g");
            return html;
        };
        Formatter.prototype.Format = function (exps) {
            var _this = this;
            return exps.map(function (exp, i, a) {
                var template;
                if (exp.EnableAt3Mode) {
                    if (exp.IconNumber === -1) {
                        template = _this.template.Body_At3Mode;
                    }
                    else {
                        template = _this.template.Body_At3ModeAndIcon;
                    }
                }
                else {
                    template = _this.template.Body;
                }
                var iconURL = "";
                if (exp.IconNumber !== -1) {
                    iconURL = _this.profile.iconURLArray[exp.IconNumber] || (Formatter._DEFAULT_IMG_DIR + "default.jpg");
                }
                var name = exp.ChangedName === null ? _this.profile.nickname : exp.ChangedName;
                var bodyHTML = exp.Text;
                return format_1.default(template, { iconURL: iconURL, name: name, nameColor: _this.profile.nameColor, bodyHTML: bodyHTML });
            }).join(this.separator);
        };
        Formatter._DEFAULT_TEMPLATE = {
            Body: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\" rowspan=\"2\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"Name\"><font color=\"{nameColor}\" class=\"B\">{name}</font></td></tr><tr><td class=\"Words\">\u300C{bodyHTML}\u300D</td></tr></table>",
            Body_At3ModeAndIcon: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"String\">{bodyHTML}</td></tr></table>",
            Body_At3Mode: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"></td><td class=\"String\">{bodyHTML}</td></tr></table>"
        };
        // { imgDir, resultNum }
        Formatter._DEFAULT_DICE_TEMPLATE = "<img alt=\"dice\" src=\"{imgDir}d{resultNum}.png\" border=\"0\" height=\"20\" width=\"20\">";
        Formatter._DEFAULT_IMG_DIR = "http://www.sssloxia.jp/p/";
        Formatter.reReplace_EscapedDecoTag = new RegExp(htmlEscape.escape("<(F[1-7]|B|I|S)>([\\s\\S]*?)</\\1>"), "g");
        Formatter.reReplace_EscapedDiceTag = new RegExp(htmlEscape.escape("<D>"), "g");
        return Formatter;
    }());
    exports.Formatter = Formatter;
});
define("lib/ss/expr/rule", ["require", "exports"], function (require, exports) {
    "use strict";
    function CountExprChars(source) {
        var lfCount = source.length - source.replace(/\n/g, "").length;
        var charCount = source.length - lfCount;
        return { charCount: charCount, lfCount: lfCount };
    }
    exports.CountExprChars = CountExprChars;
});
define("lib/ss/preview", ["require", "exports", "lib/util/string/format", "lib/preview", "lib/ss/expr/formatter", "lib/ss/expr/rule"], function (require, exports, format_2, Preview, formatter_1, rule_1) {
    "use strict";
    exports.randomizesDiceTagResult = false;
    var SSPreview = (function (_super) {
        __extends(SSPreview, _super);
        function SSPreview(arg) {
            _super.call(this, { insTarget: arg.insTarget, insMode: arg.insMode, delay_ms: SSPreview.DELAY_MS });
            this.textbox = arg.textbox;
            this.profile = arg.profile;
            this.formatter = arg.formatter;
            if (arg.hasOwnProperty("template_container")) {
                this.template_container = arg.template_container;
            }
            else {
                this.template_container = "<div class='preview'>{html}</div>";
            }
            this.OnUpdate.RegisterEvent($(this.textbox), "keyup");
        }
        SSPreview.prototype.Update = function (extraFormatArg) {
            var source = this.textbox.value;
            if (source === "") {
                return this.Hide();
            }
            var formatArg = extraFormatArg ? Object.create(extraFormatArg) : {};
            formatArg["html"] = this.formatter.Exec(source);
            var previewHTML = format_2.default(this.template_container, formatArg);
            this.OverwritePreview(previewHTML);
            return this;
        };
        SSPreview.DELAY_MS = 0;
        return SSPreview;
    }(Preview.Preview));
    exports.SSPreview = SSPreview;
    var SerifPreview = (function (_super) {
        __extends(SerifPreview, _super);
        function SerifPreview(arg) {
            var formatter = new formatter_1.Formatter({ profile: arg.profile, at3ModeAsDefault: false, template: SerifPreview.TEMPLATE, randomizesDiceTag: exports.randomizesDiceTagResult });
            _super.call(this, {
                insTarget: arg.insTarget,
                insMode: arg.insMode,
                textbox: arg.textbox,
                profile: arg.profile,
                formatter: formatter
            });
        }
        SerifPreview.TEMPLATE = null;
        return SerifPreview;
    }(SSPreview));
    exports.SerifPreview = SerifPreview;
    var MessagePreview = (function (_super) {
        __extends(MessagePreview, _super);
        function MessagePreview(arg) {
            var formatter = new formatter_1.Formatter({ profile: arg.profile, at3ModeAsDefault: false, template: MessagePreview.TEMPLATE, randomizesDiceTag: exports.randomizesDiceTagResult });
            _super.call(this, {
                insTarget: arg.insTarget,
                insMode: arg.insMode,
                textbox: arg.textbox,
                profile: arg.profile,
                formatter: formatter
            });
        }
        MessagePreview.TEMPLATE = null;
        return MessagePreview;
    }(SSPreview));
    exports.MessagePreview = MessagePreview;
    var PartyBBSPreview = (function (_super) {
        __extends(PartyBBSPreview, _super);
        function PartyBBSPreview(args) {
            var formatter = new formatter_1.Formatter({ profile: args.profile, at3ModeAsDefault: true, template: PartyBBSPreview.TEMPLATE, randomizesDiceTag: exports.randomizesDiceTagResult });
            _super.call(this, {
                insTarget: args.insTarget,
                insMode: args.insMode,
                textbox: args.textbox,
                profile: args.profile,
                formatter: formatter
            });
            this.nameBox = args.nameBox;
            this.titleBox = args.titleBox;
            this.OnUpdate.RegisterEvent([
                { target: $(this.nameBox), eventType: "keyup" },
                { target: $(this.titleBox), eventType: "keyup" }
            ]);
        }
        PartyBBSPreview.prototype.Update = function () {
            this.template_container = PartyBBSPreview.TEMPLATE_CONTAINER;
            var title = this.titleBox.value || "無題";
            var name = this.nameBox.value;
            _super.prototype.Update.call(this, { title: title, name: name });
            return this;
        };
        PartyBBSPreview.TEMPLATE = null;
        PartyBBSPreview.TEMPLATE_CONTAINER = "<div class='preview'><div class='BackBoard'><b>xxx ：{title}</b> &nbsp;&nbsp;{name}&#12288;（20xx/xx/xx xx:xx:xx） <br> <br>{html}<br><br><br clear='ALL'></div></div>";
        return PartyBBSPreview;
    }(SSPreview));
    exports.PartyBBSPreview = PartyBBSPreview;
    var DiaryPreview = (function (_super) {
        __extends(DiaryPreview, _super);
        function DiaryPreview(args) {
            var formatter = new formatter_1.Formatter({ profile: args.profile, at3ModeAsDefault: true, template: DiaryPreview.TEMPLATE, randomizesDiceTag: exports.randomizesDiceTagResult });
            _super.call(this, { insTarget: args.insTarget,
                insMode: args.insMode,
                textbox: args.textbox,
                profile: args.profile,
                formatter: formatter,
                template_container: DiaryPreview.TEMPLATE_CONTAINER
            });
            this.countsChars = args.countsChars || false;
        }
        DiaryPreview.prototype.UpdateContainer = function (counts) {
            if (this.countsChars) {
                this.template_container = DiaryPreview.SelectCharCountContainer(counts);
            }
            else {
                this.template_container = DiaryPreview.TEMPLATE_CONTAINER;
            }
            return this;
        };
        DiaryPreview.SelectCharCountContainer = function (c) {
            var charCountHTML;
            if (c.charCount > DiaryPreview.MAX_LENGTH_OF_CHARS) {
                charCountHTML = "<span name='charCount' class='char_count char_count_over'>{charCount}</span>";
            }
            else {
                charCountHTML = "<span name='charCount' class='char_count'>{charCount}</span>";
            }
            var lfCountHTML;
            if (c.lfCount > DiaryPreview.MAX_COUNT_OF_LF) {
                lfCountHTML = "<span name='lfCount' class='lf_count lf_count_over'>{lfCount}</span>";
            }
            else {
                lfCountHTML = "<span name='lfCount' class='lf_count'>{lfCount}</span>";
            }
            return format_2.default(DiaryPreview.TEMPLATE_CONTAINER_COUNTS_CHAR, { charCount: charCountHTML, lfCount: lfCountHTML });
        };
        DiaryPreview.prototype.Update = function () {
            var counts = rule_1.CountExprChars(this.textbox.value);
            this.UpdateContainer(counts);
            _super.prototype.Update.call(this, counts);
            return this;
        };
        DiaryPreview.TEMPLATE = null;
        DiaryPreview.TEMPLATE_CONTAINER = "<div class='preview'><div class='tablestyle3'>{html}</div></div>";
        DiaryPreview.TEMPLATE_CONTAINER_COUNTS_CHAR = "<div class='preview'><p class='char_count_line'><span class='char_count_cnt'>{charCount} / 5000</span> <span class='lf_count_cnt'>(改行: {lfCount} / 2500)</span></p><div class='tablestyle3'>{html}</div></div>";
        DiaryPreview.MAX_LENGTH_OF_CHARS = 5000;
        DiaryPreview.MAX_COUNT_OF_LF = 2500;
        return DiaryPreview;
    }(SSPreview));
    exports.DiaryPreview = DiaryPreview;
});
define("lib/ss/pages/characterSettings", ["require", "exports"], function (require, exports) {
    "use strict";
    var CharacterSettings = (function () {
        function CharacterSettings() {
        }
        CharacterSettings.ExtractIconUrlArray = function () {
            var defaultIconURL = "/p/default.jpg";
            var firstIcon = document.getElementById("TextBox7");
            if (firstIcon === null) {
                return [];
            }
            var a = [firstIcon.value || defaultIconURL];
            for (var i = 0;; i++) {
                var icon = document.getElementById("TextBox" + (i + 12));
                if (icon === null) {
                    return a;
                }
                a.push(icon.value || defaultIconURL);
            }
        };
        CharacterSettings.ExtractNickname = function () {
            var nickname = document.getElementById("TextBox2");
            if (nickname === null) {
                return null;
            }
            return nickname.value;
        };
        return CharacterSettings;
    }());
    exports.CharacterSettings = CharacterSettings;
});
define("lib/ss/pages", ["require", "exports", "lib/ss/pages/characterSettings"], function (require, exports, characterSettings_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    __export(characterSettings_1);
});
define("SSPreviewer.user", ["require", "exports", "lib/ss/profile", "lib/ss/pageConfig", "lib/ss/page", "lib/preview", "lib/ss/preview", "lib/ss/pages"], function (require, exports, profile_1, pageConfig_1, page_1, Preview, SSPreview, Pages) {
    "use strict";
    var SSPreviewer;
    (function (SSPreviewer) {
        // const $: JQueryStatic = jQuery;
        function Init() {
            SSPreview.SSPreview.DELAY_MS = 100;
            var InitAllTextboxesWithSerifPreview = function (profile) {
                $("textarea").each(function (i, e) {
                    var preview = new SSPreview.SerifPreview({
                        insTarget: e,
                        insMode: Preview.InsertionMode.InsertAfter,
                        textbox: e,
                        profile: profile
                    });
                });
            };
            var InitAllTextboxesWithMessagePreview = function (profile) {
                $("textarea").each(function (i, e) {
                    var imageURLBox = $(e).nextUntil("input").last().next()[0];
                    var preview = new SSPreview.MessagePreview({
                        insTarget: imageURLBox,
                        insMode: Preview.InsertionMode.InsertAfter,
                        textbox: e,
                        profile: profile
                    });
                });
            };
            var p = pageConfig_1.default;
            var profile = new profile_1.Profile();
            p.Common = new page_1.default(profile, function (profile) {
                $("#char_Button").before("<center class='F1'>↓(Previewer) アイコン・愛称の自動読込↓</center>");
            });
            $("head").append("<style type='text/css'>\n    .char_count_line {\n        text-align: left;\n    }\n    .char_count_cnt {\n        font-size: 12px;\n    }\n    .lf_count_cnt {\n        font-size: 10px;\n    }\n    .char_count_line .char_count_over, .char_count_line .lf_count_over {\n        color: #CC3333;\n        font-weight: bold;\n    }\n    .char_count_line .char_count_over {\n        font-size: 16px;\n    }\n    .char_count_line .lf_count_over {\n        font-size: 14px;\n    }\n    </style>");
            p.MainPage = new page_1.default(profile, function (profile) {
                var diaryBox = $("#Diary_TextBox")[0];
                var diaryPreview = new SSPreview.DiaryPreview({
                    insTarget: diaryBox,
                    insMode: Preview.InsertionMode.InsertAfter,
                    textbox: diaryBox,
                    profile: profile,
                    countsChars: true
                });
                var serifWhenUsingItem = $("#TextBox12")[0];
                var serifPreview_WhenUsingItem = new SSPreview.SerifPreview({
                    insTarget: serifWhenUsingItem,
                    insMode: Preview.InsertionMode.InsertAfter,
                    textbox: serifWhenUsingItem,
                    profile: profile
                });
            });
            p.PartyBBS = new page_1.default(profile, function (profile) {
                var $commentBox = $("#commentTxt");
                var preview = new SSPreview.PartyBBSPreview({
                    insTarget: $commentBox.closest("div.BackBoard")[0],
                    insMode: Preview.InsertionMode.InsertAfter,
                    textbox: $commentBox[0],
                    profile: profile,
                    nameBox: $("#nameTxt")[0],
                    titleBox: $("#titleTxt")[0]
                });
            });
            p.Trade = new page_1.default(profile, function (profile) {
                InitAllTextboxesWithSerifPreview(profile);
            });
            p.Reinforcement = new page_1.default(profile, function (profile) {
                InitAllTextboxesWithSerifPreview(profile);
            });
            p.BattleSettings = new page_1.default(profile, function (profile) {
                InitAllTextboxesWithSerifPreview(profile);
            });
            p.BattleWords = new page_1.default(profile, function (profile) {
                InitAllTextboxesWithSerifPreview(profile);
            });
            p.Message = new page_1.default(profile, function (profile) {
                InitAllTextboxesWithMessagePreview(profile);
            });
            p.GroupMessage = new page_1.default(profile, function (profile) {
                InitAllTextboxesWithMessagePreview(profile);
            });
            p.CharacterSettings = new page_1.default(profile, function (profile) {
                profile.SaveIconURLArray(Pages.CharacterSettings.ExtractIconUrlArray());
                profile.SaveNickname(Pages.CharacterSettings.ExtractNickname());
            });
            p.Community = new page_1.default(profile, function (profile) {
                var communityCaptionBox = $("textarea")[0];
                var communityCaptionPreview = new SSPreview.DiaryPreview({
                    insTarget: communityCaptionBox,
                    insMode: Preview.InsertionMode.InsertAfter,
                    textbox: communityCaptionBox,
                    profile: profile
                });
            });
            p.RunInitializer(profile, document.location);
        }
        Init();
    })(SSPreviewer || (SSPreviewer = {}));
});
(function(){
    require(["SSPreviewer.user"], function(){ });
})();
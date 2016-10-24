// ==UserScript==
// @name        SSPreviewer (beta)
// @namespace   11powder
// @description 何かのプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @version     0.1.014
// @grant       none
// ==/UserScript==
//
// !!!:第二回更新時に向けてのチェックリスト。現在は暫定的な仕様のため実際の動作と異なる可能性がある
// セリフの冒頭に@@, @@@@とつけたときの挙動
// メッセージの冒頭に@@, @@@, @@@@と付けた時の挙動
// 文字数制限の計算方法。タグや段落が何文字に換算されるかをチェックすること
// 日記/メッセージ/台詞の正確なフォーマット
// 改行は普通に使用できるはずだけど念のために確認しておくこと。BRタグは使用できるのかどうかも。
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var JQueryUtil;
(function (JQueryUtil) {
    JQueryUtil.replaceTo = function (from, to) {
        var $to = $(to);
        $(from).replaceWith($to);
        return $to;
    };
    var CustomEvent = (function () {
        function CustomEvent(name, callback) {
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
        }
        Object.defineProperty(CustomEvent.prototype, "Name", {
            get: function () {
                return this.name;
            },
            enumerable: true,
            configurable: true
        });
        CustomEvent.prototype.RegisterEvent = function (arg, eventType) {
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
        CustomEvent.prototype.UnregisterEvent = function (arg, eventType) {
            var currentEvts = this.evts;
            if (arg === undefined) {
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
        CustomEvent.prototype.Dispose = function () {
            this.UnregisterEvent();
        };
        return CustomEvent;
    }());
    JQueryUtil.CustomEvent = CustomEvent;
})(JQueryUtil || (JQueryUtil = {}));
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
}(Timer));
var EvtBasedPreview;
(function (EvtBasedPreview_1) {
    (function (InsertionMode) {
        InsertionMode[InsertionMode["InsertAfter"] = 0] = "InsertAfter";
        InsertionMode[InsertionMode["InsertBefore"] = 1] = "InsertBefore";
        InsertionMode[InsertionMode["AppendTo"] = 2] = "AppendTo";
        InsertionMode[InsertionMode["PrependTo"] = 3] = "PrependTo";
    })(EvtBasedPreview_1.InsertionMode || (EvtBasedPreview_1.InsertionMode = {}));
    var InsertionMode = EvtBasedPreview_1.InsertionMode;
    var EvtBasedPreview = (function () {
        function EvtBasedPreview(arg) {
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
            this.onUpdate = new JQueryUtil.CustomEvent("updatePreview", this._eventCallback);
            this.insTarget = arg.insTarget;
            this.insMode = arg.insMode;
            this._delay_ms = arg.delay_ms || EvtBasedPreview._DEFAULT_DELAY_MS;
            this.timerEvt = new TimerEvent(function () { _this.Update(); }, this._delay_ms);
            this.timerEvt.resetTimeWhenStarting = true;
        }
        Object.defineProperty(EvtBasedPreview.prototype, "Delay_ms", {
            get: function () {
                return this._delay_ms;
            },
            set: function (n) {
                this._delay_ms = n;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EvtBasedPreview.prototype, "IsDisabled", {
            get: function () {
                return this.isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        EvtBasedPreview.prototype.Pause = function () {
            this.isDisabled = true;
            return this;
        };
        EvtBasedPreview.prototype.Disable = function () {
            this.isDisabled = true;
            return this.Hide();
        };
        EvtBasedPreview.prototype.Enable = function () {
            this.isDisabled = false;
            return this.Update();
        };
        Object.defineProperty(EvtBasedPreview.prototype, "OnUpdate", {
            get: function () {
                return this.onUpdate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EvtBasedPreview.prototype, "PreviewElement", {
            get: function () {
                return this.preview;
            },
            enumerable: true,
            configurable: true
        });
        EvtBasedPreview.prototype.InsertPreview = function (newHtml) {
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
        EvtBasedPreview.prototype.OverwritePreview = function (newHtml) {
            if (this.preview) {
                this.preview = JQueryUtil.replaceTo(this.preview, newHtml)[0];
            }
            else {
                this.InsertPreview(newHtml);
            }
            return this;
        };
        EvtBasedPreview.prototype.Show = function () {
            return this.Update();
        };
        EvtBasedPreview.prototype.Hide = function () {
            $(this.preview).hide();
            return this;
        };
        EvtBasedPreview.prototype.Dispose = function () {
            this.onUpdate.Dispose();
            this.Disable().Hide();
        };
        EvtBasedPreview._DEFAULT_DELAY_MS = 0;
        return EvtBasedPreview;
    }());
    EvtBasedPreview_1.EvtBasedPreview = EvtBasedPreview;
})(EvtBasedPreview || (EvtBasedPreview = {}));
var StringUtil = (function () {
    function StringUtil() {
    }
    StringUtil.replaceLoop = function (searchTarget, searchValue, replaceTo) {
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
        for (;;) {
            if (!searchValue.test(strTarget)) {
                return strTarget;
            }
            strTarget = strTarget.replace(searchValue, replaceTo);
        }
    };
    StringUtil.format = function (template, args) {
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
    };
    return StringUtil;
}());
var HTMLUtil;
(function (HTMLUtil) {
    var escapeMap = {
        "&": "&amp;",
        "'": "&#x27;",
        "`": "&#x60;",
        "\"": "&quot;",
        "<": "&lt;",
        ">": "&gt;"
    };
    var escapeReg = new RegExp("[" + Object.keys(escapeMap).join("") + "]", "g");
    HTMLUtil.escape = function (s) {
        if (s === null || s === undefined) {
            return s;
        }
        return ("" + s).replace(escapeReg, function (match) { return escapeMap[match]; });
    };
    HTMLUtil.replaceLineBreaksToBRTag = function (html) {
        return html.replace(/(?:\r\n|\r|\n)/g, "<BR>");
    };
    var re_escapedBRTag = new RegExp(HTMLUtil.escape("<BR>"), "g");
    HTMLUtil.UnescapeBRTag = function (source) {
        return source.replace(re_escapedBRTag, "<BR>");
    };
})(HTMLUtil || (HTMLUtil = {}));
var SS;
(function (SS) {
    var SSProfile = (function () {
        function SSProfile(c) {
            if (c) {
                this.iconURLArray = c.iconURLArray;
                this.nickname = c.nickname;
                this.nameColor = c.nameColor;
            }
            else {
                this.iconURLArray = SSProfile.LoadIconURLArray();
                this.nickname = SSProfile.LoadNickname();
                this.nameColor = SSProfile.LoadNameColor();
            }
        }
        Object.defineProperty(SSProfile.prototype, "IconURLArray", {
            get: function () {
                return this.iconURLArray;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSProfile.prototype, "Nickname", {
            get: function () {
                return this.nickname;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSProfile.prototype, "NameColor", {
            get: function () {
                return this.nameColor;
            },
            enumerable: true,
            configurable: true
        });
        SSProfile.prototype.setIconURLArray = function (iconURLArray) {
            this.iconURLArray = iconURLArray;
            return this;
        };
        SSProfile.prototype.setNickname = function (nickname) {
            this.nickname = nickname;
            return this;
        };
        SSProfile.prototype.setNameColor = function (nameColor) {
            this.nameColor = nameColor;
            return this;
        };
        SSProfile.prototype.SaveIconURLArray = function (overwriteWith) {
            if (overwriteWith !== undefined) {
                this.iconURLArray = overwriteWith;
            }
            SSProfile.SaveIconURLArray(this.iconURLArray);
            return this;
        };
        SSProfile.prototype.SaveNickname = function (overwriteWith) {
            if (overwriteWith !== undefined) {
                this.nickname = overwriteWith;
            }
            SSProfile.SaveNickname(this.nickname);
            return this;
        };
        SSProfile.prototype.SaveNameColor = function (overwriteWith) {
            if (overwriteWith !== undefined) {
                this.nameColor = overwriteWith;
            }
            SSProfile.SaveNameColor(this.nickname);
            return this;
        };
        SSProfile.LoadIconURLArray = function () {
            var json = localStorage.getItem("SSPreview_IconURLArray");
            if (json === null) {
                return [];
            }
            return JSON.parse(json);
        };
        SSProfile.SaveIconURLArray = function (iconURLArray) {
            localStorage.setItem("SSPreview_IconURLArray", JSON.stringify(iconURLArray));
        };
        SSProfile.LoadNickname = function () {
            var name = localStorage.getItem("SSPreview_Nickname");
            if (name === null) {
                return "(名称)";
            }
            return name;
        };
        SSProfile.SaveNickname = function (nickname) {
            localStorage.setItem("SSPreview_Nickname", nickname);
        };
        SSProfile.LoadNameColor = function () {
            var color = localStorage.getItem("SSPreview_NameColor");
            if (color === null) {
                return "";
            }
            return color;
        };
        SSProfile.SaveNameColor = function (nameColor) {
            localStorage.setItem("SSPreview_NameColor", nameColor);
        };
        return SSProfile;
    }());
    SS.SSProfile = SSProfile;
    var ParsedExp = (function () {
        function ParsedExp(arg) {
            this.enableAt3Mode = arg.enableAt3Mode;
            this.iconNumber = arg.iconNumber;
            this.text = arg.text;
            this.changedName = arg.hasOwnProperty("changedName") ? arg.changedName : null;
        }
        Object.defineProperty(ParsedExp.prototype, "EnableAt3Mode", {
            get: function () {
                return this.enableAt3Mode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParsedExp.prototype, "Text", {
            get: function () {
                return this.text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParsedExp.prototype, "IconNumber", {
            get: function () {
                return this.iconNumber;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParsedExp.prototype, "ChangedName", {
            get: function () {
                return this.changedName;
            },
            enumerable: true,
            configurable: true
        });
        return ParsedExp;
    }());
    var ExpFormatter = (function () {
        function ExpFormatter(args) {
            this.ssp = args.ssp;
            this.template = args.template || ExpFormatter._DEFAULT_TEMPLATE;
            this.separator = args.separator || "";
            this.at3ModeAsDefault = args.at3ModeAsDefault || false;
            this.randomizesDiceTag = args.randomizesDiceTag || false;
        }
        Object.defineProperty(ExpFormatter.prototype, "Templates", {
            get: function () {
                return this.template;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpFormatter.prototype, "Separator", {
            get: function () {
                return this.separator;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpFormatter.prototype, "SSProfile", {
            get: function () {
                return this.ssp;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExpFormatter.prototype, "At3ModeAsDefault", {
            get: function () {
                return this.at3ModeAsDefault;
            },
            enumerable: true,
            configurable: true
        });
        ExpFormatter.GenerateDiceTag = function (randomize) {
            if (randomize === void 0) { randomize = false; }
            var resultNum = 1;
            if (randomize) {
                resultNum = Math.floor(Math.random() * 6) + 1;
            }
            return StringUtil.format(ExpFormatter._DEFAULT_DICE_TEMPLATE, { imgDir: ExpFormatter._DEFAULT_IMG_DIR, resultNum: resultNum });
        };
        ExpFormatter.prototype.Exec = function (source) {
            var _this = this;
            var html = HTMLUtil.escape(source);
            html = StringUtil.replaceLoop(html, ExpFormatter.reReplace_EscapedDecoTag, "<span class='$1'>$2</span>");
            html = this.Format(ExpAnalyzer.ParseExpression(html, this.at3ModeAsDefault));
            html = html.replace(ExpFormatter.reReplace_EscapedDiceTag, function (match) {
                return ExpFormatter.GenerateDiceTag(_this.randomizesDiceTag);
            });
            html = HTMLUtil.replaceLineBreaksToBRTag(html);
            html = HTMLUtil.UnescapeBRTag(html);
            return html;
        };
        ExpFormatter.prototype.Format = function (exps) {
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
                    iconURL = _this.ssp.IconURLArray[exp.IconNumber] || (ExpFormatter._DEFAULT_IMG_DIR + "default.jpg");
                }
                var name = exp.ChangedName === null ? _this.ssp.Nickname : exp.ChangedName;
                var bodyHTML = exp.Text;
                return StringUtil.format(template, { iconURL: iconURL, name: name, nameColor: _this.ssp.NameColor, bodyHTML: bodyHTML });
            }).join(this.separator);
        };
        ExpFormatter._DEFAULT_TEMPLATE = {
            Body: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\" rowspan=\"2\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"Name\"><font color=\"{nameColor}\" class=\"B\">{name}</font></td></tr><tr><td class=\"Words\">\u300C{bodyHTML}\u300D</td></tr></table>",
            Body_At3ModeAndIcon: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"String\">{bodyHTML}</td></tr></table>",
            Body_At3Mode: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"></td><td class=\"String\">{bodyHTML}</td></tr></table>"
        };
        ExpFormatter._DEFAULT_DICE_TEMPLATE = "<img alt=\"dice\" src=\"{imgDir}d{resultNum}.png\" border=\"0\" height=\"20\" width=\"20\">";
        ExpFormatter._DEFAULT_IMG_DIR = "http://www.sssloxia.jp/p/";
        ExpFormatter.reReplace_EscapedDecoTag = new RegExp(HTMLUtil.escape("<(F[1-7]|B|I|S)>([\\s\\S]*?)</\\1>"), "g");
        ExpFormatter.reReplace_EscapedDiceTag = new RegExp(HTMLUtil.escape("<D>"), "g");
        return ExpFormatter;
    }());
    SS.ExpFormatter = ExpFormatter;
    var ExpAnalyzer = (function () {
        function ExpAnalyzer() {
        }
        ExpAnalyzer.ParseExpression = function (source, at3ModeAsDefault) {
            var defaultIconNumber = at3ModeAsDefault ? -1 : 0;
            var texts = source.split(/(?:(@@@|@((?![^<@]*\/\d+\/)[^<@]+)@)(?:\/(\d+)\/)?|\/(\d+)\/)/g);
            if (texts.length === 1) {
                return [new ParsedExp({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: source })];
            }
            var exps = [];
            for (var ti = 0, tiEnd = texts.length; ti < tiEnd; ti += 5) {
                var text = texts[ti];
                if (ti === 0) {
                    if (text !== "") {
                        exps.push(new ParsedExp({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: texts[ti] }));
                    }
                    continue;
                }
                var changedName = null;
                var enableAt3Mode = at3ModeAsDefault;
                var strIconNumber = void 0;
                if (texts[ti - 4] === undefined) {
                    strIconNumber = texts[ti - 1];
                }
                else if (texts[ti - 4] === "@@@") {
                    strIconNumber = texts[ti - 2];
                    enableAt3Mode = true;
                }
                else {
                    strIconNumber = texts[ti - 2];
                    changedName = texts[ti - 3];
                    enableAt3Mode = false;
                }
                var iconNumber = enableAt3Mode ? -1 : 0;
                if (strIconNumber !== undefined) {
                    iconNumber = parseInt(strIconNumber);
                }
                exps.push(new ParsedExp({
                    enableAt3Mode: enableAt3Mode, changedName: changedName, iconNumber: iconNumber, text: text
                }));
            }
            return exps;
        };
        ExpAnalyzer.CountLengthOfExpChars = function (source) {
            var lineBreaks = source.length - source.replace(/(?:\r\n|\r|\n)/g, "").length;
            return lineBreaks + source.length;
        };
        return ExpAnalyzer;
    }());
    SS.ExpAnalyzer = ExpAnalyzer;
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
        PageConfig.RunInitializer = function (ssp, location) {
            if (this.Common) {
                this.Common.Init(ssp);
            }
            var path = location.pathname;
            if (PageConfig.pathnameToPage.hasOwnProperty(path) && PageConfig.pathnameToPage[path]) {
                PageConfig.pathnameToPage[path].Init(ssp);
            }
        };
        return PageConfig;
    }());
    SS.PageConfig = PageConfig;
    var Page = (function () {
        function Page(ssp, initializer) {
            this.ssp = ssp;
            this.initializer = initializer;
        }
        Page.prototype.Init = function (ssp) {
            this.initializer(ssp);
        };
        Object.defineProperty(Page.prototype, "Settings", {
            get: function () {
                return this.ssp;
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
    SS.Page = Page;
    var Preview;
    (function (Preview) {
        Preview.randomizesDiceTagResult = false;
        var SSEvtPreviewBase = (function (_super) {
            __extends(SSEvtPreviewBase, _super);
            function SSEvtPreviewBase(arg) {
                _super.call(this, { insTarget: arg.insTarget, insMode: arg.insMode, delay_ms: SSEvtPreviewBase.DELAY_MS });
                this.textbox = arg.textbox;
                this.ssp = arg.ssp;
                this.formatter = arg.formatter;
                if (arg.hasOwnProperty("template_container")) {
                    this.template_container = arg.template_container;
                }
                else {
                    this.template_container = "<div class='preview'>{html}</div>";
                }
                this.OnUpdate.RegisterEvent($(this.textbox), "keyup");
            }
            SSEvtPreviewBase.prototype.Update = function (extraFormatArg) {
                var source = this.textbox.value;
                if (source === "") {
                    return this.Hide();
                }
                var formatArg = extraFormatArg ? Object.create(extraFormatArg) : {};
                formatArg["html"] = this.formatter.Exec(source);
                var previewHTML = StringUtil.format(this.template_container, formatArg);
                this.OverwritePreview(previewHTML);
                return this;
            };
            SSEvtPreviewBase.DELAY_MS = 0;
            return SSEvtPreviewBase;
        }(EvtBasedPreview.EvtBasedPreview));
        Preview.SSEvtPreviewBase = SSEvtPreviewBase;
        var SerifPreview = (function (_super) {
            __extends(SerifPreview, _super);
            function SerifPreview(arg) {
                var formatter = new SS.ExpFormatter({ ssp: arg.ssp, at3ModeAsDefault: false, template: SerifPreview.TEMPLATE, randomizesDiceTag: Preview.randomizesDiceTagResult });
                _super.call(this, {
                    insTarget: arg.insTarget,
                    insMode: arg.insMode,
                    textbox: arg.textbox,
                    ssp: arg.ssp,
                    formatter: formatter
                });
            }
            SerifPreview.TEMPLATE = null;
            return SerifPreview;
        }(SSEvtPreviewBase));
        Preview.SerifPreview = SerifPreview;
        var MessagePreview = (function (_super) {
            __extends(MessagePreview, _super);
            function MessagePreview(arg) {
                var formatter = new SS.ExpFormatter({ ssp: arg.ssp, at3ModeAsDefault: false, template: MessagePreview.TEMPLATE, randomizesDiceTag: Preview.randomizesDiceTagResult });
                _super.call(this, {
                    insTarget: arg.insTarget,
                    insMode: arg.insMode,
                    textbox: arg.textbox,
                    ssp: arg.ssp,
                    formatter: formatter
                });
            }
            MessagePreview.TEMPLATE = null;
            return MessagePreview;
        }(SSEvtPreviewBase));
        Preview.MessagePreview = MessagePreview;
        var PartyBBSPreview = (function (_super) {
            __extends(PartyBBSPreview, _super);
            function PartyBBSPreview(args) {
                var formatter = new SS.ExpFormatter({ ssp: args.ssp, at3ModeAsDefault: true, template: PartyBBSPreview.TEMPLATE, randomizesDiceTag: Preview.randomizesDiceTagResult });
                _super.call(this, {
                    insTarget: args.insTarget,
                    insMode: args.insMode,
                    textbox: args.textbox,
                    ssp: args.ssp,
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
        }(SSEvtPreviewBase));
        Preview.PartyBBSPreview = PartyBBSPreview;
        var DiaryPreview = (function (_super) {
            __extends(DiaryPreview, _super);
            function DiaryPreview(args) {
                var formatter = new SS.ExpFormatter({ ssp: args.ssp, at3ModeAsDefault: true, template: DiaryPreview.TEMPLATE, randomizesDiceTag: Preview.randomizesDiceTagResult });
                _super.call(this, { insTarget: args.insTarget,
                    insMode: args.insMode,
                    textbox: args.textbox,
                    ssp: args.ssp,
                    formatter: formatter,
                    template_container: DiaryPreview.TEMPLATE_CONTAINER
                });
                this.countsChars = args.countsChars || false;
            }
            DiaryPreview.prototype.UpdateContainer = function (arg) {
                if (this.countsChars) {
                    var charCount = SS.ExpAnalyzer.CountLengthOfExpChars(this.textbox.value);
                    this.template_container = DiaryPreview.SelectCharCountContainer(charCount);
                }
                else {
                    this.template_container = DiaryPreview.TEMPLATE_CONTAINER;
                }
                return this;
            };
            DiaryPreview.SelectCharCountContainer = function (charCount) {
                var charCountHTML;
                if (charCount > DiaryPreview.MAXIMUM_CHARS) {
                    charCountHTML = "<span class='char_count char_count_over'>{charCount}</span>";
                }
                else {
                    charCountHTML = "<span class='char_count'>{charCount}</span>";
                }
                return StringUtil.format(DiaryPreview.TEMPLATE_CONTAINER_COUNTS_CHAR, { charCount: charCountHTML });
            };
            DiaryPreview.prototype.Update = function () {
                var charCount = SS.ExpAnalyzer.CountLengthOfExpChars(this.textbox.value);
                this.UpdateContainer({ charCount: charCount });
                _super.prototype.Update.call(this, { charCount: charCount });
                return this;
            };
            DiaryPreview.TEMPLATE = null;
            DiaryPreview.TEMPLATE_CONTAINER = "<div class='preview'><div class='tablestyle3'>{html}</div></div>";
            DiaryPreview.TEMPLATE_CONTAINER_COUNTS_CHAR = "<div class='preview'><p class='char_count_line'>{charCount} / 5000</p><div class='tablestyle3'>{html}</div></div>";
            DiaryPreview.MAXIMUM_CHARS = 5000;
            return DiaryPreview;
        }(SSEvtPreviewBase));
        Preview.DiaryPreview = DiaryPreview;
    })(Preview = SS.Preview || (SS.Preview = {}));
})(SS || (SS = {}));
var Pages;
(function (Pages) {
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
    Pages.CharacterSettings = CharacterSettings;
})(Pages || (Pages = {}));
var Program;
(function (Program) {
    SS.Preview.SSEvtPreviewBase.DELAY_MS = 100;
    var InitAllTextboxesWithSerifPreview = function (ssp) {
        $("textarea").each(function (i, e) {
            var preview = new SS.Preview.SerifPreview({
                insTarget: e,
                insMode: EvtBasedPreview.InsertionMode.InsertAfter,
                textbox: e,
                ssp: ssp
            });
        });
    };
    var InitAllTextboxesWithMessagePreview = function (ssp) {
        $("textarea").each(function (i, e) {
            var imageURLBox = $(e).nextUntil("input").last().next()[0];
            var preview = new SS.Preview.MessagePreview({
                insTarget: imageURLBox,
                insMode: EvtBasedPreview.InsertionMode.InsertAfter,
                textbox: e,
                ssp: ssp
            });
        });
    };
    var p = SS.PageConfig;
    var ssp = new SS.SSProfile();
    p.Common = new SS.Page(ssp, function (ssp) {
        $("#char_Button").before("<center class='F1'>↓(Previewer) アイコン・愛称の自動読込↓</center>");
    });
    p.MainPage = new SS.Page(ssp, function (ssp) {
        $("head").append("<style type='text/css'>\n    .char_count_line {\n        text-align: left;\n        font-size: 12px;\n    }\n    .char_count_line .char_count_over {\n        color: #CC3333;\n        font-size: 16px;\n        font-weight: bold;\n    }</style>");
        var diaryBox = $("#Diary_TextBox")[0];
        var diaryPreview = new SS.Preview.DiaryPreview({
            insTarget: diaryBox,
            insMode: EvtBasedPreview.InsertionMode.InsertAfter,
            textbox: diaryBox,
            ssp: ssp,
            countsChars: true
        });
        var serifWhenUsingItem = $("#TextBox12")[0];
        var serifPreview_WhenUsingItem = new SS.Preview.SerifPreview({
            insTarget: serifWhenUsingItem,
            insMode: EvtBasedPreview.InsertionMode.InsertAfter,
            textbox: serifWhenUsingItem,
            ssp: ssp
        });
    });
    p.PartyBBS = new SS.Page(ssp, function (ssp) {
        var $commentBox = $("#commentTxt");
        var preview = new SS.Preview.PartyBBSPreview({
            insTarget: $commentBox.closest("div.BackBoard")[0],
            insMode: EvtBasedPreview.InsertionMode.InsertAfter,
            textbox: $commentBox[0],
            ssp: ssp,
            nameBox: $("#nameTxt")[0],
            titleBox: $("#titleTxt")[0]
        });
    });
    p.Trade = new SS.Page(ssp, function (ssp) {
        InitAllTextboxesWithSerifPreview(ssp);
    });
    p.Reinforcement = new SS.Page(ssp, function (ssp) {
        InitAllTextboxesWithSerifPreview(ssp);
    });
    p.BattleSettings = new SS.Page(ssp, function (ssp) {
        InitAllTextboxesWithSerifPreview(ssp);
    });
    p.BattleWords = new SS.Page(ssp, function (ssp) {
        InitAllTextboxesWithSerifPreview(ssp);
    });
    p.Message = new SS.Page(ssp, function (ssp) {
        InitAllTextboxesWithMessagePreview(ssp);
    });
    p.GroupMessage = new SS.Page(ssp, function (ssp) {
        InitAllTextboxesWithMessagePreview(ssp);
    });
    p.CharacterSettings = new SS.Page(ssp, function (ssp) {
        ssp.SaveIconURLArray(Pages.CharacterSettings.ExtractIconUrlArray());
        ssp.SaveNickname(Pages.CharacterSettings.ExtractNickname());
    });
    p.Community = new SS.Page(ssp, function (ssp) {
        var communityCaptionBox = $("textarea")[0];
        var communityCaptionPreview = new SS.Preview.DiaryPreview({
            insTarget: communityCaptionBox,
            insMode: EvtBasedPreview.InsertionMode.InsertAfter,
            textbox: communityCaptionBox,
            ssp: ssp
        });
    });
    p.RunInitializer(ssp, document.location);
})(Program || (Program = {}));

// ==UserScript==
// @name        SSPreviewer
// @namespace   11powder
// @author      pejuta
// @description 七海で色々なプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @resource    CSS_STYLE http://pjtool.webcrow.jp/ss/scripts/SSPreviewer/src/css/style.css
// @version     0.2.003
// @grant       GM_addStyle
// @grant       GM_getResourceText
// ==/UserScript==
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
    exports.Page = Page;
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
                    "/d/battleprc.aspx": PageConfig.BattleSettings,
                    "/d/battlemessage.aspx": PageConfig.BattleWords,
                    "/d/battlemessageprc.aspx": PageConfig.BattleWords,
                    "/d/bms.aspx": PageConfig.BattleWords,
                    "/d/messageaction.aspx": PageConfig.Message,
                    "/d/commesaction.aspx": PageConfig.GroupMessage,
                    "/d/messagelog.aspx": PageConfig.MessageLog,
                    "/d/commeslog.aspx": PageConfig.MessageLog,
                    "/d/chara.aspx": PageConfig.CharacterSettings,
                    "/d/com.aspx": PageConfig.Community,
                };
            },
            enumerable: true,
            configurable: true
        });
        PageConfig.RunInitializer = function (profile, location) {
            if (this.ForAllPages) {
                this.ForAllPages.Init(profile);
            }
            var path = location.pathname;
            if (PageConfig.pathnameToPage.hasOwnProperty(path) && PageConfig.pathnameToPage[path]) {
                PageConfig.pathnameToPage[path].Init(profile);
            }
        };
        return PageConfig;
    }());
    exports.PageConfig = PageConfig;
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
    return format;
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
    return replaceLoop;
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
    var Parser = (function () {
        function Parser() {
        }
        Parser.ParseAnd = function (source) {
            var splt = source.split(/((@@@|@((?![^<@]*\/\d+\/)[^<@]+)@)(?:\/(\d+)\/)?|\/(\d+)\/)/g);
            var firstDefault = { source: { text: splt[0] }, attr: {} };
            if (splt.length === 1) {
                return [firstDefault];
            }
            var ands = [];
            for (var si = 0, aiEnd = splt.length; si < aiEnd; si += 6) {
                if (si === 0) {
                    if (splt[0] !== "") {
                        ands.push(firstDefault);
                    }
                    continue;
                }
                var match = splt.slice(si - 5, si + 1);
                var at3Mode = match[1] === "@@@";
                var changedName = match[2];
                var iconNumber = void 0;
                if (match[3] !== void 0) {
                    iconNumber = match[3];
                }
                else if (match[4] !== void 0) {
                    iconNumber = match[4];
                }
                var text = match[5];
                var separator = match[0];
                var attr = { at3Mode: at3Mode, changedName: changedName, iconNumber: iconNumber };
                var source_1 = { text: text, separator: separator };
                ands.push({ source: source_1, attr: attr });
            }
            return ands;
        };
        Parser.ParseOr = function (source) {
            var splt = source.split("###");
            var ors = [];
            for (var si = 0, oiEnd = splt.length; si < oiEnd; si++) {
                ors.push(Parser.ParseAnd(splt[si]));
            }
            return ors;
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
define("lib/preview/model_formatter", ["require", "exports"], function (require, exports) {
    "use strict";
    var Formatter = (function () {
        function Formatter() {
        }
        Formatter.prototype.Exec = function (source, extraArg) {
            return source;
        };
        return Formatter;
    }());
    exports.Formatter = Formatter;
});
define("lib/ss/preview/templates", ["require", "exports"], function (require, exports) {
    "use strict";
    // 注意: 変更したい場合はコントローラー(から呼ばれるformatter)のコンストラクタが呼ばれる前に設定すること。
    var Preview;
    (function (Preview) {
        Preview.Diary = null;
        Preview.DiaryCharCountsHTML = null;
        Preview.Message = null;
        Preview.PartyBBS = null;
        Preview.Serif = null;
    })(Preview = exports.Preview || (exports.Preview = {}));
});
define("lib/preview/config", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.neverUpdateHTMLIfHidden = true;
    exports.previewDelay_ms = 0;
});
define("lib/ss/preview/config", ["require", "exports", "lib/ss/preview/templates", "lib/preview/config"], function (require, exports, Templates, Preview) {
    "use strict";
    exports.Templates = Templates;
    exports.Preview = Preview;
    var SSPreview;
    (function (SSPreview) {
        SSPreview.imgBaseURL = null;
        SSPreview.showsCharCountsOnDiary = true;
        SSPreview.randomizesDiceTagResult = false;
        // format arg: { imgDir, resultNum }
        SSPreview.diceTagTemplateHTML = null;
    })(SSPreview = exports.SSPreview || (exports.SSPreview = {}));
});
define("lib/ss/preview/model_formatter", ["require", "exports", "lib/util/string/format", "lib/util/string/replaceLoop", "lib/util/html/escape", "lib/util/html/tag", "lib/ss/expr/parser", "lib/ss/preview/config"], function (require, exports, format, replaceLoop, htmlEscape, tag_1, parser_1, Config) {
    "use strict";
    var Formatter = (function () {
        function Formatter(args) {
            this.profile = args.profile;
            this.at3ModeAsDefault = args.at3ModeAsDefault || false;
            this.allowsOrTag = args.allowsOrTag || false;
            this.template = args.template || Object.create(Formatter._DEFAULT_TEMPLATE);
            this.separators = args.separators ? {
                and: args.separators.and || Formatter._DETAULT_SEPARATORS.and,
                or: args.separators.or || Formatter._DETAULT_SEPARATORS.or
            } : Object.create(Formatter._DETAULT_SEPARATORS);
            if (args.htmlWhenOrHTMLIsEmpty === void 0 || args.htmlWhenOrHTMLIsEmpty === null) {
                this.htmlWhenOrHTMLIsEmpty = Formatter._DEFAULT_TEMPLATE.Body_WhenOrIsEmpty;
            }
            else {
                this.htmlWhenOrHTMLIsEmpty = args.htmlWhenOrHTMLIsEmpty;
            }
        }
        Object.defineProperty(Formatter.prototype, "Profile", {
            get: function () {
                return this.profile;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Formatter.prototype, "Templates", {
            get: function () {
                return this.template;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Formatter.prototype, "Separators", {
            get: function () {
                return this.separators;
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
        Object.defineProperty(Formatter.prototype, "AllowsOrTag", {
            get: function () {
                return this.allowsOrTag;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Formatter.prototype, "HTMLWhenOrHTMLIsEmpty", {
            get: function () {
                return this.htmlWhenOrHTMLIsEmpty;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Formatter.prototype, "DefaultIconURL", {
            get: function () {
                return ((Config.SSPreview.imgBaseURL || Formatter._DEFAULT_IMG_BASE_URL) + "default.jpg");
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
            return format(Config.SSPreview.diceTagTemplateHTML || Formatter._DEFAULT_DICE_TEMPLATE, { imgDir: Config.SSPreview.imgBaseURL || Formatter._DEFAULT_IMG_BASE_URL, resultNum: resultNum });
        };
        Formatter.prototype.Exec = function (source) {
            // 1: escape
            var html = htmlEscape.escape(source);
            // 2: replace Deco-tags
            html = replaceLoop(html, Formatter.reReplace_EscapedDecoTag, "<span class='$1'>$2</span>");
            // 3: parse and format
            html = this.Format(html);
            // 4: dice
            html = html.replace(Formatter.reReplace_EscapedDiceTag, function (match) {
                return Formatter.GenerateDiceTag(Config.SSPreview.randomizesDiceTagResult);
            });
            // 5: BR
            html = tag_1.lineBreaksToBR(html);
            html = htmlEscape.unescape(html, "<BR>", "g");
            return html;
        };
        Formatter.prototype.Format = function (source) {
            if (this.allowsOrTag) {
                return this.FormatOrs(parser_1.Parser.ParseOr(source));
            }
            else {
                return this.FormatAnds(parser_1.Parser.ParseAnd(source));
            }
        };
        Formatter.prototype.FormatOrs = function (ors) {
            var orHTMLs = [];
            for (var or = 0, orEnd = ors.length; or < orEnd; or++) {
                var ands = ors[or];
                var isEmpty = ands.length === 1 && ([ands[0].source.separator, ands[0].source.text].join("") === "");
                if (isEmpty && this.htmlWhenOrHTMLIsEmpty !== null) {
                    orHTMLs.push(this.htmlWhenOrHTMLIsEmpty);
                }
                else {
                    orHTMLs.push(this.FormatAnds(ors[or]));
                }
            }
            return orHTMLs.join(this.separators.or);
        };
        Formatter.prototype.FormatAnds = function (ands) {
            var andHTMLs = [];
            for (var ai = 0, aiEnd = ands.length; ai < aiEnd; ai++) {
                var exp = ands[ai];
                var enableAt3Mode = void 0;
                if (exp.attr.at3Mode === void 0) {
                    enableAt3Mode = this.at3ModeAsDefault;
                }
                else if (this.at3ModeAsDefault && exp.attr.changedName === void 0) {
                    enableAt3Mode = true;
                }
                else {
                    enableAt3Mode = exp.attr.at3Mode;
                }
                var name_1 = void 0;
                if (exp.attr.changedName === void 0) {
                    name_1 = this.profile.nickname;
                }
                else {
                    name_1 = exp.attr.changedName;
                }
                var iconNumber = void 0;
                if (exp.attr.iconNumber === void 0) {
                    iconNumber = -1;
                }
                else {
                    iconNumber = parseInt(exp.attr.iconNumber);
                }
                var iconURL = this.DefaultIconURL;
                if (iconNumber === -1) {
                    iconURL = this.profile.iconURLArray[0] || this.DefaultIconURL;
                }
                else {
                    iconURL = this.profile.iconURLArray[iconNumber] || this.DefaultIconURL;
                }
                var template = void 0;
                if (enableAt3Mode) {
                    if (iconNumber === -1) {
                        template = this.template.Body_At3Mode;
                    }
                    else {
                        template = this.template.Body_At3ModeAndIcon;
                    }
                }
                else {
                    template = this.template.Body;
                }
                andHTMLs.push(format(template, { iconURL: iconURL, name: name_1, nameColor: this.profile.nameColor, bodyHTML: exp.source.text }));
            }
            return andHTMLs.join(this.separators.and);
        };
        //     public static _DEFAULT_TEMPLATE: IFormatTemplate = {
        //         Body:
        // `<table class="WordsTable" CELLSPACING=0 CELLPADDING=0>
        //     <tr>
        //         <td class="Icon" rowspan="2"><IMG border = 0 alt=Icon align=left src="{iconURL}" width=60 height=60></td>
        //         <td class="Name"><font color="{nameColor}" class="B">{name}</font></td>
        //     </tr>
        //     <tr>
        //         <td class="Words">「{bodyHTML}」</td>
        //     </tr>
        // </table>`,
        //         Body_At3ModeAndIcon:
        // `<table class="WordsTable" CELLSPACING=0 CELLPADDING=0><tr>
        //     <td class="Icon"><IMG border = 0 alt=Icon align=left src="{iconURL}" width=60 height=60></td>
        //     <td class="String">{bodyHTML}</td>
        // </tr></table>`,
        //         Body_At3Mode:
        // `<table class="WordsTable" CELLSPACING=0 CELLPADDING=0><tr>
        //     <td class="Icon"/>
        //     <td class="String">{bodyHTML}</td>
        // </tr></table>`
        //     };
        // 改行を入れるとフォーマットの時に酷いことになった。上がその残骸
        Formatter._DEFAULT_TEMPLATE = {
            Body: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\" rowspan=\"2\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"Name\"><font color=\"{nameColor}\" class=\"B\">{name}</font></td></tr><tr><td class=\"Words\">\u300C{bodyHTML}\u300D</td></tr></table>",
            Body_At3ModeAndIcon: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"String\">{bodyHTML}</td></tr></table>",
            Body_At3Mode: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"/><td class=\"String\">{bodyHTML}</td></tr></table>",
            Body_WhenOrIsEmpty: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"/><td class=\"String\"><span class='I'>(\u8868\u793A\u306A\u3057)</span></td></tr></table>"
        };
        // { imgDir, resultNum }
        Formatter._DEFAULT_DICE_TEMPLATE = "<img alt=\"dice\" src=\"{imgDir}d{resultNum}.png\" border=\"0\" height=\"20\" width=\"20\">";
        // must finish with '/'
        Formatter._DEFAULT_IMG_BASE_URL = "http://www.sssloxia.jp/p/";
        Formatter._DETAULT_SEPARATORS = { and: "", or: "<div class='separator_or'/>" };
        Formatter.reReplace_EscapedDecoTag = new RegExp(htmlEscape.escape("<(F[1-7]|B|I|S)>([\\s\\S]*?)</\\1>"), "g");
        Formatter.reReplace_EscapedDiceTag = new RegExp(htmlEscape.escape("<D>"), "g");
        return Formatter;
    }());
    exports.Formatter = Formatter;
});
define("lib/interface/disposable", ["require", "exports"], function (require, exports) {
    "use strict";
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
    return Timer;
});
define("lib/util/timer/timerEvent", ["require", "exports", "lib/util/timer/timer"], function (require, exports, Timer) {
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
        TimerEvent.prototype.Dispose = function () {
            this.Stop();
        };
        return TimerEvent;
    }(Timer));
    return TimerEvent;
});
define("lib/preview/model", ["require", "exports", "jquery", "lib/preview/model_formatter", "lib/util/timer/timerEvent", "lib/preview/config"], function (require, exports, $, model_formatter_1, TimerEvent, Config) {
    "use strict";
    var PreviewModel = (function () {
        function PreviewModel(formatter, delay_ms) {
            if (formatter === void 0) { formatter = new model_formatter_1.Formatter(); }
            if (delay_ms === void 0) { delay_ms = Config.previewDelay_ms; }
            this.formatter = formatter;
            this.delay_ms = delay_ms;
            this.previewHTML = null;
            this.source = null;
            this.extraArg = null;
            this.isVisible = false;
            this.isDisabled = false;
            this.$onUpdated = $.Callbacks("stopOnFalse");
            this.InitTimerEvent();
        }
        Object.defineProperty(PreviewModel.prototype, "PreviewHTML", {
            get: function () {
                return this.previewHTML;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PreviewModel.prototype, "Delay_ms", {
            get: function () {
                return this.delay_ms;
            },
            set: function (n) {
                this.delay_ms = n;
                this.InitTimerEvent();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PreviewModel.prototype, "IsVisible", {
            get: function () {
                return this.isVisible;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PreviewModel.prototype, "IsDisabled", {
            get: function () {
                return this.isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        PreviewModel.prototype.ReserveUpdate = function (arg) {
            if (this.isDisabled) {
                return false;
            }
            if (arg.source === this.source && JSON.stringify(arg.extraArg) === JSON.stringify(this.extraArg)) {
                return false;
            }
            this.timerEvt.Start(arg);
            return true;
        };
        PreviewModel.prototype.InitTimerEvent = function () {
            var _this = this;
            if (this.timerEvt) {
                this.timerEvt.Dispose();
            }
            this.timerEvt = new TimerEvent(function (arg) { _this.Update(arg); }, this.delay_ms);
            this.timerEvt.resetTimeWhenStarting = true;
            return this;
        };
        PreviewModel.prototype.Update = function (arg) {
            this.InitOnUpdating().UpdateInfo(arg);
            this.TriggerOnUpdatedEvent();
            return this;
        };
        PreviewModel.prototype.InitOnUpdating = function () {
            this.SetAsShown();
            return this;
        };
        PreviewModel.prototype.UpdateInfo = function (arg) {
            if (this.isDisabled) {
                return false;
            }
            if (!this.isVisible && Config.neverUpdateHTMLIfHidden) {
                return false;
            }
            this.source = arg.source;
            this.extraArg = arg.extraArg;
            this.previewHTML = this.formatter.Exec(arg.source, arg.extraArg);
            return true;
        };
        PreviewModel.prototype.Show = function () {
            this.SetAsShown();
            if (!this.previewHTML) {
                return this;
            }
            this.TriggerOnUpdatedEvent();
            return this;
        };
        PreviewModel.prototype.Hide = function () {
            this.SetAsHidden();
            if (!this.previewHTML) {
                return this;
            }
            this.TriggerOnUpdatedEvent();
            return this;
        };
        PreviewModel.prototype.SetAsHidden = function () {
            this.isVisible = false;
            return this;
        };
        PreviewModel.prototype.SetAsShown = function () {
            this.isVisible = true;
            return this;
        };
        PreviewModel.prototype.SetAsDisabled = function () {
            this.isDisabled = true;
            return this;
        };
        PreviewModel.prototype.SetAsEnabled = function () {
            this.isDisabled = false;
            return this;
        };
        PreviewModel.prototype.TriggerOnUpdatedEvent = function () {
            this.$onUpdated.fire(this);
            return this;
        };
        PreviewModel.prototype.onUpdated = function (arg) {
            if (arg instanceof Array) {
                this.$onUpdated.add(arg);
            }
            else {
                this.$onUpdated.add(arg);
            }
            return this;
        };
        PreviewModel.prototype.offUpdated = function (arg) {
            if (arg instanceof Array) {
                this.$onUpdated.remove(arg);
            }
            else {
                this.$onUpdated.remove(arg);
            }
            return this;
        };
        PreviewModel.prototype.Dispose = function () {
            this.timerEvt.Dispose();
            this.$onUpdated.disable();
            this.previewHTML = null;
            this.isDisabled = true;
            this.isVisible = false;
        };
        return PreviewModel;
    }());
    exports.PreviewModel = PreviewModel;
});
define("lib/ss/preview/model", ["require", "exports", "lib/preview/model"], function (require, exports, model_1) {
    "use strict";
    var SSPreviewModel = (function (_super) {
        __extends(SSPreviewModel, _super);
        function SSPreviewModel(formatter, delay_ms) {
            _super.call(this, formatter, delay_ms);
        }
        SSPreviewModel.prototype.UpdateInfo = function (arg) {
            if (arg.source === "") {
                this.SetAsHidden();
            }
            return _super.prototype.UpdateInfo.call(this, arg);
        };
        return SSPreviewModel;
    }(model_1.PreviewModel));
    exports.SSPreviewModel = SSPreviewModel;
});
define("lib/ss/preview/partyBBS/model_formatter", ["require", "exports", "lib/util/string/format", "lib/ss/preview/model_formatter"], function (require, exports, format, model_formatter_2) {
    "use strict";
    var PartyBBSFormatter = (function (_super) {
        __extends(PartyBBSFormatter, _super);
        function PartyBBSFormatter(args) {
            _super.call(this, args);
        }
        PartyBBSFormatter.prototype.Exec = function (source, extraArg) {
            if (extraArg === void 0) { extraArg = { title: "", name: "" }; }
            var html = _super.prototype.Exec.call(this, source);
            if (extraArg.title === "") {
                extraArg = Object.create(extraArg);
                extraArg.title = "無題";
            }
            var template = format(PartyBBSFormatter.TEMPLATE_CONTAINER, extraArg);
            return format(template, { html: html });
        };
        PartyBBSFormatter.TEMPLATE_CONTAINER = "<div class=\"BackBoard\">\n    <b>xxx \uFF1A{title}</b> &nbsp;&nbsp;{name}&#12288;\uFF0820xx/xx/xx xx:xx:xx\uFF09 <br> <br>{html}<br><br><br clear=\"ALL\">\n</div>";
        return PartyBBSFormatter;
    }(model_formatter_2.Formatter));
    exports.PartyBBSFormatter = PartyBBSFormatter;
});
define("lib/ss/preview/partyBBS/model", ["require", "exports", "lib/ss/preview/model", "lib/ss/preview/partyBBS/model_formatter", "lib/ss/preview/templates"], function (require, exports, model_2, model_formatter_3, Templates) {
    "use strict";
    var PartyBBSModel = (function (_super) {
        __extends(PartyBBSModel, _super);
        function PartyBBSModel(profile, delay_ms) {
            _super.call(this, new model_formatter_3.PartyBBSFormatter({
                profile: profile,
                template: Templates.Preview.PartyBBS,
                at3ModeAsDefault: true
            }), delay_ms);
        }
        PartyBBSModel.prototype.ReserveUpdate = function (arg) {
            if (arg.source === this.source && arg.extraArg.title === this.extraArg.title && arg.extraArg.name === this.extraArg.name) {
                return false;
            }
            return _super.prototype.ReserveUpdate.call(this, arg);
        };
        PartyBBSModel.prototype.UpdateInfo = function (arg) {
            if (arg.extraArg.name === "") {
                this.SetAsHidden();
            }
            return _super.prototype.UpdateInfo.call(this, arg);
        };
        return PartyBBSModel;
    }(model_2.SSPreviewModel));
    exports.PartyBBSModel = PartyBBSModel;
});
define("lib/ss/preview/diary/model_formatter", ["require", "exports", "lib/util/string/format", "lib/ss/preview/model_formatter"], function (require, exports, format, model_formatter_4) {
    "use strict";
    var DiaryFormatter = (function (_super) {
        __extends(DiaryFormatter, _super);
        function DiaryFormatter(arg) {
            _super.call(this, arg);
        }
        DiaryFormatter.prototype.Exec = function (source) {
            var html = _super.prototype.Exec.call(this, source);
            return format(DiaryFormatter.TEMPLATE_CONTAINER, { html: html });
        };
        DiaryFormatter.TEMPLATE_CONTAINER = "<div name=\"Diary\">{html}</div>";
        return DiaryFormatter;
    }(model_formatter_4.Formatter));
    exports.DiaryFormatter = DiaryFormatter;
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
define("lib/ss/preview/diary/model", ["require", "exports", "lib/ss/preview/diary/model_formatter", "lib/ss/preview/model", "lib/ss/expr/rule", "lib/ss/preview/config", "lib/ss/preview/templates"], function (require, exports, model_formatter_5, model_3, rule_1, Config, Templates) {
    "use strict";
    var DiaryModel = (function (_super) {
        __extends(DiaryModel, _super);
        function DiaryModel(arg) {
            _super.call(this, new model_formatter_5.DiaryFormatter({
                profile: arg.profile,
                template: Templates.Preview.Diary,
                at3ModeAsDefault: true
            }), arg.delay_ms);
            if ("showsCharCounts" in arg) {
                this.showsCharCounts = arg.showsCharCounts;
            }
            else {
                this.showsCharCounts = Config.SSPreview.showsCharCountsOnDiary || false;
            }
        }
        Object.defineProperty(DiaryModel.prototype, "ShowsCharCounts", {
            get: function () {
                return this.showsCharCounts;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DiaryModel.prototype, "CharCounts", {
            get: function () {
                return this.charCounts;
            },
            enumerable: true,
            configurable: true
        });
        DiaryModel.prototype.UpdateInfo = function (arg) {
            this.charCounts = rule_1.CountExprChars(arg.source);
            return _super.prototype.UpdateInfo.call(this, arg);
        };
        DiaryModel.MAX_LENGTH_OF_CHARS = 5000;
        DiaryModel.MAX_COUNT_OF_LFS = 2500;
        return DiaryModel;
    }(model_3.SSPreviewModel));
    exports.DiaryModel = DiaryModel;
});
define("lib/ss/preview/serif/model", ["require", "exports", "lib/ss/preview/model_formatter", "lib/ss/preview/model", "lib/ss/preview/templates"], function (require, exports, model_formatter_6, model_4, Templates) {
    "use strict";
    var SerifModel = (function (_super) {
        __extends(SerifModel, _super);
        function SerifModel(profile, delay_ms) {
            _super.call(this, new model_formatter_6.Formatter({
                profile: profile,
                template: Templates.Preview.Serif,
                allowsOrTag: true
            }), delay_ms);
        }
        return SerifModel;
    }(model_4.SSPreviewModel));
    exports.SerifModel = SerifModel;
});
define("lib/ss/preview/message/model", ["require", "exports", "lib/ss/preview/model_formatter", "lib/ss/preview/model", "lib/ss/preview/templates"], function (require, exports, model_formatter_7, model_5, Templates) {
    "use strict";
    var MessageModel = (function (_super) {
        __extends(MessageModel, _super);
        function MessageModel(profile, delay_ms) {
            _super.call(this, new model_formatter_7.Formatter({
                profile: profile,
                template: Templates.Preview.Message
            }), delay_ms);
        }
        return MessageModel;
    }(model_5.SSPreviewModel));
    exports.MessageModel = MessageModel;
});
define("lib/ss/preview/model_formatters", ["require", "exports", "lib/ss/preview/diary/model_formatter", "lib/ss/preview/partyBBS/model_formatter", "lib/ss/preview/model_formatter"], function (require, exports, model_formatter_8, model_formatter_9, model_formatter_10) {
    "use strict";
    exports.Diary = model_formatter_8.DiaryFormatter;
    exports.PartyBBS = model_formatter_9.PartyBBSFormatter;
    exports.Formatter = model_formatter_10.Formatter;
});
define("lib/ss/preview/models", ["require", "exports", "lib/ss/preview/partyBBS/model", "lib/ss/preview/diary/model", "lib/ss/preview/serif/model", "lib/ss/preview/message/model"], function (require, exports, model_6, model_7, model_8, model_9) {
    "use strict";
    exports.PartyBBS = model_6.PartyBBSModel;
    exports.Diary = model_7.DiaryModel;
    exports.Serif = model_8.SerifModel;
    exports.Message = model_9.MessageModel;
});
define("lib/preview/view", ["require", "exports", "jquery", "lib/preview/config"], function (require, exports, $, Config) {
    "use strict";
    (function (InsertWay) {
        InsertWay[InsertWay["InsertAfter"] = 0] = "InsertAfter";
        InsertWay[InsertWay["InsertBefore"] = 1] = "InsertBefore";
        InsertWay[InsertWay["AppendTo"] = 2] = "AppendTo";
        InsertWay[InsertWay["PrependTo"] = 3] = "PrependTo";
    })(exports.InsertWay || (exports.InsertWay = {}));
    var InsertWay = exports.InsertWay;
    var PreviewView = (function () {
        function PreviewView(insert) {
            this.insert = insert;
        }
        Object.defineProperty(PreviewView.prototype, "PreviewContainer", {
            get: function () {
                return this.$container ? this.$container[0] : null;
            },
            enumerable: true,
            configurable: true
        });
        PreviewView.prototype.InsertContainer = function () {
            this.$container = $(PreviewView.containerHTML);
            switch (this.insert.way) {
                case InsertWay.InsertAfter:
                    this.$container.insertAfter(this.insert.target);
                    break;
                case InsertWay.InsertBefore:
                    this.$container.insertBefore(this.insert.target);
                    break;
                case InsertWay.AppendTo:
                    this.$container.appendTo(this.insert.target);
                    break;
                case InsertWay.PrependTo:
                    this.$container.prependTo(this.insert.target);
                    break;
                default:
                    throw new Error("InsertionMode指定エラー");
            }
            return this;
        };
        PreviewView.prototype.Hide = function (model) {
            if (!this.$container) {
                return;
            }
            this.$container.css("display", "none");
            return this;
        };
        PreviewView.prototype.Show = function (model) {
            if (!this.$container) {
                return;
            }
            this.$container.css("display", "");
            return this;
        };
        PreviewView.prototype.Update = function (model) {
            if (!this.$container) {
                this.InsertContainer();
            }
            if (model.IsVisible) {
                this.Show(model);
            }
            else {
                this.Hide(model);
                if (Config.neverUpdateHTMLIfHidden) {
                    return false;
                }
            }
            if (model.IsDisabled) {
                return false;
            }
            this.$container.html(model.PreviewHTML);
            return true;
        };
        PreviewView.prototype.Dispose = function () {
            this.$container.remove();
        };
        PreviewView.containerHTML = "<div class=\"preview\"/>";
        return PreviewView;
    }());
    exports.PreviewView = PreviewView;
});
define("lib/ss/preview/diary/view", ["require", "exports", "lib/util/string/format", "lib/ss/preview/diary/model", "lib/preview/view", "lib/ss/preview/templates"], function (require, exports, format, model_10, view_1, Templates) {
    "use strict";
    var DiaryView = (function (_super) {
        __extends(DiaryView, _super);
        function DiaryView(insert) {
            _super.call(this, insert);
        }
        DiaryView.BuildCharCountLine = function (counts) {
            var html = Templates.Preview.DiaryCharCountsHTML || DiaryView._DEFAULT_TEMPLATE_CHARCOUNTS;
            html = format(html, {
                charCount: counts.charCount,
                charCountMax: model_10.DiaryModel.MAX_LENGTH_OF_CHARS,
                lfCount: counts.lfCount,
                lfCountMax: model_10.DiaryModel.MAX_COUNT_OF_LFS
            });
            var $p = $(html);
            if (counts.charCount > model_10.DiaryModel.MAX_LENGTH_OF_CHARS) {
                $p.children("[name=charCount]").addClass("over");
            }
            if (counts.lfCount > model_10.DiaryModel.MAX_COUNT_OF_LFS) {
                $p.children("[name=lfCount]").addClass("over");
            }
            return $p;
        };
        DiaryView.prototype.Update = function (model) {
            if (!_super.prototype.Update.call(this, model)) {
                return false;
            }
            if (model.ShowsCharCounts) {
                this.$container.prepend(DiaryView.BuildCharCountLine(model.CharCounts));
            }
            return true;
        };
        DiaryView._DEFAULT_TEMPLATE_CHARCOUNTS = "<p class=\"char_count_line\"><span class=\"char_count_cnt\"><span name=\"charCount\" class=\"char_count\">{charCount}</span> / {charCountMax}</span> <span class=\"lf_count_cnt\">(\u6539\u884C: <span name=\"lfCount\" class=\"lf_count\">{lfCount}</span> / {lfCountMax})</span></p>";
        return DiaryView;
    }(view_1.PreviewView));
    exports.DiaryView = DiaryView;
});
define("lib/ss/preview/views", ["require", "exports", "lib/ss/preview/diary/view", "lib/preview/view"], function (require, exports, view_2, view_3) {
    "use strict";
    exports.Diary = view_2.DiaryView;
    exports.InsertWay = view_3.InsertWay;
});
define("lib/util/array/set", ["require", "exports"], function (require, exports) {
    "use strict";
    var FakeSet = (function () {
        function FakeSet(equalityValidator, array) {
            if (equalityValidator === void 0) { equalityValidator = function (v1, v2) { return (v1 === v2); }; }
            this.equalityValidator = equalityValidator;
            if (array && array instanceof Array) {
                this.innerArray = array.concat();
            }
            else {
                this.innerArray = [];
            }
        }
        FakeSet.prototype.has = function (e) {
            return this.indexOf(e) !== -1;
        };
        FakeSet.prototype.indexOf = function (e) {
            var _this = this;
            var index;
            var hasFound = this.innerArray.some(function (v, i, a) {
                index = i;
                return _this.equalityValidator(v, e);
            });
            if (hasFound) {
                return index;
            }
            else {
                return -1;
            }
        };
        FakeSet.prototype.add = function (e) {
            if (this.has(e)) {
                return this;
            }
            this.innerArray.push(e);
            return this;
        };
        FakeSet.prototype.addAll = function (a) {
            for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
                var e = a_1[_i];
                this.add(e);
            }
            return this;
        };
        // 名称がdeleteだとYUIに弾かれるが故に再現できない。
        FakeSet.prototype.del = function (e) {
            var index = this.indexOf(e);
            if (index === -1) {
                return false;
            }
            this.innerArray.splice(index, 1);
            return true;
        };
        // return: boolean. at least one element has removed
        FakeSet.prototype.delAll = function (a) {
            var f = false;
            for (var _i = 0, a_2 = a; _i < a_2.length; _i++) {
                var e = a_2[_i];
                f = this.del(e) || f;
            }
            return f;
        };
        FakeSet.prototype.clear = function () {
            this.innerArray = [];
        };
        FakeSet.prototype.forEach = function (callback) {
            for (var _i = 0, _a = this.innerArray; _i < _a.length; _i++) {
                var i = _a[_i];
                callback(i, i, this);
            }
        };
        Object.defineProperty(FakeSet.prototype, "size", {
            get: function () {
                return this.innerArray.length;
            },
            enumerable: true,
            configurable: true
        });
        FakeSet.prototype.toArray = function () {
            return this.innerArray.concat();
        };
        return FakeSet;
    }());
    return FakeSet;
});
/// <reference path="../../../typings/index.d.ts" />
define("lib/util/jquery/customEvent", ["require", "exports", "lib/util/array/set", "jquery"], function (require, exports, Set, $) {
    "use strict";
    function ValidateEventsEquality(v1, v2) {
        return v1.target.is(v2) && v1.eventType === v2.eventType;
    }
    var Event = (function () {
        function Event(name, callback) {
            var _this = this;
            this.name = name;
            this.$callback = $.Callbacks("unique stopOnFalse");
            this._thisEventCallback = function (e) {
                _this.$callback.fire(e);
                $(document).triggerHandler(_this.name);
            };
            this.evts = new Set(ValidateEventsEquality);
            this.$callback.add(callback);
        }
        Object.defineProperty(Event.prototype, "Name", {
            get: function () {
                return this.name;
            },
            enumerable: true,
            configurable: true
        });
        Event.prototype.AddCallback = function (callback) {
            this.$callback.add(callback);
            return this;
        };
        Event.prototype.AddCallbacks = function (callbacks) {
            this.$callback.add(callbacks);
            return this;
        };
        Event.prototype.RemoveCallback = function (callback) {
            this.$callback.remove(callback);
            return this;
        };
        Event.prototype.RemoveCallbacks = function (callbacks) {
            if (callbacks) {
                this.$callback.empty();
            }
            else {
                this.$callback.remove(callbacks);
            }
            return this;
        };
        Event.prototype.AddTrigger = function (evt) {
            if (this.evts.has(evt)) {
                return false;
            }
            $(evt.target).on(evt.eventType, this._thisEventCallback);
            this.evts.add(evt);
            return true;
        };
        Event.prototype.AddTriggers = function (evts) {
            for (var _i = 0, evts_1 = evts; _i < evts_1.length; _i++) {
                var evt = evts_1[_i];
                this.AddTrigger(evt);
            }
            return this;
        };
        Event.prototype.RemoveTrigger = function (evt) {
            if (!this.evts.has(evt)) {
                return false;
            }
            $(evt.target).off(evt.eventType, this._thisEventCallback);
            return this.evts.del(evt);
        };
        Event.prototype.RemoveTriggers = function (evts) {
            if (!evts) {
                this.RemoveAllTriggers();
            }
            for (var _i = 0, evts_2 = evts; _i < evts_2.length; _i++) {
                var evt = evts_2[_i];
                this.RemoveTrigger(evt);
            }
            return this;
        };
        Event.prototype.RemoveAllTriggers = function () {
            var _this = this;
            this.evts.forEach(function (evt) {
                $(evt.target).off(evt.eventType, _this._thisEventCallback);
            });
            this.evts.clear();
            return this;
        };
        Event.prototype.Dispose = function () {
            this.RemoveAllTriggers();
            this.$callback.disable();
        };
        return Event;
    }());
    exports.Event = Event;
});
define("lib/preview/controller", ["require", "exports", "lib/util/jquery/customEvent"], function (require, exports, customEvent_1) {
    "use strict";
    var PreviewController = (function () {
        function PreviewController(arg) {
            var _this = this;
            this.callback_onPreviewTriggerd = function (eventObject) {
                _this.ReserveUpdate();
            };
            // notice: follow this define order.
            this.onPreviewTriggered = new customEvent_1.Event("onPreviewTriggered", this.callback_onPreviewTriggerd);
            this.model = arg.model;
            this.view = arg.view;
            this.model.onUpdated(function (model) {
                _this.view.Update(model);
            });
        }
        Object.defineProperty(PreviewController.prototype, "OnPreviewTriggerd", {
            get: function () {
                return this.onPreviewTriggered;
            },
            enumerable: true,
            configurable: true
        });
        // 'for user-buttons' methods
        PreviewController.prototype.ReserveUpdate = function () {
            return this.model.ReserveUpdate(this.BuildUpdateArg());
        };
        PreviewController.prototype.Update = function () {
            this.model.Update(this.BuildUpdateArg());
            return this;
        };
        PreviewController.prototype.Show = function () {
            if (!this.model.PreviewHTML) {
                this.Update();
            }
            else {
                this.model.Show();
            }
            return this;
        };
        PreviewController.prototype.Hide = function () {
            this.model.Hide();
            return this;
        };
        PreviewController.prototype.Enable = function () {
            this.model.SetAsEnabled();
            return this;
        };
        PreviewController.prototype.Disable = function () {
            this.model.SetAsDisabled();
            return this;
        };
        PreviewController.prototype.Dispose = function () {
            // this.model.offUpdated(..);
            this.model.Dispose();
            this.view.Dispose();
            this.onPreviewTriggered.Dispose();
        };
        return PreviewController;
    }());
    exports.PreviewController = PreviewController;
});
define("lib/ss/preview/controller", ["require", "exports", "jquery", "lib/preview/controller"], function (require, exports, $, controller_1) {
    "use strict";
    var SSPreviewController = (function (_super) {
        __extends(SSPreviewController, _super);
        function SSPreviewController(arg) {
            _super.call(this, arg);
            this.textbox = arg.textbox;
            this.OnPreviewTriggerd.AddTrigger({ target: $(this.textbox), eventType: "keyup" });
        }
        SSPreviewController.prototype.BuildUpdateArg = function (extraArg) {
            var source = this.textbox.value;
            return { source: source, extraArg: extraArg };
        };
        return SSPreviewController;
    }(controller_1.PreviewController));
    exports.SSPreviewController = SSPreviewController;
});
define("lib/ss/preview/partyBBS/controller", ["require", "exports", "jquery", "lib/ss/preview/controller"], function (require, exports, $, controller_2) {
    "use strict";
    var PartyBBSController = (function (_super) {
        __extends(PartyBBSController, _super);
        function PartyBBSController(arg) {
            // super({ model: arg.model, view, textbox: arg.textbox });
            _super.call(this, arg);
            this.titleInput = arg.titleInput;
            this.nameInput = arg.nameInput;
            this.OnPreviewTriggerd.AddTriggers([
                { target: $(this.titleInput), eventType: "keyup" },
                { target: $(this.nameInput), eventType: "keyup" }
            ]);
        }
        PartyBBSController.prototype.BuildUpdateArg = function (extraArg) {
            var name = this.nameInput.value;
            var title = this.titleInput.value;
            var ext = $.extend(extraArg, { name: name, title: title });
            return _super.prototype.BuildUpdateArg.call(this, { name: name, title: title });
        };
        return PartyBBSController;
    }(controller_2.SSPreviewController));
    exports.PartyBBSController = PartyBBSController;
});
define("lib/ss/preview/controllers", ["require", "exports", "lib/ss/preview/partyBBS/controller"], function (require, exports, controller_3) {
    "use strict";
    exports.PartyBBS = controller_3.PartyBBSController;
    // export { PartyBBS, Diary, Serif, Message, IPreviewController };
});
define("lib/ss/preview/packagedPreview", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("lib/ss/preview/diary/package", ["require", "exports", "jquery", "lib/ss/preview/controller", "lib/ss/preview/diary/model", "lib/ss/preview/diary/view"], function (require, exports, $, controller_4, model_11, view_4) {
    "use strict";
    var DiaryPackage = (function () {
        function DiaryPackage(args) {
            this._model = new model_11.DiaryModel(args.model);
            this._view = new view_4.DiaryView(args.view.insert);
            var ctrlArg = $.extend(args.ctrl, { model: this._model, view: this._view });
            this._ctrl = new controller_4.SSPreviewController(ctrlArg);
        }
        Object.defineProperty(DiaryPackage.prototype, "Model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DiaryPackage.prototype, "View", {
            get: function () {
                return this._view;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DiaryPackage.prototype, "Controller", {
            get: function () {
                return this._ctrl;
            },
            enumerable: true,
            configurable: true
        });
        return DiaryPackage;
    }());
    exports.DiaryPackage = DiaryPackage;
});
define("lib/ss/preview/message/package", ["require", "exports", "jquery", "lib/preview/view", "lib/ss/preview/controller", "lib/ss/preview/message/model"], function (require, exports, $, view_5, controller_5, model_12) {
    "use strict";
    // import { MessageController } from "./controller";
    var MessagePackage = (function () {
        function MessagePackage(args) {
            this._model = new model_12.MessageModel(args.model.profile);
            this._view = new view_5.PreviewView(args.view.insert);
            var ctrlArg = $.extend(args.ctrl, { model: this._model, view: this._view });
            this._ctrl = new controller_5.SSPreviewController(ctrlArg);
        }
        Object.defineProperty(MessagePackage.prototype, "Model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MessagePackage.prototype, "View", {
            get: function () {
                return this._view;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MessagePackage.prototype, "Controller", {
            get: function () {
                return this._ctrl;
            },
            enumerable: true,
            configurable: true
        });
        return MessagePackage;
    }());
    exports.MessagePackage = MessagePackage;
});
define("lib/ss/preview/partyBBS/package", ["require", "exports", "jquery", "lib/preview/view", "lib/ss/preview/partyBBS/model", "lib/ss/preview/partyBBS/controller"], function (require, exports, $, view_6, model_13, controller_6) {
    "use strict";
    var PartyBBSPackage = (function () {
        function PartyBBSPackage(args) {
            this._model = new model_13.PartyBBSModel(args.model.profile);
            this._view = new view_6.PreviewView(args.view.insert);
            var ctrlArg = $.extend(args.ctrl, { model: this._model, view: this._view });
            this._ctrl = new controller_6.PartyBBSController(ctrlArg);
        }
        Object.defineProperty(PartyBBSPackage.prototype, "Model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PartyBBSPackage.prototype, "View", {
            get: function () {
                return this._view;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PartyBBSPackage.prototype, "Controller", {
            get: function () {
                return this._ctrl;
            },
            enumerable: true,
            configurable: true
        });
        return PartyBBSPackage;
    }());
    exports.PartyBBSPackage = PartyBBSPackage;
});
define("lib/ss/preview/serif/package", ["require", "exports", "jquery", "lib/preview/view", "lib/ss/preview/controller", "lib/ss/preview/serif/model"], function (require, exports, $, view_7, controller_7, model_14) {
    "use strict";
    // import { SerifController } from "./controller";
    var SerifPackage = (function () {
        function SerifPackage(args) {
            this._model = new model_14.SerifModel(args.model.profile);
            this._view = new view_7.PreviewView(args.view.insert);
            var ctrlArg = $.extend(args.ctrl, { model: this._model, view: this._view });
            this._ctrl = new controller_7.SSPreviewController(ctrlArg);
        }
        Object.defineProperty(SerifPackage.prototype, "Model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SerifPackage.prototype, "View", {
            get: function () {
                return this._view;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SerifPackage.prototype, "Controller", {
            get: function () {
                return this._ctrl;
            },
            enumerable: true,
            configurable: true
        });
        return SerifPackage;
    }());
    exports.SerifPackage = SerifPackage;
});
define("lib/ss/preview/packages", ["require", "exports", "lib/ss/preview/diary/package", "lib/ss/preview/message/package", "lib/ss/preview/partyBBS/package", "lib/ss/preview/serif/package"], function (require, exports, package_1, package_2, package_3, package_4) {
    "use strict";
    exports.Diary = package_1.DiaryPackage;
    exports.Message = package_2.MessagePackage;
    exports.PartyBBS = package_3.PartyBBSPackage;
    exports.Serif = package_4.SerifPackage;
});
define("lib/ss/preview", ["require", "exports", "lib/ss/preview/models", "lib/ss/preview/model_formatter", "lib/ss/preview/views", "lib/ss/preview/controllers", "lib/ss/preview/packages", "lib/ss/preview/config", "lib/ss/profile"], function (require, exports, Model, Formatter, View, Controller, Package, Config, Profile) {
    "use strict";
    exports.Model = Model;
    exports.Formatter = Formatter;
    exports.View = View;
    exports.Controller = Controller;
    exports.Package = Package;
    exports.Config = Config;
    exports.Profile = Profile;
});
define("lib/ss/pages/characterSettings", ["require", "exports"], function (require, exports) {
    "use strict";
    var CharacterSettings = (function () {
        function CharacterSettings() {
        }
        CharacterSettings.ExtractIconUrlArray = function () {
            var a = [];
            for (var i = 6;; i += 3) {
                var strNum = i < 10 ? ("0" + i) : ("" + i);
                var nodes = document.getElementsByName("ctl" + strNum);
                if (nodes.length === 0) {
                    return a;
                }
                var icon = (nodes[0]);
                a.push(icon.value);
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
    exports.CharacterSettings = characterSettings_1.CharacterSettings;
});
define("SSPreviewer.user", ["require", "exports", "jquery", "lib/ss/profile", "lib/ss/page", "lib/ss/preview", "lib/ss/pages"], function (require, exports, $, profile_1, page_1, Preview, Pages) {
    "use strict";
    var SSPreviewer;
    (function (SSPreviewer) {
        // const $: JQueryStatic = jQuery;
        function Init() {
            Preview.Config.Preview.previewDelay_ms = 100;
            Preview.Config.SSPreview.randomizesDiceTagResult = true;
            function InitWithSerifPreview(profile, $targetTextBox) {
                return $targetTextBox.toArray().map(function (e, i) {
                    return new Preview.Package.Serif({
                        model: { profile: profile },
                        view: { insert: { target: e, way: Preview.View.InsertWay.InsertAfter } },
                        ctrl: { textbox: e },
                    });
                });
            }
            ;
            function InitWithMessagePreview(profile, $targetTextBox) {
                return $targetTextBox.toArray().map(function (e, i) {
                    var imageURLBox = $(e).nextUntil("input").last().next()[0];
                    return new Preview.Package.Message({
                        model: { profile: profile },
                        view: { insert: { target: imageURLBox, way: Preview.View.InsertWay.InsertAfter } },
                        ctrl: { textbox: e },
                    });
                });
            }
            ;
            function InitAllTextboxesWithSerifPreview(profile) {
                return InitWithSerifPreview(profile, $("textarea"));
            }
            ;
            function InitAllTextboxesWithMessagePreview(profile) {
                return InitWithMessagePreview(profile, $("textarea"));
            }
            ;
            function ShowAllPreviews(previews) {
                for (var _i = 0, previews_1 = previews; _i < previews_1.length; _i++) {
                    var p_1 = previews_1[_i];
                    p_1.Controller.Update();
                }
            }
            function HideAllPreviews(previews) {
                for (var _i = 0, previews_2 = previews; _i < previews_2.length; _i++) {
                    var p_2 = previews_2[_i];
                    p_2.Controller.Hide();
                }
            }
            function InsertToggleAllButton(previews) {
                if (previews.length === 0) {
                    return;
                }
                var $b = $("<a id='showAllPreviews' class='clearFix' href='#' style='display: block; float: right;'><button type='button' onclick='return false;'>全てのプレビューを<span class='hideOnActive'>表示</span><span class='showOnActive'>隠す</span></button></a>").on("click", function () {
                    $b.toggleClass("active");
                    if ($b.hasClass("active")) {
                        ShowAllPreviews(previews);
                    }
                    else {
                        HideAllPreviews(previews);
                    }
                });
                $("td.BackMessage2").eq(0).prepend($b);
            }
            var p = page_1.PageConfig;
            var profile = new profile_1.Profile();
            p.ForAllPages = new page_1.Page(profile, function (profile) {
                $("#char_Button").before("<center class='F1'>↓(Previewer) アイコン・愛称の自動読込↓</center>");
            });
            p.MainPage = new page_1.Page(profile, function (profile) {
                var previews = [];
                var diaryBox = $("#Diary_TextBox")[0];
                if (diaryBox) {
                    var diaryPreview = new Preview.Package.Diary({
                        model: { profile: profile },
                        view: { insert: { target: diaryBox, way: Preview.View.InsertWay.InsertAfter } },
                        ctrl: { textbox: diaryBox },
                    });
                    previews.push(diaryPreview);
                }
                var serifTargetBox = $("input").filter("[style*='width:367px']");
                var serifPreviews = InitWithSerifPreview(profile, serifTargetBox);
                if (serifPreviews.length > 0) {
                    Array.prototype.push.apply(previews, serifPreviews);
                }
                // let serifWhenUsingItem: HTMLInputElement = <HTMLInputElement>$("#TextBox12")[0];
                // let serifPreview_WhenUsingItem = new Preview.Package.Serif({
                //     model: { profile },
                //     view: { insert: { target: serifWhenUsingItem, way: Preview.View.InsertWay.InsertAfter } },
                //     ctrl: { textbox: serifWhenUsingItem },
                // });
                // let serifWhenDumpingItem: HTMLInputElement = <HTMLInputElement>$("#TextBox19")[0];
                // let serifPreview_WhenDumpingItem = new Preview.Package.Serif({
                //     model: { profile },
                //     view: { insert: { target: serifWhenDumpingItem, way: Preview.View.InsertWay.InsertAfter } },
                //     ctrl: { textbox: serifWhenDumpingItem },
                // });
                // let serifWhenSynsethingStone: HTMLInputElement = <HTMLInputElement>$("#TextBox20")[0];
                // let serifPreview_WhenSynsethingStone = new Preview.Package.Serif({
                //     model: { profile },
                //     view: { insert: { target: serifWhenSynsethingStone, way: Preview.View.InsertWay.InsertAfter } },
                //     ctrl: { textbox: serifWhenSynsethingStone },
                // });
                // let shout: HTMLInputElement = <HTMLInputElement>$("#TextBox17")[0];
                // let serifPreview_shout = new Preview.Package.Serif({
                //     model: { profile },
                //     view: { insert: { target: shout, way: Preview.View.InsertWay.InsertAfter } },
                //     ctrl: { textbox: shout },
                // });
                InsertToggleAllButton(previews);
            });
            p.PartyBBS = new page_1.Page(profile, function (profile) {
                var $commentBox = $("#commentTxt");
                if ($commentBox.length === 0) {
                    return;
                }
                var preview = new Preview.Package.PartyBBS({
                    model: { profile: profile },
                    view: { insert: { target: $commentBox.closest("div.BackBoard")[0], way: Preview.View.InsertWay.InsertAfter } },
                    ctrl: {
                        textbox: $commentBox[0],
                        nameInput: $("#nameTxt")[0],
                        titleInput: $("#titleTxt")[0]
                    },
                });
                InsertToggleAllButton([preview]);
            });
            p.Trade = new page_1.Page(profile, function (profile) {
                var previews = InitAllTextboxesWithSerifPreview(profile);
                InsertToggleAllButton(previews);
            });
            p.Reinforcement = new page_1.Page(profile, function (profile) {
                var previews = InitAllTextboxesWithSerifPreview(profile);
                InsertToggleAllButton(previews);
            });
            p.BattleSettings = new page_1.Page(profile, function (profile) {
                var previews = InitAllTextboxesWithSerifPreview(profile);
                InsertToggleAllButton(previews);
            });
            p.BattleWords = new page_1.Page(profile, function (profile) {
                var previews = InitAllTextboxesWithSerifPreview(profile);
                InsertToggleAllButton(previews);
            });
            p.Message = new page_1.Page(profile, function (profile) {
                var previews = InitAllTextboxesWithMessagePreview(profile);
                InsertToggleAllButton(previews);
            });
            p.GroupMessage = new page_1.Page(profile, function (profile) {
                var previews = InitAllTextboxesWithMessagePreview(profile);
                InsertToggleAllButton(previews);
            });
            p.MessageLog = new page_1.Page(profile, function (profile) {
                var previews = InitAllTextboxesWithMessagePreview(profile);
                InsertToggleAllButton(previews);
            });
            p.CharacterSettings = new page_1.Page(profile, function (profile) {
                profile.SaveIconURLArray(Pages.CharacterSettings.ExtractIconUrlArray());
                profile.SaveNickname(Pages.CharacterSettings.ExtractNickname());
            });
            p.Community = new page_1.Page(profile, function (profile) {
                var communityCaptionBox = $("textarea")[0];
                if (!communityCaptionBox) {
                    return;
                }
                var preview = new Preview.Package.Diary({
                    model: { profile: profile, showsCharCounts: false },
                    view: { insert: { target: communityCaptionBox, way: Preview.View.InsertWay.InsertAfter } },
                    ctrl: { textbox: communityCaptionBox },
                });
                InsertToggleAllButton([preview]);
            });
            p.RunInitializer(profile, document.location);
        }
        Init();
    })(SSPreviewer || (SSPreviewer = {}));
});
(function(){
    require(["SSPreviewer.user"], function(){ });
    GM_addStyle(GM_getResourceText("CSS_STYLE"));
})();
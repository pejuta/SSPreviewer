// ==UserScript==
// @name        SSPreviewer (beta)
// @namespace   11powder
// @author      pejuta
// @description 七海で色々なプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @version     0.1.020
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
    var IGroupOr = (function (_super) {
        __extends(IGroupOr, _super);
        function IGroupOr() {
            _super.apply(this, arguments);
        }
        return IGroupOr;
    }(Array));
    exports.IGroupOr = IGroupOr;
    var IGroupAnd = (function (_super) {
        __extends(IGroupAnd, _super);
        function IGroupAnd() {
            _super.apply(this, arguments);
        }
        return IGroupAnd;
    }(Array));
    exports.IGroupAnd = IGroupAnd;
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
        Parser.Parse = function (source, at3ModeAsDefault, allowsOrTag) {
            // source: /\d+/,       capture: 5n + [-4:undefined, -3:undefined, -2:iundefined, -1:iconNum  , 0: bodyText]
            // source: @@@,         capture: 5n + [-4:@@@,       -3:undefined, -2:undefined,  -1:undefined, 0: bodyText]
            // source: @@@/\d+/,    capture: 5n + [-4:@@@,       -3:undefined, -2:iconNum,    -1:undefined, 0: bodyText]
            // source: @name@,      capture: 5n + [-4:@name@,    -3:name,      -2:undefined,  -1:undefined, 0: bodyText]
            // source: @name@/\d+/, capture: 5n + [-4:@name@,    -3:name,      -2:iconNum,    -1:undefined, 0: bodyText]
            var defaultIconNumber = at3ModeAsDefault ? -1 : 0;
            var orSources;
            if (allowsOrTag) {
                orSources = source.split("###");
            }
            else {
                orSources = [source];
            }
            var ors = [];
            for (var oi = 0, oiEnd = orSources.length; oi < oiEnd; oi++) {
                // @name@周りの正規表現が複雑なのはname部分にアイコンタグ/\d+/を入れ子にされるのを防止するため。
                // /1/を先にsplitしてから@@@をsplitするように、二段階で処理する方法よりこっちの方が変更実装が楽だった。
                // これ以上手を加える場合は正規表現を簡単にして段階式にsplitする方法を採用すべき
                var andSources = orSources[oi].split(/(?:(@@@|@((?![^<@]*\/\d+\/)[^<@]+)@)(?:\/(\d+)\/)?|\/(\d+)\/)/g);
                if (andSources.length === 1) {
                    ors.push([new ParsedExpr({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: orSources[oi] })]);
                    continue;
                }
                var ands = [];
                for (var ai = 0, aiEnd = andSources.length; ai < aiEnd; ai += 5) {
                    var text = andSources[ai];
                    if (ai === 0) {
                        if (text !== "") {
                            ands.push(new ParsedExpr({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: andSources[ai] }));
                        }
                        continue;
                    }
                    var changedName = null;
                    var enableAt3Mode = at3ModeAsDefault;
                    var strIconNumber = void 0;
                    if (andSources[ai - 4] === undefined) {
                        // /\d/
                        strIconNumber = andSources[ai - 1];
                    }
                    else if (andSources[ai - 4] === "@@@") {
                        // @@@ or @@@/\d/
                        strIconNumber = andSources[ai - 2];
                        enableAt3Mode = true;
                    }
                    else {
                        // @changedName@ or @changedName@/\d/
                        strIconNumber = andSources[ai - 2];
                        changedName = andSources[ai - 3];
                        enableAt3Mode = false;
                    }
                    var iconNumber = enableAt3Mode ? -1 : 0;
                    if (strIconNumber !== undefined) {
                        iconNumber = parseInt(strIconNumber);
                    }
                    ands.push(new ParsedExpr({
                        enableAt3Mode: enableAt3Mode, changedName: changedName, iconNumber: iconNumber, text: text
                    }));
                }
                ors.push(ands);
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
define("lib/ss/preview/config", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.randomizesDiceTagResult = false;
    exports.previewDelay_ms = 0;
    exports.diary_showsCharCounts = true;
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
        Formatter.GenerateDiceTag = function (randomize) {
            if (randomize === void 0) { randomize = false; }
            var resultNum = 1;
            if (randomize) {
                resultNum = Math.floor(Math.random() * 6) + 1;
            }
            return format(Formatter._DEFAULT_DICE_TEMPLATE, { imgDir: Formatter._DEFAULT_IMG_DIR, resultNum: resultNum });
        };
        Formatter.prototype.Exec = function (source) {
            // 1: escape
            var html = htmlEscape.escape(source);
            // 2: replace Deco-tags
            html = replaceLoop(html, Formatter.reReplace_EscapedDecoTag, "<span class='$1'>$2</span>");
            // 3: parse and format
            html = this.Format(parser_1.Parser.Parse(html, this.at3ModeAsDefault, this.allowsOrTag));
            // 4: dice
            html = html.replace(Formatter.reReplace_EscapedDiceTag, function (match) {
                return Formatter.GenerateDiceTag(Config.randomizesDiceTagResult);
            });
            // 5: BR
            html = tag_1.lineBreaksToBR(html);
            html = htmlEscape.unescape(html, "<BR>", "g");
            return html;
        };
        Formatter.prototype.Format = function (exps) {
            var _this = this;
            return exps.map(function (and, oi, a) {
                return and.map(function (exp, ai, a) {
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
                    return format(template, { iconURL: iconURL, name: name, nameColor: _this.profile.nameColor, bodyHTML: bodyHTML });
                }).join(_this.separators.and);
            }).join(this.separators.or);
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
            Body_At3Mode: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"/><td class=\"String\">{bodyHTML}</td></tr></table>"
        };
        // { imgDir, resultNum }
        Formatter._DEFAULT_DICE_TEMPLATE = "<img alt=\"dice\" src=\"{imgDir}d{resultNum}.png\" border=\"0\" height=\"20\" width=\"20\">";
        Formatter._DEFAULT_IMG_DIR = "http://www.sssloxia.jp/p/";
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
define("lib/preview/model", ["require", "exports", "lib/preview/model_formatter"], function (require, exports, model_formatter_1) {
    "use strict";
    var PreviewModel = (function () {
        function PreviewModel(formatter) {
            if (formatter === void 0) { formatter = new model_formatter_1.Formatter(); }
            this.formatter = formatter;
            this.source = null;
            this.previewHTML = null;
            this.isVisible = false;
            this.isDisabled = false;
        }
        Object.defineProperty(PreviewModel.prototype, "PreviewHTML", {
            get: function () {
                return this.previewHTML;
            },
            enumerable: true,
            configurable: true
        });
        PreviewModel.prototype.Update = function (source, extraArg) {
            if (this.isDisabled) {
                return false;
            }
            // if (!this.isVisible) {
            //     return true;
            // }
            if (source === this.source) {
                return false;
            }
            this.source = source;
            this.previewHTML = this.formatter.Exec(source, extraArg);
            return true;
        };
        Object.defineProperty(PreviewModel.prototype, "IsVisible", {
            get: function () {
                return this.isVisible;
            },
            enumerable: true,
            configurable: true
        });
        PreviewModel.prototype.SetAsHidden = function () {
            this.isVisible = false;
            return this;
        };
        PreviewModel.prototype.SetAsShown = function () {
            this.isVisible = true;
            return this;
        };
        Object.defineProperty(PreviewModel.prototype, "IsDisabled", {
            get: function () {
                return this.isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        PreviewModel.prototype.SetAsDisabled = function () {
            this.isDisabled = true;
            return this;
        };
        PreviewModel.prototype.SetAsEnabled = function () {
            this.isDisabled = false;
            return this;
        };
        PreviewModel.prototype.Dispose = function () {
            this.previewHTML = null;
            this.isDisabled = true;
            this.isVisible = false;
        };
        return PreviewModel;
    }());
    exports.PreviewModel = PreviewModel;
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
define("lib/ss/preview/partyBBS/model", ["require", "exports", "lib/preview/model", "lib/ss/preview/partyBBS/model_formatter"], function (require, exports, model_1, model_formatter_3) {
    "use strict";
    var PartyBBSModel = (function (_super) {
        __extends(PartyBBSModel, _super);
        function PartyBBSModel(profile) {
            _super.call(this, new model_formatter_3.PartyBBSFormatter({
                profile: profile,
                template: PartyBBSModel.TEMPLATE,
                at3ModeAsDefault: true
            }));
        }
        PartyBBSModel.prototype.Update = function (source, extraArg) {
            if (extraArg === void 0) { extraArg = { title: "", name: "" }; }
            if (this.isDisabled) {
                return false;
            }
            if (source === this.source && extraArg.title === this.title && extraArg.name === this.name) {
                return false;
            }
            this.source = source;
            this.title = extraArg.title;
            this.name = extraArg.name;
            this.previewHTML = this.formatter.Exec(source, extraArg);
            return true;
        };
        PartyBBSModel.TEMPLATE = null;
        return PartyBBSModel;
    }(model_1.PreviewModel));
    exports.PartyBBSModel = PartyBBSModel;
});
define("lib/preview/view", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    (function (InsertionMode) {
        InsertionMode[InsertionMode["InsertAfter"] = 0] = "InsertAfter";
        InsertionMode[InsertionMode["InsertBefore"] = 1] = "InsertBefore";
        InsertionMode[InsertionMode["AppendTo"] = 2] = "AppendTo";
        InsertionMode[InsertionMode["PrependTo"] = 3] = "PrependTo";
    })(exports.InsertionMode || (exports.InsertionMode = {}));
    var InsertionMode = exports.InsertionMode;
    var PreviewView = (function () {
        function PreviewView(insertion) {
            this.insertion = insertion;
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
            switch (this.insertion.mode) {
                case InsertionMode.InsertAfter:
                    this.$container.insertAfter(this.insertion.target);
                    break;
                case InsertionMode.InsertBefore:
                    this.$container.insertBefore(this.insertion.target);
                    break;
                case InsertionMode.AppendTo:
                    this.$container.appendTo(this.insertion.target);
                    break;
                case InsertionMode.PrependTo:
                    this.$container.prependTo(this.insertion.target);
                    break;
                default:
                    throw new Error("InsertionMode指定エラー");
            }
            return this;
        };
        PreviewView.prototype.Hide = function () {
            if (!this.$container) {
                return;
            }
            this.$container.css("display", "none");
            return this;
        };
        PreviewView.prototype.Show = function () {
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
                this.Show();
            }
            else {
                this.Hide();
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
        // 名称がdeleteだとYUIに弾かれるが故に再現できない。
        FakeSet.prototype.del = function (e) {
            var index = this.indexOf(e);
            if (index === -1) {
                return false;
            }
            this.innerArray.splice(index, 1);
            return true;
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
        return FakeSet;
    }());
    return FakeSet;
});
define("lib/util/jquery/customEvent", ["require", "exports", "lib/util/array/set", "jquery"], function (require, exports, FakeSet, $) {
    "use strict";
    function ValidateEventsEquality(v1, v2) {
        return v1.target.is(v2) && v1.eventType === v2.eventType;
    }
    var Event = (function () {
        function Event(name, callback) {
            var _this = this;
            this.name = name;
            this.callback = callback;
            this._wrappedCallback = function (e) {
                if (_this.callback) {
                    _this.callback(e);
                }
                $(_this).triggerHandler(_this.name);
            };
            this.evts = new FakeSet(ValidateEventsEquality);
            // code...
        }
        Object.defineProperty(Event.prototype, "Name", {
            get: function () {
                return this.name;
            },
            enumerable: true,
            configurable: true
        });
        Event.prototype.RegisterTrigger = function (evt) {
            if (this.evts.has(evt)) {
                return false;
            }
            $(evt.target).on(evt.eventType, this._wrappedCallback);
            this.evts.add(evt);
            return true;
        };
        Event.prototype.RegisterTriggers = function (evts) {
            for (var _i = 0, evts_1 = evts; _i < evts_1.length; _i++) {
                var evt = evts_1[_i];
                this.RegisterTrigger(evt);
            }
            return this;
        };
        Event.prototype.UnregisterTrigger = function (evt) {
            if (!this.evts.has(evt)) {
                return false;
            }
            $(evt.target).off(evt.eventType, this._wrappedCallback);
            return this.evts.del(evt);
        };
        Event.prototype.UnregisterTriggers = function (evts) {
            if (!evts) {
                this.UnregisterAllTriggers();
            }
            for (var _i = 0, evts_2 = evts; _i < evts_2.length; _i++) {
                var evt = evts_2[_i];
                this.UnregisterTrigger(evt);
            }
            return this;
        };
        Event.prototype.UnregisterAllTriggers = function () {
            var _this = this;
            this.evts.forEach(function (evt) {
                $(evt.target).off(evt.eventType, _this._wrappedCallback);
            });
            this.evts.clear();
            return this;
        };
        Event.prototype.Dispose = function () {
            this.UnregisterAllTriggers();
        };
        return Event;
    }());
    exports.Event = Event;
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
define("lib/preview/controller", ["require", "exports", "lib/util/jquery/customEvent", "lib/util/timer/timerEvent"], function (require, exports, customEvent_1, TimerEvent) {
    "use strict";
    var PreviewController = (function () {
        function PreviewController(arg) {
            var _this = this;
            this.onUpdating = new customEvent_1.Event("onUpdatingPreview", function (eventObject) {
                _this.callback_onUpdating(eventObject);
            });
            this.callback_onUpdating = function (eventObject) {
                if (_this.model.IsDisabled) {
                    return false;
                }
                _this.timerEvt.Start();
                return true;
            };
            this.model = arg.model;
            this.view = arg.view;
            this.Delay_ms = arg.delay_ms === undefined ? PreviewController._DEFAULT_DELAY_MS : arg.delay_ms;
        }
        Object.defineProperty(PreviewController.prototype, "OnUpdating", {
            get: function () {
                return this.onUpdating;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PreviewController.prototype, "Delay_ms", {
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
        PreviewController.prototype.InitTimerEvent = function () {
            var _this = this;
            if (this.timerEvt) {
                this.timerEvt.Dispose();
            }
            this.timerEvt = new TimerEvent(function () {
                // この位置で毎回modelの可視状態を初期化。
                _this.model.SetAsShown();
                _this.Update();
            }, this.delay_ms);
            this.timerEvt.resetTimeWhenStarting = true;
            return this;
        };
        // manual
        PreviewController.prototype.Show = function () {
            this.model.SetAsShown();
            return this.Update();
        };
        // manual
        PreviewController.prototype.Hide = function () {
            this.model.SetAsHidden();
            return this.Update();
        };
        // manual
        PreviewController.prototype.Enable = function () {
            this.model.SetAsEnabled();
            return this.Update();
        };
        // manual
        PreviewController.prototype.Disable = function () {
            this.model.SetAsDisabled().SetAsHidden();
            return this.Update();
        };
        // manual
        PreviewController.prototype.Pause = function () {
            this.model.SetAsDisabled();
            return this.Update();
        };
        PreviewController.prototype.Dispose = function () {
            this.model.Dispose();
            this.view.Dispose();
            this.timerEvt.Dispose();
            this.onUpdating.Dispose();
        };
        PreviewController._DEFAULT_DELAY_MS = 0;
        return PreviewController;
    }());
    exports.PreviewController = PreviewController;
});
define("lib/ss/preview/controller", ["require", "exports", "lib/preview/controller", "lib/ss/preview/config"], function (require, exports, controller_1, Config) {
    "use strict";
    var SSPreviewController = (function (_super) {
        __extends(SSPreviewController, _super);
        function SSPreviewController(arg) {
            var delay_ms = (arg.delay_ms === undefined) ? Config.previewDelay_ms : arg.delay_ms;
            _super.call(this, arg);
            this.textbox = arg.textbox;
            this.OnUpdating.RegisterTrigger({ target: $(this.textbox), eventType: "keyup" });
        }
        SSPreviewController.prototype.Update = function (extraArg) {
            var source = this.textbox.value;
            if (source === "") {
                this.model.SetAsHidden();
            }
            this.model.Update(source, extraArg);
            this.view.Update(this.model);
            return this;
        };
        return SSPreviewController;
    }(controller_1.PreviewController));
    exports.SSPreviewController = SSPreviewController;
});
define("lib/ss/preview/partyBBS/controller", ["require", "exports", "lib/ss/preview/partyBBS/model", "lib/preview/view", "lib/ss/preview/controller"], function (require, exports, model_2, view_1, controller_2) {
    "use strict";
    var PartyBBSController = (function (_super) {
        __extends(PartyBBSController, _super);
        function PartyBBSController(arg) {
            var model = new model_2.PartyBBSModel(arg.profile);
            var view = new view_1.PreviewView(arg.insertion);
            _super.call(this, { delay_ms: arg.delay_ms, model: model, view: view, textbox: arg.textbox });
            this.titleInput = arg.titleInput;
            this.nameInput = arg.nameInput;
            this.OnUpdating.RegisterTriggers([
                { target: $(this.titleInput), eventType: "keyup" },
                { target: $(this.nameInput), eventType: "keyup" }
            ]);
        }
        PartyBBSController.prototype.Update = function () {
            var name = this.nameInput.value;
            var title = this.titleInput.value;
            if (name === "") {
                this.model.SetAsHidden();
            }
            return _super.prototype.Update.call(this, { name: name, title: title });
        };
        return PartyBBSController;
    }(controller_2.SSPreviewController));
    exports.PartyBBSController = PartyBBSController;
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
define("lib/ss/preview/diary/model", ["require", "exports", "lib/ss/preview/diary/model_formatter", "lib/preview/model", "lib/ss/expr/rule", "lib/ss/preview/config"], function (require, exports, model_formatter_5, model_3, rule_1, Config) {
    "use strict";
    var DiaryModel = (function (_super) {
        __extends(DiaryModel, _super);
        function DiaryModel(arg) {
            _super.call(this, new model_formatter_5.DiaryFormatter({
                profile: arg.profile,
                template: DiaryModel.TEMPLATE,
                at3ModeAsDefault: true
            }));
            if (typeof arg.showsCharCounts === "boolean") {
                this.showsCharCounts = arg.showsCharCounts;
            }
            else {
                this.showsCharCounts = Config.diary_showsCharCounts || false;
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
        DiaryModel.prototype.Update = function (source) {
            this.charCounts = rule_1.CountExprChars(source);
            return _super.prototype.Update.call(this, source);
        };
        DiaryModel.TEMPLATE = null;
        DiaryModel.MAX_LENGTH_OF_CHARS = 5000;
        DiaryModel.MAX_COUNT_OF_LFS = 2500;
        return DiaryModel;
    }(model_3.PreviewModel));
    exports.DiaryModel = DiaryModel;
});
define("lib/ss/preview/diary/view", ["require", "exports", "lib/util/string/format", "lib/ss/preview/diary/model", "lib/preview/view"], function (require, exports, format, model_4, view_2) {
    "use strict";
    var DiaryView = (function (_super) {
        __extends(DiaryView, _super);
        function DiaryView(insertion) {
            _super.call(this, insertion);
        }
        DiaryView.BuildCharCountLine = function (counts) {
            var html = DiaryView.TEMPLATE_CHARCOUNTS;
            html = format(html, {
                charCount: counts.charCount,
                charCountMax: model_4.DiaryModel.MAX_LENGTH_OF_CHARS,
                lfCount: counts.lfCount,
                lfCountMax: model_4.DiaryModel.MAX_COUNT_OF_LFS
            });
            var $p = $(html);
            if (counts.charCount > model_4.DiaryModel.MAX_LENGTH_OF_CHARS) {
                $p.children("[name=charCount]").addClass("over");
            }
            if (counts.lfCount > model_4.DiaryModel.MAX_COUNT_OF_LFS) {
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
        DiaryView.TEMPLATE_CHARCOUNTS = "<p class=\"char_count_line\">\n    <span class=\"char_count_cnt\"><span name=\"charCount\" class=\"char_count\">{charCount}</span> / {charCountMax}</span> <span class=\"lf_count_cnt\">(\u6539\u884C: <span name=\"lfCount\" class=\"lf_count\">{lfCount}</span> / {lfCountMax})</span>\n</p>";
        return DiaryView;
    }(view_2.PreviewView));
    exports.DiaryView = DiaryView;
});
define("lib/ss/preview/diary/controller", ["require", "exports", "lib/ss/preview/diary/model", "lib/ss/preview/diary/view", "lib/ss/preview/controller"], function (require, exports, model_5, view_3, controller_3) {
    "use strict";
    var DiaryController = (function (_super) {
        __extends(DiaryController, _super);
        function DiaryController(arg) {
            var model = new model_5.DiaryModel({ profile: arg.profile, showsCharCounts: arg.showsCharCounts });
            var view = new view_3.DiaryView(arg.insertion);
            _super.call(this, { delay_ms: arg.delay_ms, model: model, view: view, textbox: arg.textbox });
        }
        return DiaryController;
    }(controller_3.SSPreviewController));
    exports.DiaryController = DiaryController;
});
define("lib/ss/preview/serif/model", ["require", "exports", "lib/ss/preview/model_formatter", "lib/preview/model"], function (require, exports, model_formatter_6, model_6) {
    "use strict";
    var SerifModel = (function (_super) {
        __extends(SerifModel, _super);
        function SerifModel(profile) {
            _super.call(this, new model_formatter_6.Formatter({
                profile: profile,
                template: SerifModel.TEMPLATE,
                allowsOrTag: true
            }));
        }
        SerifModel.TEMPLATE = null;
        return SerifModel;
    }(model_6.PreviewModel));
    exports.SerifModel = SerifModel;
});
define("lib/ss/preview/serif/controller", ["require", "exports", "lib/ss/preview/serif/model", "lib/preview/view", "lib/ss/preview/controller"], function (require, exports, model_7, view_4, controller_4) {
    "use strict";
    var SerifController = (function (_super) {
        __extends(SerifController, _super);
        function SerifController(arg) {
            var model = new model_7.SerifModel(arg.profile);
            var view = new view_4.PreviewView(arg.insertion);
            _super.call(this, { delay_ms: arg.delay_ms, model: model, view: view, textbox: arg.textbox });
        }
        return SerifController;
    }(controller_4.SSPreviewController));
    exports.SerifController = SerifController;
});
define("lib/ss/preview/message/model", ["require", "exports", "lib/ss/preview/model_formatter", "lib/preview/model"], function (require, exports, model_formatter_7, model_8) {
    "use strict";
    var MessageModel = (function (_super) {
        __extends(MessageModel, _super);
        function MessageModel(profile) {
            _super.call(this, new model_formatter_7.Formatter({
                profile: profile,
                template: MessageModel.TEMPLATE
            }));
        }
        MessageModel.TEMPLATE = null;
        return MessageModel;
    }(model_8.PreviewModel));
    exports.MessageModel = MessageModel;
});
define("lib/ss/preview/message/controller", ["require", "exports", "lib/ss/preview/message/model", "lib/preview/view", "lib/ss/preview/controller"], function (require, exports, model_9, view_5, controller_5) {
    "use strict";
    var MessageController = (function (_super) {
        __extends(MessageController, _super);
        function MessageController(arg) {
            var model = new model_9.MessageModel(arg.profile);
            var view = new view_5.PreviewView(arg.insertion);
            _super.call(this, { delay_ms: arg.delay_ms, model: model, view: view, textbox: arg.textbox });
        }
        return MessageController;
    }(controller_5.SSPreviewController));
    exports.MessageController = MessageController;
});
define("lib/ss/preview/controllers", ["require", "exports", "lib/ss/preview/partyBBS/controller", "lib/ss/preview/diary/controller", "lib/ss/preview/serif/controller", "lib/ss/preview/message/controller"], function (require, exports, controller_6, controller_7, controller_8, controller_9) {
    "use strict";
    exports.PartyBBS = controller_6.PartyBBSController;
    exports.Diary = controller_7.DiaryController;
    exports.Serif = controller_8.SerifController;
    exports.Message = controller_9.MessageController;
});
define("lib/ss/preview/preview", ["require", "exports", "lib/ss/preview/controllers", "lib/ss/preview/config", "lib/preview/view"], function (require, exports, Controllers, Config, view_6) {
    "use strict";
    exports.Controllers = Controllers;
    exports.Config = Config;
    exports.InsertionMode = view_6.InsertionMode;
});
define("lib/ss/pages/characterSettings", ["require", "exports"], function (require, exports) {
    "use strict";
    var CharacterSettings = (function () {
        function CharacterSettings() {
        }
        CharacterSettings.ExtractIconUrlArray = function () {
            var defaultIconURL = "/p/default.jpg";
            var a = [];
            for (var i = 4;; i += 3) {
                var strNum = i < 10 ? ("0" + i) : ("" + i);
                var nodes = document.getElementsByName("ctl" + strNum);
                if (nodes.length === 0) {
                    return a;
                }
                var icon = (nodes[0]);
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
    exports.CharacterSettings = characterSettings_1.CharacterSettings;
});
define("SSPreviewer.user", ["require", "exports", "jquery", "lib/ss/profile", "lib/ss/page", "lib/ss/preview/preview", "lib/ss/pages"], function (require, exports, $, profile_1, page_1, Preview, Pages) {
    "use strict";
    var SSPreviewer;
    (function (SSPreviewer) {
        // const $: JQueryStatic = jQuery;
        function Init() {
            Preview.Config.previewDelay_ms = 100;
            Preview.Config.randomizesDiceTagResult = true;
            $("head").append("<style type='text/css'>\n    .clearfix:after {\n        content: \"\";\n        display: block;\n        clear: both;\n    }\n    .separator_or {\n        background-color: rgba(255,255,255,0.25);\n        border-radius: 2px;\n        margin: 4px 0px;\n        text-align: center;\n        vertical-align: middle;\n    }\n    .separator_or:before {\n        content: \"- OR -\";\n    }\n</style>");
            function InitAllTextboxesWithSerifPreview(profile) {
                return $("textarea").toArray().map(function (e, i) {
                    return new Preview.Controllers.Serif({
                        profile: profile,
                        insertion: { target: e, mode: Preview.InsertionMode.InsertAfter },
                        textbox: e,
                    });
                });
            }
            ;
            function InitAllTextboxesWithMessagePreview(profile) {
                return $("textarea").toArray().map(function (e, i) {
                    var imageURLBox = $(e).nextUntil("input").last().next()[0];
                    return new Preview.Controllers.Message({
                        profile: profile,
                        insertion: { target: e, mode: Preview.InsertionMode.InsertAfter },
                        textbox: e,
                    });
                });
            }
            ;
            function ShowAllPreviews(previews) {
                for (var _i = 0, previews_1 = previews; _i < previews_1.length; _i++) {
                    var p_1 = previews_1[_i];
                    p_1.Show();
                }
            }
            function HideAllPreviews(previews) {
                for (var _i = 0, previews_2 = previews; _i < previews_2.length; _i++) {
                    var p_2 = previews_2[_i];
                    p_2.Hide();
                }
            }
            function InsertToggleAllButton(previews) {
                $("head").append("<style type='text/css'>\n        .showOnActive, .active .hideOnActive {\n            display: none;\n        }\n        .active .showOnActive, .hideOnActive {\n            display: inherit;\n        }\n    </style>");
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
            p.Common = new page_1.Page(profile, function (profile) {
                $("#char_Button").before("<center class='F1'>↓(Previewer) アイコン・愛称の自動読込↓</center>");
            });
            p.MainPage = new page_1.Page(profile, function (profile) {
                $("head").append("<style type='text/css'>\n    .char_count_line {\n        text-align: left;\n    }\n    .char_count_cnt {\n        font-size: 12px;\n    }\n    .lf_count_cnt {\n        font-size: 10px;\n    }\n    .char_count_line .char_count_over, .char_count_line .lf_count_over {\n        color: #CC3333;\n        font-weight: bold;\n    }\n    .char_count_line .char_count_over {\n        font-size: 16px;\n    }\n    .char_count_line .lf_count_over {\n        font-size: 14px;\n    }\n</style>");
                var diaryBox = $("#Diary_TextBox")[0];
                var diaryPreview = new Preview.Controllers.Diary({
                    profile: profile,
                    insertion: { target: diaryBox, mode: Preview.InsertionMode.InsertAfter },
                    textbox: diaryBox,
                });
                var serifWhenUsingItem = $("#TextBox12")[0];
                var serifPreview_WhenUsingItem = new Preview.Controllers.Serif({
                    profile: profile,
                    insertion: { target: serifWhenUsingItem, mode: Preview.InsertionMode.InsertAfter },
                    textbox: serifWhenUsingItem,
                });
                var serifWhenDumpingItem = $("#TextBox19")[0];
                var serifPreview_WhenDumpingItem = new Preview.Controllers.Serif({
                    profile: profile,
                    insertion: { target: serifWhenDumpingItem, mode: Preview.InsertionMode.InsertAfter },
                    textbox: serifWhenDumpingItem,
                });
                InsertToggleAllButton([diaryPreview, serifPreview_WhenUsingItem, serifPreview_WhenDumpingItem]);
            });
            p.PartyBBS = new page_1.Page(profile, function (profile) {
                var $commentBox = $("#commentTxt");
                var preview = new Preview.Controllers.PartyBBS({
                    profile: profile,
                    insertion: { target: $commentBox.closest("div.BackBoard")[0], mode: Preview.InsertionMode.InsertAfter },
                    textbox: $commentBox[0],
                    nameInput: $("#nameTxt")[0],
                    titleInput: $("#titleTxt")[0]
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
            p.CharacterSettings = new page_1.Page(profile, function (profile) {
                profile.SaveIconURLArray(Pages.CharacterSettings.ExtractIconUrlArray());
                profile.SaveNickname(Pages.CharacterSettings.ExtractNickname());
            });
            p.Community = new page_1.Page(profile, function (profile) {
                var communityCaptionBox = $("textarea")[0];
                var preview = new Preview.Controllers.Diary({
                    profile: profile,
                    insertion: { target: communityCaptionBox, mode: Preview.InsertionMode.InsertAfter },
                    textbox: communityCaptionBox,
                    showsCharCounts: false
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
})();
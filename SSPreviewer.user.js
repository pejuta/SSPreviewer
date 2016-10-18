// ==UserScript==
// @name        SSPreviewer (beta)
// @namespace   11powder
// @description 何かのプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @version     0.1.012
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
var JQueryUtil = (function () {
    function JQueryUtil() {
    }
    JQueryUtil.replaceTo = function (from, to) {
        var $to = $(to);
        $(from).replaceWith($to);
        return $to;
    };
    return JQueryUtil;
}());
var Preview;
(function (Preview) {
    (function (InsertionMode) {
        InsertionMode[InsertionMode["InsertAfter"] = 0] = "InsertAfter";
        InsertionMode[InsertionMode["InsertBefore"] = 1] = "InsertBefore";
        InsertionMode[InsertionMode["AppendTo"] = 2] = "AppendTo";
        InsertionMode[InsertionMode["PrependTo"] = 3] = "PrependTo";
    })(Preview.InsertionMode || (Preview.InsertionMode = {}));
    var InsertionMode = Preview.InsertionMode;
    var EventBasedPreview = (function () {
        function EventBasedPreview(insertionTarget, insertionMode) {
            var _this = this;
            this.insertionTarget = insertionTarget;
            this.insertionMode = insertionMode;
            this.isDisabled = false;
            this._eventCallback = function (eventObject) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (!_this.isDisabled) {
                    _this.Update();
                }
            };
        }
        Object.defineProperty(EventBasedPreview.prototype, "IsDisabled", {
            get: function () {
                return this.isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        EventBasedPreview.prototype.Pause = function () {
            this.isDisabled = true;
            return this;
        };
        EventBasedPreview.prototype.Disable = function () {
            this.isDisabled = true;
            return this.Hide();
        };
        EventBasedPreview.prototype.Enable = function () {
            this.isDisabled = false;
            return this.Update();
        };
        EventBasedPreview.prototype.RegisterEventHandler = function (arg, eventType) {
            if (arg instanceof HTMLElement) {
                this.evts = [{ elem: arg, eventType: eventType }];
            }
            else {
                this.evts = arg;
            }
            for (var _i = 0, _a = this.evts; _i < _a.length; _i++) {
                var evt = _a[_i];
                $(evt.elem).on(evt.eventType, this._eventCallback);
            }
            return this;
        };
        EventBasedPreview.prototype.UnregisterEventHandler = function (arg, eventType) {
            var currentEvts = this.evts;
            this.evts = [];
            if (arg === undefined) {
                for (var _i = 0, currentEvts_1 = currentEvts; _i < currentEvts_1.length; _i++) {
                    var evt = currentEvts_1[_i];
                    $(evt.elem).off(evt.eventType, this._eventCallback);
                }
                return this;
            }
            var seekedEvts;
            if (arg instanceof HTMLElement) {
                seekedEvts = [{ elem: arg, eventType: eventType }];
            }
            else {
                seekedEvts = arg;
            }
            var removedEvts = [];
            for (var eri = currentEvts.length - 1; eri >= 0; eri--) {
                for (var sri = seekedEvts.length - 1; sri >= 0; sri--) {
                    var e = currentEvts[eri];
                    var se = seekedEvts[sri];
                    if (se.elem === e.elem && se.eventType === e.eventType) {
                        removedEvts.push(e);
                        break;
                    }
                    if (sri === 0) {
                        this.evts.push(e);
                    }
                }
            }
            for (var _a = 0, removedEvts_1 = removedEvts; _a < removedEvts_1.length; _a++) {
                var evt = removedEvts_1[_a];
                $(evt.elem).off(evt.eventType, this._eventCallback);
            }
            return this;
        };
        Object.defineProperty(EventBasedPreview.prototype, "Preview", {
            get: function () {
                return this.preview;
            },
            enumerable: true,
            configurable: true
        });
        EventBasedPreview.prototype.InsertPreview = function (newHtml) {
            var $preview = $(newHtml);
            this.preview = $preview[0];
            switch (this.insertionMode) {
                case InsertionMode.InsertAfter:
                    $preview.insertAfter(this.insertionTarget);
                    break;
                case InsertionMode.InsertBefore:
                    $preview.insertBefore(this.insertionTarget);
                    break;
                case InsertionMode.AppendTo:
                    $preview.appendTo(this.insertionTarget);
                    break;
                case InsertionMode.PrependTo:
                    $preview.prependTo(this.insertionTarget);
                    break;
                default:
                    throw new Error("InsertionMode指定エラー");
            }
            return this;
        };
        EventBasedPreview.prototype.OverwritePreview = function (newHtml) {
            if (this.preview) {
                this.preview = JQueryUtil.replaceTo(this.preview, newHtml)[0];
            }
            else {
                this.InsertPreview(newHtml);
            }
            return this;
        };
        EventBasedPreview.prototype.Show = function () {
            return this.Update();
        };
        EventBasedPreview.prototype.Hide = function () {
            $(this.preview).hide();
            return this;
        };
        EventBasedPreview.prototype.Dispose = function () {
            this.Disable().UnregisterEventHandler().Hide();
        };
        return EventBasedPreview;
    }());
    Preview.EventBasedPreview = EventBasedPreview;
})(Preview || (Preview = {}));
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
    var SSConfig = (function () {
        function SSConfig(c) {
            if (c) {
                this.iconURLArray = c.iconURLArray;
                this.nickname = c.nickname;
                this.nameColor = c.nameColor;
            }
            else {
                this.iconURLArray = SSConfig.LoadIconURLArray();
                this.nickname = SSConfig.LoadNickname();
                this.nameColor = SSConfig.LoadNameColor();
            }
        }
        Object.defineProperty(SSConfig.prototype, "IconURLArray", {
            get: function () {
                return this.iconURLArray;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSConfig.prototype, "Nickname", {
            get: function () {
                return this.nickname;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSConfig.prototype, "NameColor", {
            get: function () {
                return this.nameColor;
            },
            enumerable: true,
            configurable: true
        });
        SSConfig.prototype.setIconURLArray = function (iconURLArray) {
            this.iconURLArray = iconURLArray;
            return this;
        };
        SSConfig.prototype.setNickname = function (nickname) {
            this.nickname = nickname;
            return this;
        };
        SSConfig.prototype.setNameColor = function (nameColor) {
            this.nameColor = nameColor;
            return this;
        };
        SSConfig.prototype.SaveIconURLArray = function (overwriteWith) {
            if (overwriteWith !== undefined) {
                this.iconURLArray = overwriteWith;
            }
            SSConfig.SaveIconURLArray(this.iconURLArray);
            return this;
        };
        SSConfig.prototype.SaveNickname = function (overwriteWith) {
            if (overwriteWith !== undefined) {
                this.nickname = overwriteWith;
            }
            SSConfig.SaveNickname(this.nickname);
            return this;
        };
        SSConfig.prototype.SaveNameColor = function (overwriteWith) {
            if (overwriteWith !== undefined) {
                this.nameColor = overwriteWith;
            }
            SSConfig.SaveNameColor(this.nickname);
            return this;
        };
        SSConfig.LoadIconURLArray = function () {
            var json = localStorage.getItem("SSPreview_IconURLArray");
            if (json === null) {
                return [];
            }
            return JSON.parse(json);
        };
        SSConfig.SaveIconURLArray = function (iconURLArray) {
            localStorage.setItem("SSPreview_IconURLArray", JSON.stringify(iconURLArray));
        };
        SSConfig.LoadNickname = function () {
            var name = localStorage.getItem("SSPreview_Nickname");
            if (name === null) {
                return "(名称)";
            }
            return name;
        };
        SSConfig.SaveNickname = function (nickname) {
            localStorage.setItem("SSPreview_Nickname", nickname);
        };
        SSConfig.LoadNameColor = function () {
            var color = localStorage.getItem("SSPreview_NameColor");
            if (color === null) {
                return "";
            }
            return color;
        };
        SSConfig.SaveNameColor = function (nameColor) {
            localStorage.setItem("SSPreview_NameColor", nameColor);
        };
        return SSConfig;
    }());
    SS.SSConfig = SSConfig;
    var SSParsedExpression = (function () {
        function SSParsedExpression(arg) {
            this.enableAt3Mode = arg.enableAt3Mode;
            this.iconNumber = arg.iconNumber;
            this.text = arg.text;
            this.changedName = arg.hasOwnProperty("changedName") ? arg.changedName : null;
        }
        Object.defineProperty(SSParsedExpression.prototype, "EnableAt3Mode", {
            get: function () {
                return this.enableAt3Mode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSParsedExpression.prototype, "Text", {
            get: function () {
                return this.text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSParsedExpression.prototype, "IconNumber", {
            get: function () {
                return this.iconNumber;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSParsedExpression.prototype, "ChangedName", {
            get: function () {
                return this.changedName;
            },
            enumerable: true,
            configurable: true
        });
        return SSParsedExpression;
    }());
    var SSExpressionFormatter = (function () {
        function SSExpressionFormatter(args) {
            this.ssconfig = args.ssconfig;
            this.templates = args.templates || SSExpressionFormatter._DEFAULT_TEMPLATE;
            this.separator = args.separator || "";
            this.at3ModeAsDefault = args.at3ModeAsDefault || false;
        }
        Object.defineProperty(SSExpressionFormatter.prototype, "Templates", {
            get: function () {
                return this.templates;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSExpressionFormatter.prototype, "Separator", {
            get: function () {
                return this.separator;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSExpressionFormatter.prototype, "SSConfig", {
            get: function () {
                return this.ssconfig;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SSExpressionFormatter.prototype, "At3ModeAsDefault", {
            get: function () {
                return this.at3ModeAsDefault;
            },
            enumerable: true,
            configurable: true
        });
        SSExpressionFormatter.GenerateDiceTag = function () {
            var result = Math.floor(Math.random() * 6) + 1;
            return "<img alt=\"dice\" src=\"" + SSExpressionFormatter._DEFAULT_IMG_DIR + "d" + result + ".png\" border=\"0\" align=\"left\" height=\"20\" width=\"20\">";
        };
        SSExpressionFormatter.prototype.Exec = function (source) {
            var html = HTMLUtil.escape(source);
            html = StringUtil.replaceLoop(html, SSExpressionFormatter.reReplace_EscapedDecoTag, "<span class='$1'>$2</span>");
            html = this.Format(SSExpressionFormatter.ParseExpression(html, this.at3ModeAsDefault));
            html = html.replace(SSExpressionFormatter.reReplace_EscapedDiceTag, function (match) {
                return SSExpressionFormatter.GenerateDiceTag();
            });
            html = HTMLUtil.replaceLineBreaksToBRTag(html);
            html = HTMLUtil.UnescapeBRTag(html);
            return html;
        };
        SSExpressionFormatter.prototype.Format = function (exps) {
            var _this = this;
            return exps.map(function (exp, i, a) {
                var template;
                if (exp.EnableAt3Mode) {
                    if (exp.IconNumber === -1) {
                        template = _this.templates.Body_At3Mode;
                    }
                    else {
                        template = _this.templates.Body_At3ModeAndIcon;
                    }
                }
                else {
                    template = _this.templates.Body;
                }
                var iconURL = "";
                if (exp.IconNumber !== -1) {
                    iconURL = _this.ssconfig.IconURLArray[exp.IconNumber] || (SSExpressionFormatter._DEFAULT_IMG_DIR + "default.jpg");
                }
                var name = exp.ChangedName === null ? _this.ssconfig.Nickname : exp.ChangedName;
                var bodyHTML = exp.Text;
                return StringUtil.format(template, { iconURL: iconURL, name: name, nameColor: _this.ssconfig.NameColor, bodyHTML: bodyHTML });
            }).join(this.separator);
        };
        SSExpressionFormatter.ParseExpression = function (source, at3ModeAsDefault) {
            var defaultIconNumber = at3ModeAsDefault ? -1 : 0;
            var texts = source.split(/(?:(@@@|@((?![^<@]*\/\d+\/)[^<@]+)@)(?:\/(\d+)\/)?|\/(\d+)\/)/g);
            if (texts.length === 1) {
                return [new SSParsedExpression({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: source })];
            }
            var exps = [];
            for (var ti = 0, tiEnd = texts.length; ti < tiEnd; ti += 5) {
                var text = texts[ti];
                if (ti === 0) {
                    if (text !== "") {
                        exps.push(new SSParsedExpression({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: texts[ti] }));
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
                exps.push(new SSParsedExpression({
                    enableAt3Mode: enableAt3Mode, changedName: changedName, iconNumber: iconNumber, text: text
                }));
            }
            return exps;
        };
        SSExpressionFormatter._DEFAULT_TEMPLATE = {
            Body: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\" rowspan=\"2\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"Name\"><font color=\"{nameColor}\" class=\"B\">{name}</font></td></tr><tr><td class=\"Words\">\u300C{bodyHTML}\u300D</td></tr></table>",
            Body_At3ModeAndIcon: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"String\">{bodyHTML}</td></tr></table>",
            Body_At3Mode: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"></td><td class=\"String\">{bodyHTML}</td></tr></table>"
        };
        SSExpressionFormatter._DEFAULT_IMG_DIR = "http://www.sssloxia.jp/p/";
        SSExpressionFormatter.reReplace_EscapedDecoTag = new RegExp(HTMLUtil.escape("<(F[1-7]|B|I|S)>([\\s\\S]*?)</\\1>"), "g");
        SSExpressionFormatter.reReplace_EscapedDiceTag = new RegExp(HTMLUtil.escape("<D>"), "g");
        return SSExpressionFormatter;
    }());
    SS.SSExpressionFormatter = SSExpressionFormatter;
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
        PageConfig.RunInitializer = function (ssc, location) {
            if (this.Common) {
                this.Common.Init(ssc);
            }
            var path = location.pathname;
            if (PageConfig.pathnameToPage.hasOwnProperty(path) && PageConfig.pathnameToPage[path]) {
                PageConfig.pathnameToPage[path].Init(ssc);
            }
        };
        return PageConfig;
    }());
    SS.PageConfig = PageConfig;
    var Page = (function () {
        function Page(ssc, initializer) {
            this.ssc = ssc;
            this.initializer = initializer;
        }
        Page.prototype.Init = function (ssc) {
            this.initializer(ssc);
        };
        Object.defineProperty(Page.prototype, "Settings", {
            get: function () {
                return this.ssc;
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
    var SSPreview;
    (function (SSPreview) {
        var SSEventPreviewBase = (function (_super) {
            __extends(SSEventPreviewBase, _super);
            function SSEventPreviewBase(args) {
                _super.call(this, args.insertionTarget, args.insertionMode);
                this.textbox = args.textbox;
                this.ssc = args.ssc;
                this.formatter = args.formatter;
                if (args.hasOwnProperty("template_container")) {
                    this.template_container = args.template_container;
                }
                else {
                    this.template_container = "<div name='Preview'>{html}</div>";
                }
                this.RegisterEventHandler(this.textbox, "keyup");
            }
            SSEventPreviewBase.prototype.Update = function () {
                var source = this.textbox.value;
                if (source === "") {
                    return this.Hide();
                }
                var previewHTML = StringUtil.format(this.template_container, { html: this.formatter.Exec(source) });
                this.OverwritePreview(previewHTML);
                return this;
            };
            return SSEventPreviewBase;
        }(Preview.EventBasedPreview));
        SSPreview.SSEventPreviewBase = SSEventPreviewBase;
        var SerifPreview = (function (_super) {
            __extends(SerifPreview, _super);
            function SerifPreview(args) {
                var formatter = new SS.SSExpressionFormatter({ ssconfig: args.ssc, at3ModeAsDefault: false });
                _super.call(this, {
                    insertionTarget: args.insertionTarget,
                    insertionMode: args.insertionMode,
                    textbox: args.textbox,
                    ssc: args.ssc,
                    formatter: formatter
                });
            }
            return SerifPreview;
        }(SSEventPreviewBase));
        SSPreview.SerifPreview = SerifPreview;
        var MessagePreview = (function (_super) {
            __extends(MessagePreview, _super);
            function MessagePreview(args) {
                var formatter = new SS.SSExpressionFormatter({ ssconfig: args.ssc, at3ModeAsDefault: false });
                _super.call(this, {
                    insertionTarget: args.insertionTarget,
                    insertionMode: args.insertionMode,
                    textbox: args.textbox,
                    ssc: args.ssc,
                    formatter: formatter
                });
            }
            return MessagePreview;
        }(SSEventPreviewBase));
        SSPreview.MessagePreview = MessagePreview;
        var PartyBBSPreview = (function (_super) {
            __extends(PartyBBSPreview, _super);
            function PartyBBSPreview(args) {
                var formatter = new SS.SSExpressionFormatter({ ssconfig: args.ssc, at3ModeAsDefault: true });
                _super.call(this, {
                    insertionTarget: args.insertionTarget,
                    insertionMode: args.insertionMode,
                    textbox: args.textbox,
                    ssc: args.ssc,
                    formatter: formatter
                });
                this.nameBox = args.nameBox;
                this.titleBox = args.titleBox;
                this.RegisterEventHandler([
                    { elem: this.nameBox, eventType: "keyup" },
                    { elem: this.titleBox, eventType: "keyup" }
                ]);
            }
            PartyBBSPreview.prototype.UpdateContainer = function () {
                var title = this.titleBox.value || "無題";
                var name = this.nameBox.value;
                this.template_container = StringUtil.format(PartyBBSPreview.TEMPLATE, { title: title, name: name });
                return this;
            };
            PartyBBSPreview.prototype.Update = function () {
                this.UpdateContainer();
                _super.prototype.Update.call(this);
                return this;
            };
            PartyBBSPreview.TEMPLATE = "<div name='Preview'><div class='BackBoard'><b>xxx ：{title}</b> &nbsp;&nbsp;{name}&#12288;（20xx/xx/xx xx:xx:xx） <br> <br>{html}<br><br><br clear='ALL'></div></div>";
            return PartyBBSPreview;
        }(SSEventPreviewBase));
        SSPreview.PartyBBSPreview = PartyBBSPreview;
        var DiaryPreview = (function (_super) {
            __extends(DiaryPreview, _super);
            function DiaryPreview(args) {
                var formatter = new SS.SSExpressionFormatter({ ssconfig: args.ssc, at3ModeAsDefault: true });
                _super.call(this, { insertionTarget: args.insertionTarget,
                    insertionMode: args.insertionMode,
                    textbox: args.textbox,
                    ssc: args.ssc,
                    formatter: formatter,
                    template_container: DiaryPreview.TEMPLATE
                });
            }
            DiaryPreview.TEMPLATE = "<div name='Preview'><div class='tablestyle3'>{html}</div></div>";
            return DiaryPreview;
        }(SSEventPreviewBase));
        SSPreview.DiaryPreview = DiaryPreview;
    })(SSPreview = SS.SSPreview || (SS.SSPreview = {}));
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
    var InitAllTextboxesWithSerifPreview = function (ssc) {
        $("textarea").each(function (i, e) {
            var preview = new SS.SSPreview.SerifPreview({
                insertionTarget: e,
                insertionMode: Preview.InsertionMode.InsertAfter,
                textbox: e,
                ssc: ssc
            });
        });
    };
    var InitAllTextboxesWithMessagePreview = function (ssc) {
        $("textarea").each(function (i, e) {
            var imageURLBox = $(e).nextUntil("input").last().next()[0];
            var preview = new SS.SSPreview.MessagePreview({
                insertionTarget: imageURLBox,
                insertionMode: Preview.InsertionMode.InsertAfter,
                textbox: e,
                ssc: ssc
            });
        });
    };
    var p = SS.PageConfig;
    var ssc = new SS.SSConfig();
    p.Common = new SS.Page(ssc, function (ssc) {
        $("#char_Button").before("<center class='F1'>↓(SSPreviewer) アイコン・愛称の自動読込↓</center>");
    });
    p.MainPage = new SS.Page(ssc, function (ssc) {
        var diaryBox = $("#Diary_TextBox")[0];
        var diaryPreview = new SS.SSPreview.DiaryPreview({
            insertionTarget: diaryBox,
            insertionMode: Preview.InsertionMode.InsertAfter,
            textbox: diaryBox,
            ssc: ssc
        });
        var serifWhenUsingItem = $("#TextBox12")[0];
        var serifPreview_WhenUsingItem = new SS.SSPreview.SerifPreview({
            insertionTarget: serifWhenUsingItem,
            insertionMode: Preview.InsertionMode.InsertAfter,
            textbox: serifWhenUsingItem,
            ssc: ssc
        });
    });
    p.PartyBBS = new SS.Page(ssc, function (ssc) {
        var $commentBox = $("#commentTxt");
        var preview = new SS.SSPreview.PartyBBSPreview({
            insertionTarget: $commentBox.closest("div.BackBoard")[0],
            insertionMode: Preview.InsertionMode.InsertAfter,
            textbox: $commentBox[0],
            ssc: ssc,
            nameBox: $("#nameTxt")[0],
            titleBox: $("#titleTxt")[0]
        });
    });
    p.Trade = new SS.Page(ssc, function (ssc) {
        InitAllTextboxesWithSerifPreview(ssc);
    });
    p.Reinforcement = new SS.Page(ssc, function (ssc) {
        InitAllTextboxesWithSerifPreview(ssc);
    });
    p.BattleSettings = new SS.Page(ssc, function (ssc) {
        InitAllTextboxesWithSerifPreview(ssc);
    });
    p.BattleWords = new SS.Page(ssc, function (ssc) {
        InitAllTextboxesWithSerifPreview(ssc);
    });
    p.Message = new SS.Page(ssc, function (ssc) {
        InitAllTextboxesWithMessagePreview(ssc);
    });
    p.GroupMessage = new SS.Page(ssc, function (ssc) {
        InitAllTextboxesWithMessagePreview(ssc);
    });
    p.CharacterSettings = new SS.Page(ssc, function (ssc) {
        ssc.SaveIconURLArray(Pages.CharacterSettings.ExtractIconUrlArray());
        ssc.SaveNickname(Pages.CharacterSettings.ExtractNickname());
    });
    p.Community = new SS.Page(ssc, function (ssc) {
        var communityCaptionBox = $("textarea")[0];
        var communityCaptionPreview = new SS.SSPreview.DiaryPreview({
            insertionTarget: communityCaptionBox,
            insertionMode: Preview.InsertionMode.InsertAfter,
            textbox: communityCaptionBox,
            ssc: ssc
        });
    });
    p.RunInitializer(ssc, document.location);
})(Program || (Program = {}));

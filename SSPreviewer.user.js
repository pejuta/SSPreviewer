// ==UserScript==
// @name        SSPreviewer (beta)
// @namespace   11powder
// @description 何かのプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.js
// @version     0.1.010
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
var Program;
(function (Program) {
    var $ = jQuery;
    var Utility;
    (function (Utility) {
        var JQueryUtil = (function () {
            function JQueryUtil() {
            }
            // replaceWithとは異なり、戻り値は置換先オブジェクト
            JQueryUtil.replaceTo = function (from, to) {
                var $to = $(to);
                $(from).replaceWith($to);
                return $to;
            };
            return JQueryUtil;
        }());
        Utility.JQueryUtil = JQueryUtil;
        var String = (function () {
            function String() {
            }
            String.replaceLoop = function (searchTarget, searchValue, replaceTo) {
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
            };
            String.format = function (template, args) {
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
            return String;
        }());
        Utility.String = String;
        var HTML;
        (function (HTML) {
            var escapeMap = {
                "&": "&amp;",
                "'": "&#x27;",
                "`": "&#x60;",
                "\"": "&quot;",
                "<": "&lt;",
                ">": "&gt;"
            };
            var escapeReg = new RegExp("[" + Object.keys(escapeMap).join("") + "]", "g");
            HTML.escape = function (s) {
                if (s === null || s === undefined) {
                    return s;
                }
                return ("" + s).replace(escapeReg, function (match) { return escapeMap[match]; });
            };
            HTML.replaceLineBreaksToBRTag = function (html) {
                return html.replace(/(?:\r\n|\r|\n)/g, "<BR>");
            };
            // capture: [odd: HTML, even: iconNumber]
            var re_escapedBRTag = new RegExp(Utility.HTML.escape("<BR>"), "g");
            HTML.UnescapeBRTag = function (source) {
                return source.replace(re_escapedBRTag, "<BR>");
            };
        })(HTML = Utility.HTML || (Utility.HTML = {}));
    })(Utility || (Utility = {}));
    var Preview;
    (function (Preview) {
        var EventBasedPreview = (function () {
            function EventBasedPreview(insertAfter) {
                this.insertAfter = insertAfter;
            }
            EventBasedPreview.prototype.HundleUpdateEvent = function (arg, eventType) {
                var _this = this;
                var evtArr;
                if (arg instanceof HTMLElement) {
                    evtArr = [{ elem: arg, eventType: eventType }];
                }
                else {
                    evtArr = arg;
                }
                for (var _i = 0, evtArr_1 = evtArr; _i < evtArr_1.length; _i++) {
                    var evt = evtArr_1[_i];
                    $(evt.elem).on(evt.eventType, function (e) { return _this.Update(); });
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
            EventBasedPreview.prototype.OverwritePreview = function (newHtml) {
                if (this.preview) {
                    this.preview = Utility.JQueryUtil.replaceTo(this.preview, newHtml)[0];
                }
                else {
                    this.preview = $(newHtml).insertAfter(this.insertAfter)[0];
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
            return EventBasedPreview;
        }());
        Preview.EventBasedPreview = EventBasedPreview;
    })(Preview || (Preview = {}));
    var SS;
    (function (SS) {
        var SSSettings = (function () {
            function SSSettings() {
                this.iconURLArray = SSSettings.LoadIconURLArray();
                this.nickname = SSSettings.LoadNickname();
                this.pno = SSSettings.ReadPNoByCookie();
                this.nameColor = "";
            }
            Object.defineProperty(SSSettings.prototype, "IconURLArray", {
                get: function () {
                    return this.iconURLArray;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SSSettings.prototype, "Nickname", {
                get: function () {
                    return this.nickname;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SSSettings.prototype, "PNo", {
                get: function () {
                    return this.pno;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SSSettings.prototype, "NameColor", {
                get: function () {
                    return this.nameColor;
                },
                enumerable: true,
                configurable: true
            });
            SSSettings.prototype.SaveIconURLArray = function (overwriteWith) {
                if (overwriteWith) {
                    this.iconURLArray = overwriteWith;
                }
                SSSettings.SaveIconURLArray(this.iconURLArray);
            };
            SSSettings.prototype.SaveNickname = function (overwriteWith) {
                if (overwriteWith) {
                    this.nickname = overwriteWith;
                }
                SSSettings.SaveNickname(this.nickname);
            };
            // 読み込めなかった場合eno0扱い
            SSSettings.ReadPNoByCookie = function () {
                var pno = $.cookie("pno");
                if (pno === null) {
                    return 0;
                }
                return parseInt(pno);
            };
            SSSettings.LoadIconURLArray = function () {
                var json = localStorage.getItem("SSPreviewer_ICON_URL_ARRAY");
                if (json === null) {
                    return [];
                }
                return JSON.parse(json);
            };
            SSSettings.SaveIconURLArray = function (iconURLArray) {
                localStorage.setItem("SSPreviewer_ICON_URL_ARRAY", JSON.stringify(iconURLArray));
            };
            SSSettings.LoadNickname = function () {
                var name = localStorage.getItem("SSPreviewer_NICKNAME");
                if (name === null) {
                    return "(名称)";
                }
                return name;
            };
            SSSettings.SaveNickname = function (nickname) {
                localStorage.setItem("SSPreviewer_NICKNAME", nickname);
            };
            return SSSettings;
        }());
        SS.SSSettings = SSSettings;
        var ParsedExpression = (function () {
            function ParsedExpression(arg) {
                this.enableAt3Mode = arg.enableAt3Mode;
                this.iconNumber = arg.iconNumber;
                this.text = arg.text;
                this.changedName = arg.hasOwnProperty("changedName") ? arg.changedName : null;
            }
            Object.defineProperty(ParsedExpression.prototype, "EnableAt3Mode", {
                get: function () {
                    return this.enableAt3Mode;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ParsedExpression.prototype, "Text", {
                get: function () {
                    return this.text;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ParsedExpression.prototype, "IconNumber", {
                get: function () {
                    return this.iconNumber;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ParsedExpression.prototype, "ChangedName", {
                get: function () {
                    return this.changedName;
                },
                enumerable: true,
                configurable: true
            });
            return ParsedExpression;
        }());
        var TEMPLATE_DEFAULT = {
            Body: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\" rowspan=\"2\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"Name\"><font color=\"{nameColor}\" class=\"B\">{name}</font></td></tr><tr><td class=\"Words\">\u300C{bodyHTML}\u300D</td></tr></table>",
            Body_At3ModeAndIcon: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"><IMG border = 0 alt=Icon align=left src=\"{iconURL}\" width=60 height=60></td><td class=\"String\">{bodyHTML}</td></tr></table>",
            Body_At3Mode: "<table class=\"WordsTable\" CELLSPACING=0 CELLPADDING=0><tr><td class=\"Icon\"></td><td class=\"String\">{bodyHTML}</td></tr></table>"
        };
        var SSExpressionFormatter = (function () {
            function SSExpressionFormatter(args) {
                this.settings = args.settings;
                this.templates = args.templates || TEMPLATE_DEFAULT;
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
            Object.defineProperty(SSExpressionFormatter.prototype, "Settings", {
                get: function () {
                    return this.settings;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SSExpressionFormatter.prototype, "At3ModeAsDefault", {
                // 名前の通りデフォルトで@@@タグモードを有効にするかどうか。
                get: function () {
                    return this.at3ModeAsDefault;
                },
                enumerable: true,
                configurable: true
            });
            SSExpressionFormatter.prototype.Exec = function (source) {
                // 1: escape
                var html = Utility.HTML.escape(source);
                // 2: replace Deco-tags
                html = Utility.String.replaceLoop(html, SSExpressionFormatter.reReplaceEscapedDecoTag, "<span class='$1'>$2</span>");
                // 3: parse and format
                html = this.Format(SSExpressionFormatter.ParseExpression(html, this.at3ModeAsDefault));
                // last: BR
                html = Utility.HTML.replaceLineBreaksToBRTag(html);
                html = Utility.HTML.UnescapeBRTag(html);
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
                        iconURL = _this.settings.IconURLArray[exp.IconNumber] || "http://www.sssloxia.jp/p/default.jpg"; // デフォルトURL
                    }
                    var name = exp.ChangedName === null ? _this.settings.Nickname : exp.ChangedName;
                    var bodyHTML = exp.Text;
                    return Utility.String.format(template, { iconURL: iconURL, name: name, nameColor: _this.settings.NameColor, bodyHTML: bodyHTML });
                }).join(this.separator);
            };
            SSExpressionFormatter.ParseExpression = function (source, at3ModeAsDefault) {
                // source: /\d+/,       capture: 5n + [-4:undefined, -3:undefined, -2:iundefined, -1:iconNum  , 0: bodyText]
                // source: @@@,         capture: 5n + [-4:@@@,       -3:undefined, -2:undefined,  -1:undefined, 0: bodyText]
                // source: @@@/\d+/,    capture: 5n + [-4:@@@,       -3:undefined, -2:iconNum,    -1:undefined, 0: bodyText]
                // source: @name@,      capture: 5n + [-4:@name@,    -3:name,      -2:undefined,  -1:undefined, 0: bodyText]
                // source: @name@/\d+/, capture: 5n + [-4:@name@,    -3:name,      -2:iconNum,    -1:undefined, 0: bodyText]
                var defaultIconNumber = at3ModeAsDefault ? -1 : 0;
                var texts = source.split(/(?:(@@@|@([^<@]+)@)(?:\/(\d+)\/)?|\/(\d+)\/)/g);
                if (texts.length === 1) {
                    return [new ParsedExpression({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: source })];
                }
                var exps = [];
                for (var ti = 0, tiEnd = texts.length; ti < tiEnd; ti += 5) {
                    var text = texts[ti];
                    if (ti === 0) {
                        if (text !== "") {
                            exps.push(new ParsedExpression({ enableAt3Mode: at3ModeAsDefault, iconNumber: defaultIconNumber, text: texts[ti] }));
                        }
                        continue;
                    }
                    var changedName = null;
                    var enableAt3Mode = at3ModeAsDefault;
                    var iconNumber = void 0;
                    if (texts[ti - 4] === undefined) {
                        // /\d/
                        iconNumber = parseInt(texts[ti - 1]);
                    }
                    else if (texts[ti - 4] === "@@@") {
                        // @@@ or @@@/\d/
                        iconNumber = (texts[ti - 2] === undefined) ? -1 /* アイコンなし */ : parseInt(texts[ti - 2]);
                        enableAt3Mode = true;
                    }
                    else {
                        // @changedName@ or @changedName@/\d/
                        iconNumber = (texts[ti - 2] === undefined) ? 0 /* デフォルトアイコン番号 */ : parseInt(texts[ti - 2]);
                        changedName = texts[ti - 3];
                        enableAt3Mode = false;
                    }
                    exps.push(new ParsedExpression({
                        enableAt3Mode: enableAt3Mode, changedName: changedName, iconNumber: iconNumber, text: text
                    }));
                }
                return exps;
            };
            SSExpressionFormatter.reReplaceEscapedDecoTag = new RegExp(Utility.HTML.escape("<(F[1-7]|B|I|S)>([\\s\\S]*?)</\\1>"), "g");
            return SSExpressionFormatter;
        }());
        SS.SSExpressionFormatter = SSExpressionFormatter;
        var SSPreview;
        (function (SSPreview) {
            var SSEventPreviewBase = (function (_super) {
                __extends(SSEventPreviewBase, _super);
                function SSEventPreviewBase(args) {
                    _super.call(this, args.insertAfter);
                    this.textbox = args.textbox;
                    this.sss = args.sss;
                    this.formatter = args.formatter;
                    if (args.hasOwnProperty("template_container")) {
                        this.template_container = args.template_container;
                    }
                    else {
                        this.template_container = "<div name='Preview'>{html}</div>";
                    }
                    this.HundleUpdateEvent(this.textbox, "keyup");
                }
                SSEventPreviewBase.prototype.Update = function () {
                    var source = this.textbox.value;
                    if (source === "") {
                        return this.Hide();
                    }
                    var previewHTML = Utility.String.format(this.template_container, { html: this.formatter.Exec(source) });
                    this.OverwritePreview(previewHTML);
                    return this;
                };
                return SSEventPreviewBase;
            }(Preview.EventBasedPreview));
            var SerifPreview = (function (_super) {
                __extends(SerifPreview, _super);
                function SerifPreview(args) {
                    var formatter = new SSExpressionFormatter({ settings: args.sss, at3ModeAsDefault: false });
                    _super.call(this, { insertAfter: args.insertAfter, textbox: args.textbox, sss: args.sss, formatter: formatter });
                }
                return SerifPreview;
            }(SSEventPreviewBase));
            SSPreview.SerifPreview = SerifPreview;
            var MessagePreview = (function (_super) {
                __extends(MessagePreview, _super);
                function MessagePreview(args) {
                    var formatter = new SSExpressionFormatter({ settings: args.sss, at3ModeAsDefault: false });
                    _super.call(this, { insertAfter: args.insertAfter, textbox: args.textbox, sss: args.sss, formatter: formatter });
                }
                return MessagePreview;
            }(SSEventPreviewBase));
            SSPreview.MessagePreview = MessagePreview;
            var PartyBBSPreview = (function (_super) {
                __extends(PartyBBSPreview, _super);
                function PartyBBSPreview(args) {
                    var formatter = new SSExpressionFormatter({ settings: args.sss, at3ModeAsDefault: true });
                    _super.call(this, { insertAfter: args.insertAfter, textbox: args.textbox, sss: args.sss, formatter: formatter });
                    this.nameBox = args.nameBox;
                    this.titleBox = args.titleBox;
                    this.HundleUpdateEvent([
                        { elem: this.nameBox, eventType: "keyup" },
                        { elem: this.titleBox, eventType: "keyup" }
                    ]);
                }
                PartyBBSPreview.prototype.UpdateContainer = function () {
                    var title = this.titleBox.value || "無題";
                    var name = this.nameBox.value;
                    this.template_container = Utility.String.format(PartyBBSPreview.TEMPLATE, { title: title, name: name });
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
                    var formatter = new SSExpressionFormatter({ settings: args.sss, at3ModeAsDefault: true });
                    _super.call(this, { insertAfter: args.insertAfter, textbox: args.textbox, sss: args.sss, formatter: formatter, template_container: DiaryPreview.TEMPLATE });
                }
                DiaryPreview.TEMPLATE = "<div name='Preview'><div class='tablestyle3'>{html}</div></div>";
                return DiaryPreview;
            }(SSEventPreviewBase));
            SSPreview.DiaryPreview = DiaryPreview;
        })(SSPreview = SS.SSPreview || (SS.SSPreview = {}));
        var Pages;
        (function (Pages) {
            var Page = (function () {
                function Page(sss) {
                    this.sss = sss;
                }
                Object.defineProperty(Page.prototype, "Settings", {
                    get: function () {
                        return this.sss;
                    },
                    enumerable: true,
                    configurable: true
                });
                Page.prototype.InitAllTextboxesWithSerifPreview = function () {
                    var _this = this;
                    $("textarea").each(function (i, e) {
                        var preview = new SSPreview.SerifPreview({
                            insertAfter: e,
                            textbox: e,
                            sss: _this.sss
                        });
                    });
                };
                Page.prototype.InitAllTextboxesWithMessagePreview = function () {
                    var _this = this;
                    $("textarea").each(function (i, e) {
                        var imageURLBox = $(e).nextUntil("input").last().next()[0];
                        var preview = new SSPreview.MessagePreview({
                            insertAfter: imageURLBox,
                            textbox: e,
                            sss: _this.sss
                        });
                    });
                };
                return Page;
            }());
            var AllPages = (function (_super) {
                __extends(AllPages, _super);
                function AllPages(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                AllPages.prototype.Init = function () {
                    $("#char_Button").before("<center class='F1'>↓(SSPreviewer) アイコン・愛称の自動読込↓</center>");
                };
                return AllPages;
            }(Page));
            var Main = (function (_super) {
                __extends(Main, _super);
                function Main(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                Main.prototype.Init = function () {
                    var diaryBox = $("#Diary_TextBox")[0];
                    var diaryPreview = new SSPreview.DiaryPreview({
                        insertAfter: diaryBox,
                        textbox: diaryBox,
                        sss: this.sss
                    });
                    var serifWhenUsingItem = $("#TextBox12")[0];
                    var serifPreview_WhenUsingItem = new SSPreview.SerifPreview({
                        insertAfter: serifWhenUsingItem,
                        textbox: serifWhenUsingItem,
                        sss: this.sss
                    });
                };
                return Main;
            }(Page));
            var PartyBBS = (function (_super) {
                __extends(PartyBBS, _super);
                function PartyBBS(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                PartyBBS.prototype.Init = function () {
                    var $commentBox = $("#commentTxt");
                    var preview = new SSPreview.PartyBBSPreview({
                        insertAfter: $commentBox.closest("div.BackBoard")[0],
                        textbox: $commentBox[0],
                        sss: this.sss,
                        nameBox: $("#nameTxt")[0],
                        titleBox: $("#titleTxt")[0]
                    });
                };
                return PartyBBS;
            }(Page));
            var Trade = (function (_super) {
                __extends(Trade, _super);
                function Trade(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                Trade.prototype.Init = function () {
                    this.InitAllTextboxesWithSerifPreview();
                };
                return Trade;
            }(Page));
            var Reinforcement = (function (_super) {
                __extends(Reinforcement, _super);
                function Reinforcement(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                Reinforcement.prototype.Init = function () {
                    this.InitAllTextboxesWithSerifPreview();
                };
                return Reinforcement;
            }(Page));
            var BattleSettings = (function (_super) {
                __extends(BattleSettings, _super);
                function BattleSettings(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                BattleSettings.prototype.Init = function () {
                    this.InitAllTextboxesWithSerifPreview();
                };
                return BattleSettings;
            }(Page));
            var BattleWords = (function (_super) {
                __extends(BattleWords, _super);
                function BattleWords(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                BattleWords.prototype.Init = function () {
                    this.InitAllTextboxesWithSerifPreview();
                };
                return BattleWords;
            }(Page));
            var Message = (function (_super) {
                __extends(Message, _super);
                function Message(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                Message.prototype.Init = function () {
                    this.InitAllTextboxesWithMessagePreview();
                };
                return Message;
            }(Page));
            var GroupMessage = (function (_super) {
                __extends(GroupMessage, _super);
                function GroupMessage(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                GroupMessage.prototype.Init = function () {
                    this.InitAllTextboxesWithMessagePreview();
                };
                return GroupMessage;
            }(Page));
            var CharacterSettings = (function (_super) {
                __extends(CharacterSettings, _super);
                function CharacterSettings(sss) {
                    _super.call(this, sss);
                    this.Init();
                }
                CharacterSettings.prototype.Init = function () {
                    this.sss.SaveIconURLArray(CharacterSettings.ExtractIconUrlArray());
                    this.sss.SaveNickname(CharacterSettings.ExtractNickname());
                };
                CharacterSettings.ExtractIconUrlArray = function () {
                    var defaultIconURL = "/p/default.jpg";
                    var firstIconURL = $("#TextBox7").val() || defaultIconURL;
                    var a = [firstIconURL];
                    for (var i = 0;; i++) {
                        var $icon = $("#TextBox" + (i + 12));
                        if ($icon.length === 0) {
                            return a;
                        }
                        a.push($icon.val() || defaultIconURL);
                    }
                };
                CharacterSettings.ExtractNickname = function () {
                    return $("#TextBox2").val();
                };
                return CharacterSettings;
            }(Page));
            Pages.RunSuitableScriptForCurrentPage = function (sss) {
                var pages = {
                    "/d/mainaction.aspx": Main,
                    "/d/pbbs.aspx": PartyBBS,
                    "/d/tradeaction.aspx": Trade,
                    "/d/strgsaction.aspx": Reinforcement,
                    "/d/battle.aspx": BattleSettings,
                    "/d/battlemessage.aspx": BattleWords,
                    "/d/messageaction.aspx": Message,
                    "/d/commesaction.aspx": GroupMessage,
                    "/d/chara.aspx": CharacterSettings
                };
                new AllPages(sss);
                var path = document.location.pathname;
                if (pages.hasOwnProperty(path)) {
                    new pages[path](sss);
                }
            };
        })(Pages = SS.Pages || (SS.Pages = {}));
    })(SS || (SS = {}));
    SS.Pages.RunSuitableScriptForCurrentPage(new SS.SSSettings());
})(Program || (Program = {}));

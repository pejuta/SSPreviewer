// ==UserScript==
// @name        SSPreviewer (beta)
// @namespace   11powder
// @description 何かのプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.js
// @version     0.1.008
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
            HTML.replaceLineBreakToBRTag = function (html) {
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
    })(Preview = Program.Preview || (Program.Preview = {}));
    var SS;
    (function (SS) {
        var SSSettings = (function () {
            function SSSettings() {
                this.iconURLArray = SSSettings.LoadIconURLArray();
                this.nickname = SSSettings.LoadNickname();
                this.pno = SSSettings.ReadPNoByCookie();
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
            SSSettings.prototype.SplitMultiIconTagExpression = function (source) {
                // capture: [1:@@@ or @name@, 2:iconNum]
                var s = source.split(/(@@@|@[^@]*@)?\/(\d|[1-9]\d+)\//g);
                if (s.length === 1) {
                    return [source];
                }
                var expArray = [];
                for (var si = 0, iiEnd = s.length, ei = 0; si < iiEnd; si += 3) {
                    expArray[ei] = (ei in expArray) ? (expArray[ei] + s[si]) : s[si];
                    if (si === iiEnd - 1) {
                        return expArray;
                    }
                    var iconNum = parseInt(s[si + 2]);
                    var isFirstExpZeroLength = (si === 0 && s[si] === "");
                    if (this.IsValidIcon(iconNum) && !isFirstExpZeroLength) {
                        expArray[++ei] = "";
                    }
                    var nameSymbol = (s[si + 1] === undefined) ? "" : s[si + 1];
                    expArray[ei] += nameSymbol + "/" + iconNum + "/";
                }
                throw new Error("[表現分割エラー]");
            };
            SSSettings.prototype.ReplaceIconTagToHTML = function (source) {
                // capture: [1: iconNum]
                var htmlFrags = source.split(/\/(\d|[1-9]\d+)\//g);
                if (htmlFrags.length === 1) {
                    return source;
                }
                for (var ii = 1, iiEnd = htmlFrags.length; ii < iiEnd; ii += 2) {
                    var iconNum = parseInt(htmlFrags[ii]);
                    if (this.IsValidIcon(iconNum)) {
                        htmlFrags[ii] = "<br clear=\"all\"><img alt=\"Icon\" src=\"" + this.iconURLArray[iconNum] + "\" border=\"0\" align=\"left\" height=\"60\" width=\"60\">";
                    }
                    else {
                        htmlFrags[ii] = "/" + iconNum + "/";
                    }
                }
                return htmlFrags.join("");
            };
            SSSettings.prototype.IsValidIcon = function (iconNumber) {
                return iconNumber >= 0 && iconNumber < this.iconURLArray.length;
            };
            SSSettings.UserExpressionToHTML = function (source) {
                var html = Utility.HTML.escape(source);
                html = Utility.HTML.UnescapeBRTag(html);
                html = Utility.HTML.replaceLineBreakToBRTag(html);
                return Utility.String.replaceLoop(html, SSSettings.re_replaceEscapedDecoTag, "<span class='$1'>$2</span>");
            };
            SSSettings.prototype.ParseMessage = function (source) {
                return this.ParseBasicExpression(source);
            };
            // 基本的な構文はメッセージと台詞で同じ。or構文が追加予定とのことなので分けてる。
            SSSettings.prototype.ParseSerif = function (source) {
                return this.ParseBasicExpression(source);
            };
            SSSettings.prototype.ParseBasicExpression = function (source) {
                var a = SSSettings.re_baseExpression.exec(source);
                if (a === null) {
                    throw new Error("syntax error caused.\r\nsource: " + source);
                }
                var hidesBrackets = (a[1] === "@@@");
                var usesDefaultName = (a[1] === undefined && !hidesBrackets);
                var changedName = usesDefaultName ? null : a[2] || "";
                var text = a[4];
                var iconNumber = 0; // デフォルトアイコン番号
                if (a[3] !== undefined) {
                    var n = parseInt(a[3]);
                    if (this.IsValidIcon(n)) {
                        iconNumber = n;
                    }
                    else {
                        text = ("/" + n + "/") + text;
                    }
                }
                return {
                    HidesBrackets: hidesBrackets,
                    UsesDefaultName: usesDefaultName,
                    ChangedName: changedName,
                    IconNumber: iconNumber,
                    Text: text,
                    Source: source
                };
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
            SSSettings.re_replaceEscapedDecoTag = new RegExp(Utility.HTML.escape("<(F[1-7]|B|I|S)>([\\s\\S]*?)</\\1>"), "g");
            // Captures: ChangesName, ChangedName, IconNumber, Body
            SSSettings.re_baseExpression = /^(@@@|@([^@]*)@)?(?:\/(\d|[1-9]\d+)\/)?([\s\S]*?)$/;
            return SSSettings;
        }());
        SS.SSSettings = SSSettings;
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
        var SSPreview;
        (function (SSPreview) {
            var SSEventPreviewBase = (function (_super) {
                __extends(SSEventPreviewBase, _super);
                function SSEventPreviewBase(args) {
                    _super.call(this, args.insertAfter);
                    this.textbox = args.textbox;
                    this.sss = args.sss;
                    this.HundleUpdateEvent(this.textbox, "keyup");
                }
                return SSEventPreviewBase;
            }(Preview.EventBasedPreview));
            var SerifPreview = (function (_super) {
                __extends(SerifPreview, _super);
                function SerifPreview() {
                    _super.apply(this, arguments);
                }
                SerifPreview.prototype.FormatPreviewHTML = function (source) {
                    var _this = this;
                    var previewBodyHTML = this.sss.SplitMultiIconTagExpression(source)
                        .map(function (exp, i, a) {
                        return _this.sss.ParseSerif(exp);
                    })
                        .map(function (p, i, a) {
                        var template;
                        if (p.HidesBrackets) {
                            template = SerifPreview.TEMPLATE_ONEICON_NOBRACKETS;
                        }
                        else {
                            template = SerifPreview.TEMPLATE_ONEICON;
                        }
                        var iconURL = _this.sss.IconURLArray[p.IconNumber] || "";
                        var name = p.UsesDefaultName ? _this.sss.Nickname : p.ChangedName;
                        var html = SSSettings.UserExpressionToHTML(p.Text);
                        return Utility.String.format(template, { iconURL: iconURL, name: name, html: html });
                    })
                        .join("");
                    return Utility.String.format(SerifPreview.TEMPLATE_CONTAINER, { previewBodyHTML: previewBodyHTML });
                };
                SerifPreview.prototype.Update = function () {
                    var source = this.textbox.value;
                    if (source === "") {
                        return this.Hide();
                    }
                    var previewHTML = this.FormatPreviewHTML(source);
                    this.OverwritePreview(previewHTML);
                    return this;
                };
                // constructor(insertAfter: HTMLElement, args: { textbox: HTMLTextAreaElement | HTMLInputElement, defaultName: string, iconURLArray: string[] }){
                //     super(insertAfter, args);
                // }
                SerifPreview.TEMPLATE_CONTAINER = "<div name='Preview'>{previewBodyHTML}</div>";
                SerifPreview.TEMPLATE_ONEICON = "<div name='Words' class='Words'><img alt='Icon' src='{iconURL}' border='0' align='left' height='60' width='60'>" +
                    "<font class='BB'>{name}<br></font><font color='white'>「{html}」</font></div><br clear='ALL'>";
                SerifPreview.TEMPLATE_ONEICON_NOBRACKETS = "<div name='Words' class='Words'><img alt='Icon' src='{iconURL}' border='0' align='left' height='60' width='60'>" +
                    "<font color='white'>{html}</font></div><br clear='ALL'>";
                return SerifPreview;
            }(SSEventPreviewBase));
            SSPreview.SerifPreview = SerifPreview;
            var MessagePreview = (function (_super) {
                __extends(MessagePreview, _super);
                function MessagePreview() {
                    _super.apply(this, arguments);
                }
                MessagePreview.prototype.FormatPreviewHTML = function (source) {
                    var _this = this;
                    var previewBodyHTML = this.sss.SplitMultiIconTagExpression(source)
                        .map(function (exp, i, a) {
                        return _this.sss.ParseMessage(exp);
                    }, this)
                        .map(function (p, i, a) {
                        var template;
                        if (p.HidesBrackets) {
                            template = MessagePreview.TEMPLATE_ONEICON_NOBRACKETS;
                        }
                        else {
                            template = MessagePreview.TEMPLATE_ONEICON;
                        }
                        var iconURL = _this.sss.IconURLArray[p.IconNumber] || "";
                        var name = p.UsesDefaultName ? _this.sss.Nickname : p.ChangedName;
                        var html = SSSettings.UserExpressionToHTML(p.Text);
                        return Utility.String.format(template, { iconURL: iconURL, name: name, html: html });
                    }, this)
                        .join("");
                    return Utility.String.format(MessagePreview.TEMPLATE_CONTAINER, { previewBodyHTML: previewBodyHTML });
                };
                MessagePreview.prototype.Update = function () {
                    var source = this.textbox.value;
                    if (source === "") {
                        return this.Hide();
                    }
                    var previewHTML = this.FormatPreviewHTML(source);
                    this.OverwritePreview(previewHTML);
                    return this;
                };
                // constructor(insertAfter: HTMLElement, args: { textbox: HTMLTextAreaElement | HTMLInputElement, defaultName: string, iconURLArray: string[] }){
                //     super(insertAfter, args);
                // }
                MessagePreview.TEMPLATE_CONTAINER = "<div name='Preview'>{previewBodyHTML}</div>";
                MessagePreview.TEMPLATE_ONEICON = "<div name='Words' class='Words'><img alt='Icon' src='{iconURL}' border='0' align='left' height='60' width='60'>" +
                    "<font class='BB'>{name}<br></font><font color='white'>「{html}」</font></div><br clear='ALL'>";
                MessagePreview.TEMPLATE_ONEICON_NOBRACKETS = "<div name='Words' class='Words'><img alt='Icon' src='{iconURL}' border='0' align='left' height='60' width='60'>" +
                    "<font color='white'>{html}</font></div><br clear='ALL'>";
                return MessagePreview;
            }(SSEventPreviewBase));
            SSPreview.MessagePreview = MessagePreview;
            var PartyBBSPreview = (function (_super) {
                __extends(PartyBBSPreview, _super);
                function PartyBBSPreview(args) {
                    _super.call(this, args);
                    this.nameBox = args.nameBox;
                    this.titleBox = args.titleBox;
                    this.HundleUpdateEvent([
                        { elem: this.nameBox, eventType: "keyup" },
                        { elem: this.titleBox, eventType: "keyup" }]);
                }
                PartyBBSPreview.prototype.FormatPreviewHTML = function (template, source) {
                    var html = SSSettings.UserExpressionToHTML(source.text);
                    html = this.sss.ReplaceIconTagToHTML(html);
                    return Utility.String.format(template, { title: source.title, name: source.name, html: html });
                };
                PartyBBSPreview.prototype.Update = function () {
                    var title = this.titleBox.value || "無題";
                    var name = this.nameBox.value;
                    var text = this.textbox.value;
                    if (text === "" || name === "") {
                        return this.Hide();
                    }
                    var previewHTML = this.FormatPreviewHTML(PartyBBSPreview.TEMPLATE, { title: title, name: name, text: text });
                    this.OverwritePreview(previewHTML);
                    return this;
                };
                PartyBBSPreview.TEMPLATE = "<div name='Preview'><div class='BackBoard'><b>xxx ：{title}</b> &nbsp;&nbsp;{name}&#12288;（20xx/xx/xx xx:xx:xx） <br> <br>{html}<br><br><br clear='ALL'></div></div>";
                return PartyBBSPreview;
            }(SSEventPreviewBase));
            SSPreview.PartyBBSPreview = PartyBBSPreview;
            var DiaryPreview = (function (_super) {
                __extends(DiaryPreview, _super);
                function DiaryPreview() {
                    _super.apply(this, arguments);
                }
                DiaryPreview.prototype.FormatPreviewHTML = function (template, source) {
                    var html = SSSettings.UserExpressionToHTML(source);
                    html = this.sss.ReplaceIconTagToHTML(html);
                    return Utility.String.format(template, { html: html });
                };
                DiaryPreview.prototype.Update = function () {
                    var source = this.textbox.value;
                    if (source === "") {
                        return this.Hide();
                    }
                    var previewHTML = this.FormatPreviewHTML(DiaryPreview.TEMPLATE, source);
                    this.OverwritePreview(previewHTML);
                    return this;
                };
                DiaryPreview.TEMPLATE = "<div name='Preview'><div class='tablestyle3'>{html}</div></div>";
                return DiaryPreview;
            }(SSEventPreviewBase));
            SSPreview.DiaryPreview = DiaryPreview;
        })(SSPreview = SS.SSPreview || (SS.SSPreview = {}));
    })(SS || (SS = {}));
    SS.Pages.RunSuitableScriptForCurrentPage(new SS.SSSettings());
})(Program || (Program = {}));

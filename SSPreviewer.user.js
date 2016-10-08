// ==UserScript==
// @name        SSPreviewer (beta)
// @namespace   11powder
// @description 何かのプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.js
// @version     0.1.003
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
        var jQuery = (function () {
            function jQuery() {
            }
            //replaceWithとは異なり、戻り値は置換先オブジェクト
            jQuery.replaceTo = function (from, to) {
                var $to = $(to);
                $(from).replaceWith($to);
                return $to;
            };
            return jQuery;
        }());
        Utility.jQuery = jQuery;
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
                //searchValue: RegExp
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
            EventBasedPreview.prototype.OverwritePreview = function (newHtml) {
                if (this.preview) {
                    this.preview = Utility.jQuery.replaceTo(this.preview, newHtml)[0];
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
        var SSStatic = (function () {
            function SSStatic() {
            }
            SSStatic.ReadPNoByCookie = function () {
                var pno = $.cookie("pno");
                if (pno === null) {
                    return -1;
                }
                return parseInt(pno);
            };
            SSStatic.FinalizeUserDescriptionAsHTML = function (source) {
                var html = Utility.HTML.escape(source);
                html = Utility.HTML.replaceLineBreakToBRTag(html);
                return Utility.String.replaceLoop(html, SSStatic.re_replaceEscapedDecoTag, "<span class='$1'>$2</span>");
            };
            SSStatic.ParseMessage = function (source) {
                var a = SSStatic.re_message.exec(source);
                if (a === null) {
                    throw new Error("メッセージのパースに失敗しました。\r\nsource: " + source);
                }
                var hidesBrackets = (a[1] === "@@@");
                var usesDefaultName = (a[1] === undefined && !hidesBrackets);
                var changedName = null;
                if (!usesDefaultName) {
                    if (a[2] === undefined /* @{4,} */) {
                        changedName = a[1].substring(2);
                    }
                    else {
                        changedName = a[2] || "";
                    }
                }
                var iconNumber = (a[3] === undefined ? 0 /*デフォルトアイコン番号*/ : parseInt(a[3]));
                var text = a[4] || "";
                // console.log(a);
                return {
                    HidesBrackets: hidesBrackets,
                    UsesDefaultName: usesDefaultName,
                    ChangedName: changedName,
                    IconNumber: iconNumber,
                    Text: text,
                    Source: source
                };
            };
            SSStatic.ParseSerif = function (source) {
                var a = SSStatic.re_serif.exec(source);
                if (a === null) {
                    throw new Error("セリフのパースに失敗しました。\r\nsource: " + source);
                }
                var hidesBrackets = (a[1] === "@@@");
                var usesDefaultName = (a[1] === undefined && !hidesBrackets);
                var changedName = null;
                if (!usesDefaultName) {
                    if (a[2] === undefined /* @{4,} */) {
                        changedName = a[1].substring(2);
                    }
                    else {
                        changedName = a[2] || "";
                    }
                }
                var iconNumber = (a[3] === undefined ? 0 /*デフォルトアイコン番号*/ : parseInt(a[3]));
                var text = a[4] || "";
                // console.log(a);
                return {
                    HidesBrackets: hidesBrackets,
                    UsesDefaultName: usesDefaultName,
                    ChangedName: changedName,
                    IconNumber: iconNumber,
                    Text: text,
                    Source: source
                };
            };
            SSStatic.ReplaceIconDescriptionToTag = function (source, iconURLArray) {
                var htmlFrag = source.split(SSStatic.re_iconSplit);
                if (htmlFrag.length > 1) {
                    for (var i = 1, iEnd = htmlFrag.length; i < iEnd; i += 2) {
                        var iconNum = parseInt(htmlFrag[i]);
                        if (iconNum < iconURLArray.length) {
                            htmlFrag[i] = "<br clear=\"all\"><img alt=\"Icon\" src=\"" + iconURLArray[iconNum] + "\" border=\"0\" align=\"left\" height=\"60\" width=\"60\">";
                        }
                        else {
                            htmlFrag[i] = "/" + iconNum + "/";
                        }
                    }
                }
                return htmlFrag.join("");
            };
            SSStatic.LoadIconURLArray = function () {
                var json = localStorage.getItem("SSPreviewer_ICON_URL_ARRAY");
                if (json === null) {
                    return [];
                }
                return JSON.parse(json);
            };
            SSStatic.SaveIconURLArray = function (iconURLArray) {
                localStorage.setItem("SSPreviewer_ICON_URL_ARRAY", JSON.stringify(iconURLArray));
            };
            SSStatic.LoadNickname = function () {
                var name = localStorage.getItem("SSPreviewer_NICKNAME");
                if (name === null) {
                    return "(名称)";
                }
                return name;
            };
            SSStatic.SaveNickname = function (nickname) {
                localStorage.setItem("SSPreviewer_NICKNAME", nickname);
            };
            SSStatic.re_replaceEscapedDecoTag = new RegExp(Utility.HTML.escape("<(F[1-7]|B|I|S)>([\\s\\S]*?)</\\1>"), "ig");
            //Captures: ChangesName, ChangedName, IconNumber, Body
            SSStatic.re_message = /^(@{4,}|@@@|@([^@]*)@)?(?:\/(\d+)\/)?([\s\S]*?)$/;
            //Captures: ChangesOrHidesName, ChangedName, IconNumber, Body
            SSStatic.re_serif = /^(@{4,}|@@@|@([^@]*)@)?(?:\/(\d+)\/)?([\s\S]*?)$/;
            //capture: [odd: HTML, even: iconNumber]
            SSStatic.re_iconSplit = /\/(\d+)\//g;
            return SSStatic;
        }());
        SS.SSStatic = SSStatic;
        var Pages;
        (function (Pages) {
            var Generic_InitSerifPreviews = function () {
                $("textarea").each(function (i, e) {
                    var p = new SSPreview.SerifPreview({
                        insertAfter: e,
                        textarea: e,
                        defaultName: SSStatic.LoadNickname(),
                        iconURLArray: SSStatic.LoadIconURLArray()
                    });
                });
            };
            var Generic_InitMessagePreviews = function () {
                $("textarea").each(function (i, e) {
                    var imageURLBox = $(e).nextUntil("input").last().next()[0];
                    var p = new SSPreview.MessagePreview({
                        insertAfter: imageURLBox,
                        textarea: e,
                        defaultName: SSStatic.LoadNickname(),
                        iconURLArray: SSStatic.LoadIconURLArray()
                    });
                });
            };
            var AllPages = (function () {
                function AllPages() {
                }
                AllPages.Init = function () {
                    $("#char_Button").before("<center class='F1'>↓(SSPreviewer) アイコン・愛称の自動読込↓</center>");
                };
                return AllPages;
            }());
            var Main = (function () {
                function Main() {
                }
                Main.Init = function () {
                    Main.InitPreviews();
                };
                Main.InitPreviews = function () {
                    var diaryBox = $("#Diary_TextBox")[0];
                    var p = new SSPreview.DiaryPreview({
                        insertAfter: diaryBox,
                        textarea: diaryBox,
                        defaultName: null,
                        iconURLArray: SSStatic.LoadIconURLArray()
                    });
                };
                return Main;
            }());
            var PartyBBS = (function () {
                function PartyBBS() {
                }
                PartyBBS.Init = function () {
                    PartyBBS.InitPreviews();
                };
                PartyBBS.InitPreviews = function () {
                    var $commentBox = $("#commentTxt");
                    var p = new SSPreview.PartyBBSPreview({
                        insertAfter: $commentBox.closest("div.BackBoard")[0],
                        textarea: $commentBox[0],
                        defaultName: null,
                        iconURLArray: SSStatic.LoadIconURLArray(),
                        nameBox: $("#nameTxt")[0],
                        titleBox: $("#titleTxt")[0]
                    });
                };
                return PartyBBS;
            }());
            var Trade = (function () {
                function Trade() {
                }
                Trade.Init = function () {
                    Trade.InitPreviews();
                };
                Trade.InitPreviews = function () {
                    Generic_InitSerifPreviews();
                };
                return Trade;
            }());
            var Reinforcement = (function () {
                function Reinforcement() {
                }
                Reinforcement.Init = function () {
                    Reinforcement.InitPreviews();
                };
                Reinforcement.InitPreviews = function () {
                    Generic_InitSerifPreviews();
                };
                return Reinforcement;
            }());
            var BattleSettings = (function () {
                function BattleSettings() {
                }
                BattleSettings.Init = function () {
                    BattleSettings.InitPreviews();
                };
                BattleSettings.InitPreviews = function () {
                    Generic_InitSerifPreviews();
                };
                return BattleSettings;
            }());
            var BattleWords = (function () {
                function BattleWords() {
                }
                BattleWords.Init = function () {
                    BattleWords.InitPreviews();
                };
                BattleWords.InitPreviews = function () {
                    Generic_InitSerifPreviews();
                };
                return BattleWords;
            }());
            var Message = (function () {
                function Message() {
                }
                Message.Init = function () {
                    Message.InitPreviews();
                };
                Message.InitPreviews = function () {
                    Generic_InitMessagePreviews();
                };
                return Message;
            }());
            var GroupMessage = (function () {
                function GroupMessage() {
                }
                GroupMessage.Init = function () {
                    GroupMessage.InitPreviews();
                };
                GroupMessage.InitPreviews = function () {
                    Generic_InitMessagePreviews();
                };
                return GroupMessage;
            }());
            var CharacterSettings = (function () {
                function CharacterSettings() {
                }
                CharacterSettings.Init = function () {
                    SSStatic.SaveIconURLArray(CharacterSettings.ExtractIconUrlArray());
                    SSStatic.SaveNickname(CharacterSettings.ExtractNickname());
                };
                CharacterSettings.ExtractIconUrlArray = function () {
                    var defaultIconURL = "http://www.sssloxia.jp/p/default.jpg";
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
            }());
            var pageScripts = {
                "/d/mainaction.aspx": Main.Init,
                "/d/pbbs.aspx": PartyBBS.Init,
                "/d/tradeaction.aspx": Trade.Init,
                "/d/strgsaction.aspx": Reinforcement.Init,
                "/d/battle.aspx": BattleSettings.Init,
                "/d/battlemessage.aspx": BattleWords.Init,
                "/d/messageaction.aspx": Message.Init,
                "/d/commesaction.aspx": GroupMessage.Init,
                "/d/chara.aspx": CharacterSettings.Init
            };
            Pages.RunSuitableScriptForCurrentPage = function () {
                AllPages.Init();
                var path = document.location.pathname;
                if (pageScripts.hasOwnProperty(path)) {
                    pageScripts[path]();
                }
            };
        })(Pages = SS.Pages || (SS.Pages = {}));
        //アイコン取得について: 少なくともログイン経験があればPNo.はCookieから取得できる。その状態で結果を開いた時にアイコンURL配列を取得する？
        //プレビューのインスタンス生成時にコンストラクタが要求すべき
        //
        //デフォルト愛称の取得も同様
        var SSPreview;
        (function (SSPreview) {
            //対象エレメントで入力を受け付ける→テンプレートを用意する→項目を置換する→HTMLが用意できる→置換する
            //コンストラクタ: 対象エレメント、プレビューの挿入先直前エレメント、
            var SSEventPreviewBase = (function (_super) {
                __extends(SSEventPreviewBase, _super);
                function SSEventPreviewBase(args) {
                    _super.call(this, args.insertAfter);
                    this.textarea = args.textarea;
                    this.defaultName = args.defaultName;
                    this.iconURLArray = args.iconURLArray;
                    this.HundleUpdateEvent(this.textarea, "keyup");
                }
                return SSEventPreviewBase;
            }(Preview.EventBasedPreview));
            var SerifPreview = (function (_super) {
                __extends(SerifPreview, _super);
                function SerifPreview() {
                    _super.apply(this, arguments);
                }
                SerifPreview.HideBrackets = function (template) {
                    return template.replace("{name}「{serifHTML}」", "{serifHTML}");
                };
                SerifPreview.prototype.FormatPreviewHTML = function (template, source) {
                    var p = SSStatic.ParseSerif(source);
                    if (p.HidesBrackets) {
                        template = SerifPreview.HideBrackets(template);
                    }
                    var iconURL = this.iconURLArray[p.IconNumber] || "";
                    var name = p.UsesDefaultName ? this.defaultName : p.ChangedName;
                    var serifHTML = SSStatic.FinalizeUserDescriptionAsHTML(p.Text);
                    return Utility.String.format(template, { iconURL: iconURL, name: name, serifHTML: serifHTML });
                };
                SerifPreview.prototype.Update = function () {
                    var source = this.textarea.value;
                    if (source === "") {
                        return this.Hide();
                    }
                    var previewHTML = this.FormatPreviewHTML(SerifPreview.TEMPLATE, source);
                    this.OverwritePreview(previewHTML);
                    return this;
                };
                // constructor(insertAfter: HTMLElement, args: { textarea: HTMLTextAreaElement, defaultName: string, iconURLArray: string[] }){
                //     super(insertAfter, args);
                // }
                SerifPreview.TEMPLATE = "<div name='Preview'><div name='Words' class='Words'>" +
                    "<img alt='Icon' src='{iconURL}' border='0' align='left' height='60' width='60'>" +
                    "<font color='white'>{name}「{serifHTML}」</font></div><br clear='ALL'></div>";
                return SerifPreview;
            }(SSEventPreviewBase));
            SSPreview.SerifPreview = SerifPreview;
            var MessagePreview = (function (_super) {
                __extends(MessagePreview, _super);
                function MessagePreview() {
                    _super.apply(this, arguments);
                }
                MessagePreview.HideBrackets = function (template) {
                    return template.replace("<font class='BB'>{name}<br></font><font color='white'>「{messageHTML}」</font>", "<font color='white'>{messageHTML}</font>");
                };
                MessagePreview.prototype.FormatPreviewHTML = function (template, source) {
                    var p = SSStatic.ParseMessage(source);
                    if (p.HidesBrackets) {
                        template = MessagePreview.HideBrackets(template);
                    }
                    var iconURL = this.iconURLArray[p.IconNumber] || "";
                    var name = p.UsesDefaultName ? this.defaultName : p.ChangedName;
                    var messageHTML = SSStatic.FinalizeUserDescriptionAsHTML(p.Text);
                    return Utility.String.format(template, { iconURL: iconURL, name: name, messageHTML: messageHTML });
                };
                MessagePreview.prototype.Update = function () {
                    var source = this.textarea.value;
                    if (source === "") {
                        return this.Hide();
                    }
                    var previewHTML = this.FormatPreviewHTML(MessagePreview.TEMPLATE, source);
                    this.OverwritePreview(previewHTML);
                    return this;
                };
                // constructor(insertAfter: HTMLElement, args: { textarea: HTMLTextAreaElement, defaultName: string, iconURLArray: string[] }){
                //     super(insertAfter, args);
                // }
                MessagePreview.TEMPLATE = "<div name='Preview'><div name='Words' class='Words'><img alt='Icon' src='{iconURL}' border='0' align='left' height='60' width='60'>" +
                    "<font class='BB'>{name}<br></font><font color='white'>「{messageHTML}」</font></div><br clear='ALL'></div>";
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
                    var html = SSStatic.FinalizeUserDescriptionAsHTML(source.text);
                    html = SSStatic.ReplaceIconDescriptionToTag(html, this.iconURLArray);
                    return Utility.String.format(template, { title: source.title, name: source.name, html: html });
                };
                PartyBBSPreview.prototype.Update = function () {
                    var title = this.titleBox.value || "無題";
                    var name = this.nameBox.value;
                    var text = this.textarea.value;
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
                    var html = SSStatic.FinalizeUserDescriptionAsHTML(source);
                    html = SSStatic.ReplaceIconDescriptionToTag(html, this.iconURLArray);
                    return Utility.String.format(template, { html: html });
                };
                DiaryPreview.prototype.Update = function () {
                    var source = this.textarea.value;
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
    SS.Pages.RunSuitableScriptForCurrentPage();
    console.log(document.location.pathname, SS.SSStatic.LoadNickname(), SS.SSStatic.LoadIconURLArray());
})(Program || (Program = {}));

// ==UserScript==
// @name        SSPreviewer (beta)
// @namespace   11powder
// @description 七海で色々なプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @version     0.1.016
// @grant       none
// ==/UserScript==
//
// !!!:第二回更新時に向けてのチェックリスト。現在は暫定的な仕様のため実際の動作と異なる可能性がある
// 日記/メッセージ/台詞の正確なフォーマット
// 改行の変更後の仕様を要確認。
var __extends=(this&&this.__extends)||function(f,a){for(var e in a){if(a.hasOwnProperty(e)){f[e]=a[e];}}function c(){this.constructor=f;}f.prototype=a===null?Object.create(a):(c.prototype=a.prototype,new c());
};define("lib/util/jquery",["require","exports"],function(b,a){function d(g,f){var e=$(f);$(g).replaceWith(e);return e;}a.replaceTo=d;var c=(function(){function e(f,h){var g=this;
this.name=f;this.callback=h;this._wrappedCallback=function(k){var i=[];for(var j=1;j<arguments.length;j++){i[j-1]=arguments[j];}if(g.callback){g.callback(k,i);
}$(g).triggerHandler(g.name);};}Object.defineProperty(e.prototype,"Name",{get:function(){return this.name;},enumerable:true,configurable:true});e.prototype.RegisterEvent=function(f,i){if(f instanceof jQuery){this.evts=[{target:f,eventType:i}];
}else{this.evts=f;}for(var j=0,h=this.evts;j<h.length;j++){var g=h[j];$(g.target).on(g.eventType,this._wrappedCallback);}return this;};e.prototype.UnregisterEvent=function(t,f){var r=this.evts;
if(t===undefined){for(var h=0,m=r;h<m.length;h++){var s=m[h];$(s.target).off(s.eventType,this._wrappedCallback);}this.evts=[];return this;}var j;if(t instanceof jQuery){j=[{target:t,eventType:f}];
}else{j=t;}var i=[];var g=[];for(var p=r.length-1;p>=0;p--){for(var q=j.length-1;q>=0;q--){var l=r[p];var k=j[q];if(k.target.is(l.target)){g.push(l);break;
}if(q===0){i.push(l);}}}for(var o=0,n=g;o<n.length;o++){var s=n[o];$(s.target).off(s.eventType,this._wrappedCallback);}this.evts=i;return this;};e.prototype.Dispose=function(){this.UnregisterEvent();
};return e;}());a.CustomEvent=c;});define("lib/util/timer",["require","exports"],function(b,a){var c=(function(){function e(){this.date_start=0;this.time_ms=0;
this.resetTimeWhenStarting=false;}Object.defineProperty(e.prototype,"Time_ms",{get:function(){return this.time_ms+Date.now()-this.date_start;},enumerable:true,configurable:true});
Object.defineProperty(e.prototype,"isRunning",{get:function(){return !!this.date_start;},enumerable:true,configurable:true});e.prototype.Start=function(){if(this.isRunning&&!this.resetTimeWhenStarting){return;
}if(this.resetTimeWhenStarting){this.ResetTime();}this.date_start=Date.now();return this;};e.prototype.Stop=function(){return this.Pause().ResetTime();
};e.prototype.Pause=function(){if(!this.isRunning){return;}this.time_ms+=Date.now()-this.date_start;this.date_start=0;return this;};e.prototype.ResetTime=function(){if(this.isRunning){this.date_start=Date.now();
}else{this.date_start=0;}this.time_ms=0;return this;};e.prototype.PrintTime=function(){console.log("time(ms): "+this.Time_ms);return this;};return e;}());
a.Timer=c;var d=(function(e){__extends(f,e);function f(g,h){e.call(this);this.afterPeriod=g;this.period_ms=h;this.id=0;}f.prototype.setCallbackArg=function(g){if(g===undefined){return;
}this.callbackArg=g;};f.prototype.Start=function(h){this.setCallbackArg(h);if(!this.isRunning){var g=this.period_ms-this.time_ms;if(g<0){g=0;}this.id=setTimeout(this.afterPeriod,g,h);
}e.prototype.Start.call(this);return this;};f.prototype.Stop=function(g,h){if(g===void 0){g=false;}if(g){this.setCallbackArg(h);this.afterPeriod((h===undefined?this.callbackArg:h));
}return this.Pause().ResetTime();};f.prototype.Pause=function(){if(!this.isRunning){return;}clearTimeout(this.id);this.id=0;e.prototype.Pause.call(this);
return this;};f.prototype.ResetTime=function(g){this.setCallbackArg(g);if(this.isRunning){clearTimeout(this.id);this.id=setTimeout(this.afterPeriod,this.period_ms,(g===undefined?this.callbackArg:g));
}e.prototype.ResetTime.call(this);return this;};return f;}(c));a.TimerEvent=d;});define("lib/eventBasedPreview",["require","exports","lib/util/jquery","lib/util/timer"],function(c,b,a,d){(function(g){g[g.InsertAfter=0]="InsertAfter";
g[g.InsertBefore=1]="InsertBefore";g[g.AppendTo=2]="AppendTo";g[g.PrependTo=3]="PrependTo";})(b.InsertionMode||(b.InsertionMode={}));var f=b.InsertionMode;
var e=(function(){function g(h){var i=this;this.isDisabled=false;this._eventCallback=function(j){var k=[];for(var l=1;l<arguments.length;l++){k[l-1]=arguments[l];
}if(i.isDisabled){return false;}i.timerEvt.Start();return true;};this.onUpdate=new a.CustomEvent("updatePreview",this._eventCallback);this.insTarget=h.insTarget;
this.insMode=h.insMode;this._delay_ms=h.delay_ms||g._DEFAULT_DELAY_MS;this.timerEvt=new d.TimerEvent(function(){i.Update();},this._delay_ms);this.timerEvt.resetTimeWhenStarting=true;
}Object.defineProperty(g.prototype,"Delay_ms",{get:function(){return this._delay_ms;},set:function(h){this._delay_ms=h;},enumerable:true,configurable:true});
Object.defineProperty(g.prototype,"IsDisabled",{get:function(){return this.isDisabled;},enumerable:true,configurable:true});g.prototype.Pause=function(){this.isDisabled=true;
return this;};g.prototype.Disable=function(){this.isDisabled=true;return this.Hide();};g.prototype.Enable=function(){this.isDisabled=false;return this.Update();
};Object.defineProperty(g.prototype,"OnUpdate",{get:function(){return this.onUpdate;},enumerable:true,configurable:true});Object.defineProperty(g.prototype,"PreviewElement",{get:function(){return this.preview;
},enumerable:true,configurable:true});g.prototype.InsertPreview=function(h){var i=$(h);this.preview=i[0];switch(this.insMode){case f.InsertAfter:i.insertAfter(this.insTarget);
break;case f.InsertBefore:i.insertBefore(this.insTarget);break;case f.AppendTo:i.appendTo(this.insTarget);break;case f.PrependTo:i.prependTo(this.insTarget);
break;default:throw new Error("InsertionMode指定エラー");}return this;};g.prototype.OverwritePreview=function(h){if(this.preview){this.preview=a.replaceTo(this.preview,h)[0];
}else{this.InsertPreview(h);}return this;};g.prototype.Show=function(){return this.Update();};g.prototype.Hide=function(){$(this.preview).hide();return this;
};g.prototype.Dispose=function(){this.onUpdate.Dispose();this.Disable().Hide();};g._DEFAULT_DELAY_MS=0;return g;}());b.EvtBasedPreview=e;});define("lib/util/string",["require","exports"],function(b,a){function c(g,e,h){if(g===null||g===undefined){return g;
}var f=""+g;if(typeof e==="string"){for(;;){if(f.indexOf(e)===-1){return f;}f=f.replace(e,h);}}for(;;){if(!e.test(f)){return f;}f=f.replace(e,h);}}a.replaceLoop=c;
function d(h,f){if(h===null||h===undefined){return h;}var g=""+h;for(var e in f){if(f[e]===undefined&&f[e]===null){continue;}g=g.replace(new RegExp("{"+e+"}","g"),""+f[e]);
}return g;}a.format=d;});define("lib/util/html",["require","exports"],function(c,b){var e={"&":"&amp;","'":"&#x27;","`":"&#x60;",'"':"&quot;","<":"&lt;",">":"&gt;"};
var a=new RegExp("["+Object.keys(e).join("")+"]","g");function f(i){if(i===null||i===undefined){return i;}return(""+i).replace(a,function(j){return e[j];
});}b.escape=f;function d(i){return i.replace(/(?:\r\n|\r|\n)/g,"<BR>");}b.replaceLineBreaksToBRTag=d;var h=new RegExp(f("<BR>"),"g");function g(i){return i.replace(h,"<BR>");
}b.UnescapeBRTag=g;});define("lib/ss/config",["require","exports","lib/util/string","lib/util/html"],function(d,b,c,f){var e=(function(){function i(j){if(j){this.iconURLArray=j.iconURLArray;
this.nickname=j.nickname;this.nameColor=j.nameColor;}else{this.iconURLArray=i.LoadIconURLArray();this.nickname=i.LoadNickname();this.nameColor=i.LoadNameColor();
}}Object.defineProperty(i.prototype,"IconURLArray",{get:function(){return this.iconURLArray;},enumerable:true,configurable:true});Object.defineProperty(i.prototype,"Nickname",{get:function(){return this.nickname;
},enumerable:true,configurable:true});Object.defineProperty(i.prototype,"NameColor",{get:function(){return this.nameColor;},enumerable:true,configurable:true});
i.prototype.setIconURLArray=function(j){this.iconURLArray=j;return this;};i.prototype.setNickname=function(j){this.nickname=j;return this;};i.prototype.setNameColor=function(j){this.nameColor=j;
return this;};i.prototype.SaveIconURLArray=function(j){if(j!==undefined){this.iconURLArray=j;}i.SaveIconURLArray(this.iconURLArray);return this;};i.prototype.SaveNickname=function(j){if(j!==undefined){this.nickname=j;
}i.SaveNickname(this.nickname);return this;};i.prototype.SaveNameColor=function(j){if(j!==undefined){this.nameColor=j;}i.SaveNameColor(this.nickname);return this;
};i.LoadIconURLArray=function(){var j=localStorage.getItem("SSPreview_IconURLArray");if(j===null){return[];}return JSON.parse(j);};i.SaveIconURLArray=function(j){localStorage.setItem("SSPreview_IconURLArray",JSON.stringify(j));
};i.LoadNickname=function(){var j=localStorage.getItem("SSPreview_Nickname");if(j===null){return"(名称)";}return j;};i.SaveNickname=function(j){localStorage.setItem("SSPreview_Nickname",j);
};i.LoadNameColor=function(){var j=localStorage.getItem("SSPreview_NameColor");if(j===null){return"";}return j;};i.SaveNameColor=function(j){localStorage.setItem("SSPreview_NameColor",j);
};return i;}());b.SSProfile=e;var a=(function(){function i(j){this.enableAt3Mode=j.enableAt3Mode;this.iconNumber=j.iconNumber;this.text=j.text;this.changedName=j.hasOwnProperty("changedName")?j.changedName:null;
}Object.defineProperty(i.prototype,"EnableAt3Mode",{get:function(){return this.enableAt3Mode;},enumerable:true,configurable:true});Object.defineProperty(i.prototype,"Text",{get:function(){return this.text;
},enumerable:true,configurable:true});Object.defineProperty(i.prototype,"IconNumber",{get:function(){return this.iconNumber;},enumerable:true,configurable:true});
Object.defineProperty(i.prototype,"ChangedName",{get:function(){return this.changedName;},enumerable:true,configurable:true});return i;}());var h=(function(){function i(j){this.ssp=j.ssp;
this.template=j.template||i._DEFAULT_TEMPLATE;this.separator=j.separator||"";this.at3ModeAsDefault=j.at3ModeAsDefault||false;this.randomizesDiceTag=j.randomizesDiceTag||false;
}Object.defineProperty(i.prototype,"Templates",{get:function(){return this.template;},enumerable:true,configurable:true});Object.defineProperty(i.prototype,"Separator",{get:function(){return this.separator;
},enumerable:true,configurable:true});Object.defineProperty(i.prototype,"SSProfile",{get:function(){return this.ssp;},enumerable:true,configurable:true});
Object.defineProperty(i.prototype,"At3ModeAsDefault",{get:function(){return this.at3ModeAsDefault;},enumerable:true,configurable:true});i.GenerateDiceTag=function(j){if(j===void 0){j=false;
}var k=1;if(j){k=Math.floor(Math.random()*6)+1;}return c.format(i._DEFAULT_DICE_TEMPLATE,{imgDir:i._DEFAULT_IMG_DIR,resultNum:k});};i.prototype.Exec=function(k){var l=this;
var j=f.escape(k);j=c.replaceLoop(j,i.reReplace_EscapedDecoTag,"<span class='$1'>$2</span>");j=this.Format(g.ParseExpression(j,this.at3ModeAsDefault));
j=j.replace(i.reReplace_EscapedDiceTag,function(m){return i.GenerateDiceTag(l.randomizesDiceTag);});j=f.replaceLineBreaksToBRTag(j);j=f.UnescapeBRTag(j);
return j;};i.prototype.Format=function(j){var k=this;return j.map(function(r,o,m){var p;if(r.EnableAt3Mode){if(r.IconNumber===-1){p=k.template.Body_At3Mode;
}else{p=k.template.Body_At3ModeAndIcon;}}else{p=k.template.Body;}var q="";if(r.IconNumber!==-1){q=k.ssp.IconURLArray[r.IconNumber]||(i._DEFAULT_IMG_DIR+"default.jpg");
}var n=r.ChangedName===null?k.ssp.Nickname:r.ChangedName;var l=r.Text;return c.format(p,{iconURL:q,name:n,nameColor:k.ssp.NameColor,bodyHTML:l});}).join(this.separator);
};i._DEFAULT_TEMPLATE={Body:'<table class="WordsTable" CELLSPACING=0 CELLPADDING=0><tr><td class="Icon" rowspan="2"><IMG border = 0 alt=Icon align=left src="{iconURL}" width=60 height=60></td><td class="Name"><font color="{nameColor}" class="B">{name}</font></td></tr><tr><td class="Words">\u300C{bodyHTML}\u300D</td></tr></table>',Body_At3ModeAndIcon:'<table class="WordsTable" CELLSPACING=0 CELLPADDING=0><tr><td class="Icon"><IMG border = 0 alt=Icon align=left src="{iconURL}" width=60 height=60></td><td class="String">{bodyHTML}</td></tr></table>',Body_At3Mode:'<table class="WordsTable" CELLSPACING=0 CELLPADDING=0><tr><td class="Icon"></td><td class="String">{bodyHTML}</td></tr></table>'};
i._DEFAULT_DICE_TEMPLATE='<img alt="dice" src="{imgDir}d{resultNum}.png" border="0" height="20" width="20">';i._DEFAULT_IMG_DIR="http://www.sssloxia.jp/p/";
i.reReplace_EscapedDecoTag=new RegExp(f.escape("<(F[1-7]|B|I|S)>([\\s\\S]*?)</\\1>"),"g");i.reReplace_EscapedDiceTag=new RegExp(f.escape("<D>"),"g");return i;
}());b.ExpFormatter=h;var g=(function(){function i(){}i.ParseExpression=function(j,o){var n=o?-1:0;var m=j.split(/(?:(@@@|@((?![^<@]*\/\d+\/)[^<@]+)@)(?:\/(\d+)\/)?|\/(\d+)\/)/g);
if(m.length===1){return[new a({enableAt3Mode:o,iconNumber:n,text:j})];}var q=[];for(var k=0,u=m.length;k<u;k+=5){var t=m[k];if(k===0){if(t!==""){q.push(new a({enableAt3Mode:o,iconNumber:n,text:m[k]}));
}continue;}var p=null;var s=o;var r=void 0;if(m[k-4]===undefined){r=m[k-1];}else{if(m[k-4]==="@@@"){r=m[k-2];s=true;}else{r=m[k-2];p=m[k-3];s=false;}}var l=s?-1:0;
if(r!==undefined){l=parseInt(r);}q.push(new a({enableAt3Mode:s,changedName:p,iconNumber:l,text:t}));}return q;};i.CountExpChars=function(k){var l=k.length-k.replace(/\n/g,"").length;
var j=k.length-l;return{charCount:j,lfCount:l};};return i;}());b.ExpAnalyzer=g;});define("lib/ss/pageConfig",["require","exports"],function(b,a){var d=(function(){function e(){}Object.defineProperty(e,"pathnameToPage",{get:function(){return{"/d/mainaction.aspx":e.MainPage,"/d/pbbs.aspx":e.PartyBBS,"/d/tradeaction.aspx":e.Trade,"/d/strgsaction.aspx":e.Reinforcement,"/d/battle.aspx":e.BattleSettings,"/d/battlemessage.aspx":e.BattleWords,"/d/messageaction.aspx":e.Message,"/d/commesaction.aspx":e.GroupMessage,"/d/chara.aspx":e.CharacterSettings,"/d/com.aspx":e.Community,};
},enumerable:true,configurable:true});e.RunInitializer=function(h,f){if(this.Common){this.Common.Init(h);}var g=f.pathname;if(e.pathnameToPage.hasOwnProperty(g)&&e.pathnameToPage[g]){e.pathnameToPage[g].Init(h);
}};return e;}());a.PageConfig=d;var c=(function(){function e(g,f){this.ssp=g;this.initializer=f;}e.prototype.Init=function(f){this.initializer(f);};Object.defineProperty(e.prototype,"Settings",{get:function(){return this.ssp;
},enumerable:true,configurable:true});Object.defineProperty(e.prototype,"Initializer",{get:function(){return this.initializer;},enumerable:true,configurable:true});
return e;}());a.Page=c;});define("lib/ss/preview",["require","exports","lib/eventBasedPreview","lib/util/string","lib/ss/config"],function(b,d,c,f,a){d.randomizesDiceTagResult=false;
var h=(function(l){__extends(k,l);function k(m){l.call(this,{insTarget:m.insTarget,insMode:m.insMode,delay_ms:k.DELAY_MS});this.textbox=m.textbox;this.ssp=m.ssp;
this.formatter=m.formatter;if(m.hasOwnProperty("template_container")){this.template_container=m.template_container;}else{this.template_container="<div class='preview'>{html}</div>";
}this.OnUpdate.RegisterEvent($(this.textbox),"keyup");}k.prototype.Update=function(n){var o=this.textbox.value;if(o===""){return this.Hide();}var m=n?Object.create(n):{};
m.html=this.formatter.Exec(o);var p=f.format(this.template_container,m);this.OverwritePreview(p);return this;};k.DELAY_MS=0;return k;}(c.EvtBasedPreview));
d.SSEvtPreviewBase=h;var e=(function(k){__extends(l,k);function l(m){var n=new a.ExpFormatter({ssp:m.ssp,at3ModeAsDefault:false,template:l.TEMPLATE,randomizesDiceTag:d.randomizesDiceTagResult});
k.call(this,{insTarget:m.insTarget,insMode:m.insMode,textbox:m.textbox,ssp:m.ssp,formatter:n});}l.TEMPLATE=null;return l;}(h));d.SerifPreview=e;var g=(function(l){__extends(k,l);
function k(m){var n=new a.ExpFormatter({ssp:m.ssp,at3ModeAsDefault:false,template:k.TEMPLATE,randomizesDiceTag:d.randomizesDiceTagResult});l.call(this,{insTarget:m.insTarget,insMode:m.insMode,textbox:m.textbox,ssp:m.ssp,formatter:n});
}k.TEMPLATE=null;return k;}(h));d.MessagePreview=g;var j=(function(k){__extends(l,k);function l(m){var n=new a.ExpFormatter({ssp:m.ssp,at3ModeAsDefault:true,template:l.TEMPLATE,randomizesDiceTag:d.randomizesDiceTagResult});
k.call(this,{insTarget:m.insTarget,insMode:m.insMode,textbox:m.textbox,ssp:m.ssp,formatter:n});this.nameBox=m.nameBox;this.titleBox=m.titleBox;this.OnUpdate.RegisterEvent([{target:$(this.nameBox),eventType:"keyup"},{target:$(this.titleBox),eventType:"keyup"}]);
}l.prototype.Update=function(){this.template_container=l.TEMPLATE_CONTAINER;var n=this.titleBox.value||"無題";var m=this.nameBox.value;k.prototype.Update.call(this,{title:n,name:m});
return this;};l.TEMPLATE=null;l.TEMPLATE_CONTAINER="<div class='preview'><div class='BackBoard'><b>xxx ：{title}</b> &nbsp;&nbsp;{name}&#12288;（20xx/xx/xx xx:xx:xx） <br> <br>{html}<br><br><br clear='ALL'></div></div>";
return l;}(h));d.PartyBBSPreview=j;var i=(function(k){__extends(l,k);function l(m){var n=new a.ExpFormatter({ssp:m.ssp,at3ModeAsDefault:true,template:l.TEMPLATE,randomizesDiceTag:d.randomizesDiceTagResult});
k.call(this,{insTarget:m.insTarget,insMode:m.insMode,textbox:m.textbox,ssp:m.ssp,formatter:n,template_container:l.TEMPLATE_CONTAINER});this.countsChars=m.countsChars||false;
}l.prototype.UpdateContainer=function(m){if(this.countsChars){this.template_container=l.SelectCharCountContainer(m);}else{this.template_container=l.TEMPLATE_CONTAINER;
}return this;};l.SelectCharCountContainer=function(o){var n;if(o.charCount>l.MAX_LENGTH_OF_CHARS){n="<span name='charCount' class='char_count char_count_over'>{charCount}</span>";
}else{n="<span name='charCount' class='char_count'>{charCount}</span>";}var m;if(o.lfCount>l.MAX_COUNT_OF_LF){m="<span name='lfCount' class='lf_count lf_count_over'>{lfCount}</span>";
}else{m="<span name='lfCount' class='lf_count'>{lfCount}</span>";}return f.format(l.TEMPLATE_CONTAINER_COUNTS_CHAR,{charCount:n,lfCount:m});};l.prototype.Update=function(){var m=a.ExpAnalyzer.CountExpChars(this.textbox.value);
this.UpdateContainer(m);k.prototype.Update.call(this,m);return this;};l.TEMPLATE=null;l.TEMPLATE_CONTAINER="<div class='preview'><div class='tablestyle3'>{html}</div></div>";
l.TEMPLATE_CONTAINER_COUNTS_CHAR="<div class='preview'><p class='char_count_line'><span class='char_count_cnt'>{charCount} / 5000</span> <span class='lf_count_cnt'>(改行: {lfCount} / 2500)</span></p><div class='tablestyle3'>{html}</div></div>";
l.MAX_LENGTH_OF_CHARS=5000;l.MAX_COUNT_OF_LF=2500;return l;}(h));d.DiaryPreview=i;});define("lib/ss/pages/CharacterSettings",["require","exports"],function(c,a){var b=(function(){function d(){}d.ExtractIconUrlArray=function(){var h="/p/default.jpg";
var j=document.getElementById("TextBox7");if(j===null){return[];}var e=[j.value||h];for(var f=0;;f++){var g=document.getElementById("TextBox"+(f+12));if(g===null){return e;
}e.push(g.value||h);}};d.ExtractNickname=function(){var e=document.getElementById("TextBox2");if(e===null){return null;}return e.value;};return d;}());
a.CharacterSettings=b;});define("lib/ss/pages",["require","exports","lib/ss/pages/CharacterSettings"],function(b,a,d){function c(e){for(var f in e){if(!a.hasOwnProperty(f)){a[f]=e[f];
}}}c(d);});define("SSPreviewer.user",["require","exports","lib/eventBasedPreview","lib/ss/config","lib/ss/preview","lib/ss/pageConfig","lib/ss/pages"],function(e,c,h,a,g,d,f){var b;
(function(i){function j(){g.SSEvtPreviewBase.DELAY_MS=100;var k=function(o){$("textarea").each(function(p,r){var q=new g.SerifPreview({insTarget:r,insMode:h.InsertionMode.InsertAfter,textbox:r,ssp:o});
});};var l=function(o){$("textarea").each(function(p,r){var s=$(r).nextUntil("input").last().next()[0];var q=new g.MessagePreview({insTarget:s,insMode:h.InsertionMode.InsertAfter,textbox:r,ssp:o});
});};var m=d.PageConfig;var n=new a.SSProfile();m.Common=new d.Page(n,function(o){$("#char_Button").before("<center class='F1'>↓(Previewer) アイコン・愛称の自動読込↓</center>");
});$("head").append("<style type='text/css'>\n        .char_count_line {\n            text-align: left;\n        }\n        .char_count_cnt {\n            font-size: 12px;\n        }\n        .lf_count_cnt {\n            font-size: 10px;\n        }\n        .char_count_line .char_count_over, .char_count_line .lf_count_over {\n            color: #CC3333;\n            font-weight: bold;\n        }\n        .char_count_line .char_count_over {\n            font-size: 16px;\n        }\n        .char_count_line .lf_count_over {\n            font-size: 14px;\n        }\n        </style>");
m.MainPage=new d.Page(n,function(s){var o=$("#Diary_TextBox")[0];var r=new g.DiaryPreview({insTarget:o,insMode:h.InsertionMode.InsertAfter,textbox:o,ssp:s,countsChars:true});
var p=$("#TextBox12")[0];var q=new g.SerifPreview({insTarget:p,insMode:h.InsertionMode.InsertAfter,textbox:p,ssp:s});});m.PartyBBS=new d.Page(n,function(q){var o=$("#commentTxt");
var p=new g.PartyBBSPreview({insTarget:o.closest("div.BackBoard")[0],insMode:h.InsertionMode.InsertAfter,textbox:o[0],ssp:q,nameBox:$("#nameTxt")[0],titleBox:$("#titleTxt")[0]});
});m.Trade=new d.Page(n,function(o){k(o);});m.Reinforcement=new d.Page(n,function(o){k(o);});m.BattleSettings=new d.Page(n,function(o){k(o);});m.BattleWords=new d.Page(n,function(o){k(o);
});m.Message=new d.Page(n,function(o){l(o);});m.GroupMessage=new d.Page(n,function(o){l(o);});m.CharacterSettings=new d.Page(n,function(o){o.SaveIconURLArray(f.CharacterSettings.ExtractIconUrlArray());
o.SaveNickname(f.CharacterSettings.ExtractNickname());});m.Community=new d.Page(n,function(q){var p=$("textarea")[0];var o=new g.DiaryPreview({insTarget:p,insMode:h.InsertionMode.InsertAfter,textbox:p,ssp:q});
});m.RunInitializer(n,document.location);}j();})(b||(b={}));});
    (function(){
        require(["SSPreviewer.user"], function(){ });
    })();
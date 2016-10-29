// ==UserScript==
// @name        SSPreviewer (beta)
// @namespace   11powder
// @description 七海で色々なプレビューを表示する
// @include     /^http://www\.sssloxia\.jp/d/.*?(?:\.aspx)(?:\?.+)?$/
// @require     https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @version     0.1.018
// @grant       none
// ==/UserScript==
//
// !!!:第二回更新時に向けてのチェックリスト。現在は暫定的な仕様のため実際の動作と異なる可能性がある
// 日記/メッセージ/台詞の正確なフォーマット
// 改行の変更後の仕様を要確認。
var __extends=(this&&this.__extends)||function(f,a){for(var e in a){if(a.hasOwnProperty(e)){f[e]=a[e];}}function c(){this.constructor=f;}f.prototype=a===null?Object.create(a):(c.prototype=a.prototype,new c());
};define("lib/ss/profile",["require","exports"],function(c,a){var b=(function(){function d(e){if(e){this.iconURLArray=e.iconURLArray;this.nickname=e.nickname;
this.nameColor=e.nameColor;}else{this.iconURLArray=d.LoadIconURLArray();this.nickname=d.LoadNickname();this.nameColor=d.LoadNameColor();}}d.prototype.SaveIconURLArray=function(e){if(e!==undefined){this.iconURLArray=e;
}d.SaveIconURLArray(this.iconURLArray);return this;};d.prototype.SaveNickname=function(e){if(e!==undefined){this.nickname=e;}d.SaveNickname(this.nickname);
return this;};d.prototype.SaveNameColor=function(e){if(e!==undefined){this.nameColor=e;}d.SaveNameColor(this.nickname);return this;};d.LoadIconURLArray=function(){var e=localStorage.getItem("SSPreview_IconURLArray");
if(e===null){return[];}return JSON.parse(e);};d.SaveIconURLArray=function(e){localStorage.setItem("SSPreview_IconURLArray",JSON.stringify(e));};d.LoadNickname=function(){var e=localStorage.getItem("SSPreview_Nickname");
if(e===null){return"(名称)";}return e;};d.SaveNickname=function(e){localStorage.setItem("SSPreview_Nickname",e);};d.LoadNameColor=function(){var e=localStorage.getItem("SSPreview_NameColor");
if(e===null){return"";}return e;};d.SaveNameColor=function(e){localStorage.setItem("SSPreview_NameColor",e);};return d;}());a.Profile=b;});define("lib/ss/page",["require","exports"],function(b,a){var c=(function(){function d(e,f){this.profile=e;
this.initializer=f;}d.prototype.Init=function(e){this.initializer(e);};Object.defineProperty(d.prototype,"Settings",{get:function(){return this.profile;
},enumerable:true,configurable:true});Object.defineProperty(d.prototype,"Initializer",{get:function(){return this.initializer;},enumerable:true,configurable:true});
return d;}());a.Page=c;});define("lib/ss/pageConfig",["require","exports"],function(b,a){var c=(function(){function d(){}Object.defineProperty(d,"pathnameToPage",{get:function(){return{"/d/mainaction.aspx":d.MainPage,"/d/pbbs.aspx":d.PartyBBS,"/d/tradeaction.aspx":d.Trade,"/d/strgsaction.aspx":d.Reinforcement,"/d/battle.aspx":d.BattleSettings,"/d/battlemessage.aspx":d.BattleWords,"/d/messageaction.aspx":d.Message,"/d/commesaction.aspx":d.GroupMessage,"/d/chara.aspx":d.CharacterSettings,"/d/com.aspx":d.Community,};
},enumerable:true,configurable:true});d.RunInitializer=function(f,e){if(this.Common){this.Common.Init(f);}var g=e.pathname;if(d.pathnameToPage.hasOwnProperty(g)&&d.pathnameToPage[g]){d.pathnameToPage[g].Init(f);
}};return d;}());a.PageConfig=c;});define("lib/util/jquery/customEvent",["require","exports"],function(c,b){var a=(function(){function d(e,g){var f=this;
this.name=e;this.callback=g;this._wrappedCallback=function(j){var h=[];for(var i=1;i<arguments.length;i++){h[i-1]=arguments[i];}if(f.callback){f.callback(j,h);
}$(f).triggerHandler(f.name);};}Object.defineProperty(d.prototype,"Name",{get:function(){return this.name;},enumerable:true,configurable:true});d.prototype.RegisterEvent=function(e,h){if(e instanceof jQuery){this.evts=[{target:e,eventType:h}];
}else{this.evts=e;}for(var i=0,g=this.evts;i<g.length;i++){var f=g[i];$(f.target).on(f.eventType,this._wrappedCallback);}return this;};d.prototype.UnregisterEvent=function(t,f){var r=this.evts;
if(t===undefined){for(var h=0,m=r;h<m.length;h++){var s=m[h];$(s.target).off(s.eventType,this._wrappedCallback);}this.evts=[];return this;}var j;if(t instanceof jQuery){j=[{target:t,eventType:f}];
}else{j=t;}var i=[];var g=[];for(var p=r.length-1;p>=0;p--){for(var q=j.length-1;q>=0;q--){var l=r[p];var k=j[q];if(k.target.is(l.target)){g.push(l);break;
}if(q===0){i.push(l);}}}for(var o=0,n=g;o<n.length;o++){var s=n[o];$(s.target).off(s.eventType,this._wrappedCallback);}this.evts=i;return this;};d.prototype.Dispose=function(){this.UnregisterEvent();
};return d;}());b.Event=a;});define("lib/util/jquery/replaceTo",["require","exports"],function(b,a){function c(f,e){var d=$(e);$(f).replaceWith(d);return d;
}a.replaceTo=c;});define("lib/util/timer/timer",["require","exports"],function(b,a){var c=(function(){function d(){this.date_start=0;this.time_ms=0;this.resetTimeWhenStarting=false;
}Object.defineProperty(d.prototype,"Time_ms",{get:function(){return this.time_ms+Date.now()-this.date_start;},enumerable:true,configurable:true});Object.defineProperty(d.prototype,"isRunning",{get:function(){return !!this.date_start;
},enumerable:true,configurable:true});d.prototype.Start=function(){if(this.isRunning&&!this.resetTimeWhenStarting){return;}if(this.resetTimeWhenStarting){this.ResetTime();
}this.date_start=Date.now();return this;};d.prototype.Stop=function(){return this.Pause().ResetTime();};d.prototype.Pause=function(){if(!this.isRunning){return;
}this.time_ms+=Date.now()-this.date_start;this.date_start=0;return this;};d.prototype.ResetTime=function(){if(this.isRunning){this.date_start=Date.now();
}else{this.date_start=0;}this.time_ms=0;return this;};d.prototype.PrintTime=function(){console.log("time(ms): "+this.Time_ms);return this;};return d;}());
a.Timer=c;});define("lib/util/timer/timerEvent",["require","exports","lib/util/timer/timer"],function(b,a,c){var d=(function(e){__extends(f,e);function f(g,h){e.call(this);
this.afterPeriod=g;this.period_ms=h;this.id=0;}f.prototype.setCallbackArg=function(g){if(g===undefined){return;}this.callbackArg=g;};f.prototype.Start=function(h){this.setCallbackArg(h);
if(!this.isRunning){var g=this.period_ms-this.time_ms;if(g<0){g=0;}this.id=setTimeout(this.afterPeriod,g,h);}e.prototype.Start.call(this);return this;};
f.prototype.Stop=function(g,h){if(g===void 0){g=false;}if(g){this.setCallbackArg(h);this.afterPeriod((h===undefined?this.callbackArg:h));}return this.Pause().ResetTime();
};f.prototype.Pause=function(){if(!this.isRunning){return;}clearTimeout(this.id);this.id=0;e.prototype.Pause.call(this);return this;};f.prototype.ResetTime=function(g){this.setCallbackArg(g);
if(this.isRunning){clearTimeout(this.id);this.id=setTimeout(this.afterPeriod,this.period_ms,(g===undefined?this.callbackArg:g));}e.prototype.ResetTime.call(this);
return this;};return f;}(c.Timer));a.TimerEvent=d;});define("lib/preview",["require","exports","lib/util/jquery/customEvent","lib/util/jquery/replaceTo","lib/util/timer/timerEvent"],function(c,b,g,a,f){(function(h){h[h.InsertAfter=0]="InsertAfter";
h[h.InsertBefore=1]="InsertBefore";h[h.AppendTo=2]="AppendTo";h[h.PrependTo=3]="PrependTo";})(b.InsertionMode||(b.InsertionMode={}));var e=b.InsertionMode;
var d=(function(){function h(i){var j=this;this.isDisabled=false;this._eventCallback=function(k){var l=[];for(var m=1;m<arguments.length;m++){l[m-1]=arguments[m];
}if(j.isDisabled){return false;}j.timerEvt.Start();return true;};this.onUpdate=new g.Event("updatePreview",this._eventCallback);this.insTarget=i.insTarget;
this.insMode=i.insMode;this._delay_ms=i.delay_ms||h._DEFAULT_DELAY_MS;this.timerEvt=new f.TimerEvent(function(){j.Update();},this._delay_ms);this.timerEvt.resetTimeWhenStarting=true;
}Object.defineProperty(h.prototype,"Delay_ms",{get:function(){return this._delay_ms;},set:function(i){this._delay_ms=i;},enumerable:true,configurable:true});
Object.defineProperty(h.prototype,"IsDisabled",{get:function(){return this.isDisabled;},enumerable:true,configurable:true});h.prototype.Pause=function(){this.isDisabled=true;
return this;};h.prototype.Disable=function(){this.isDisabled=true;return this.Hide();};h.prototype.Enable=function(){this.isDisabled=false;return this.Update();
};Object.defineProperty(h.prototype,"OnUpdate",{get:function(){return this.onUpdate;},enumerable:true,configurable:true});Object.defineProperty(h.prototype,"PreviewElement",{get:function(){return this.preview;
},enumerable:true,configurable:true});h.prototype.InsertPreview=function(i){var j=$(i);this.preview=j[0];switch(this.insMode){case e.InsertAfter:j.insertAfter(this.insTarget);
break;case e.InsertBefore:j.insertBefore(this.insTarget);break;case e.AppendTo:j.appendTo(this.insTarget);break;case e.PrependTo:j.prependTo(this.insTarget);
break;default:throw new Error("InsertionMode指定エラー");}return this;};h.prototype.OverwritePreview=function(i){if(this.preview){this.preview=a.replaceTo(this.preview,i)[0];
}else{this.InsertPreview(i);}return this;};h.prototype.Show=function(){return this.Update();};h.prototype.Hide=function(){$(this.preview).hide();return this;
};h.prototype.Dispose=function(){this.onUpdate.Dispose();this.Disable().Hide();};h._DEFAULT_DELAY_MS=0;return h;}());b.Preview=d;});define("lib/util/string/format",["require","exports"],function(b,a){function c(g,e){if(g===null||g===undefined){return g;
}var f=""+g;for(var d in e){if(e[d]===undefined&&e[d]===null){continue;}f=f.replace(new RegExp("{"+d+"}","g"),""+e[d]);}return f;}a.format=c;});define("lib/util/string/replaceLoop",["require","exports"],function(b,a){function c(f,d,g){if(f===null||f===undefined){return f;
}var e=""+f;if(typeof d==="string"){for(;;){if(e.indexOf(d)===-1){return e;}e=e.replace(d,g);}}for(;;){if(!d.test(e)){return e;}e=e.replace(d,g);}}a.replaceLoop=c;
});define("lib/util/html/escape",["require","exports"],function(b,e){var g={"&":"&amp;","'":"&#x27;","`":"&#x60;",'"':"&quot;","<":"&lt;",">":"&gt;"};var i=new RegExp("["+Object.keys(g).join("")+"]","g");
function l(k,n,m){if(k===undefined||k===null){return k;}if(n===undefined||n===null){return k.replace(i,function(o){return g[o];});}return k.replace(new RegExp(n,m),function(o){return l(o);
});}e.escape=l;var a={};for(var d=0,j=Object.keys(g);d<j.length;d++){var c=j[d];a[g[c]]=c;}var h=new RegExp("(?:"+Object.keys(a).join("|")+")","g");function f(k,n,m){if(k===undefined||k===null){return k;
}if(n===undefined||n===null){return k.replace(h,function(o){return a[o];});}return k.replace(new RegExp(l(n),m),function(o){return f(o);});}e.unescape=f;
});define("lib/util/html/tag",["require","exports"],function(b,a){function c(d){return d.replace(/(?:\r\n|\r|\n)/g,"<BR>");}a.lineBreaksToBR=c;});define("lib/ss/expr/parser",["require","exports"],function(b,a){var c=(function(h){__extends(g,h);
function g(){h.apply(this,arguments);}return g;}(Array));a.IGroupOr=c;var f=(function(g){__extends(h,g);function h(){g.apply(this,arguments);}return h;
}(Array));a.IGroupAnd=f;var d=(function(){function g(h){this.enableAt3Mode=h.enableAt3Mode;this.iconNumber=h.iconNumber;this.text=h.text;this.changedName=h.hasOwnProperty("changedName")?h.changedName:null;
}Object.defineProperty(g.prototype,"EnableAt3Mode",{get:function(){return this.enableAt3Mode;},enumerable:true,configurable:true});Object.defineProperty(g.prototype,"Text",{get:function(){return this.text;
},enumerable:true,configurable:true});Object.defineProperty(g.prototype,"IconNumber",{get:function(){return this.iconNumber;},enumerable:true,configurable:true});
Object.defineProperty(g.prototype,"ChangedName",{get:function(){return this.changedName;},enumerable:true,configurable:true});return g;}());var e=(function(){function g(){}g.Parse=function(i,m,w){var l=m?-1:0;
var x;if(w){x=i.split("###");}else{x=[i];}var n=[];for(var t=0,k=x.length;t<k;t++){var h=x[t].split(/(?:(@@@|@((?![^<@]*\/\d+\/)[^<@]+)@)(?:\/(\d+)\/)?|\/(\d+)\/)/g);
if(h.length===1){n.push([new d({enableAt3Mode:m,iconNumber:l,text:i})]);continue;}var s=[];for(var q=0,o=h.length;q<o;q+=5){var v=h[q];if(q===0){if(v!==""){s.push(new d({enableAt3Mode:m,iconNumber:l,text:h[q]}));
}continue;}var p=null;var u=m;var r=void 0;if(h[q-4]===undefined){r=h[q-1];}else{if(h[q-4]==="@@@"){r=h[q-2];u=true;}else{r=h[q-2];p=h[q-3];u=false;}}var j=u?-1:0;
if(r!==undefined){j=parseInt(r);}s.push(new d({enableAt3Mode:u,changedName:p,iconNumber:j,text:v}));}n.push(s);}return n;};return g;}());a.Parser=e;});
define("lib/ss/expr/formatter",["require","exports","lib/util/string/format","lib/util/string/replaceLoop","lib/util/html/escape","lib/util/html/tag","lib/ss/expr/parser"],function(c,b,g,f,h,a,e){var d=(function(){function i(j){this.profile=j.profile;
this.template=j.template||i._DEFAULT_TEMPLATE;this.separators=j.separators?{and:j.separators.and||i._DETAULT_SEPARATORS.and,or:j.separators.or||i._DETAULT_SEPARATORS.or}:Object.create(i._DETAULT_SEPARATORS);
this.at3ModeAsDefault=j.at3ModeAsDefault||false;this.randomizesDiceTag=j.randomizesDiceTag||false;this.allowsOrTag=j.allowsOrTag||false;}Object.defineProperty(i.prototype,"Templates",{get:function(){return this.template;
},enumerable:true,configurable:true});Object.defineProperty(i.prototype,"Separators",{get:function(){return this.separators;},enumerable:true,configurable:true});
Object.defineProperty(i.prototype,"Profile",{get:function(){return this.profile;},enumerable:true,configurable:true});Object.defineProperty(i.prototype,"At3ModeAsDefault",{get:function(){return this.at3ModeAsDefault;
},enumerable:true,configurable:true});Object.defineProperty(i.prototype,"AllowsOrTag",{get:function(){return this.allowsOrTag;},enumerable:true,configurable:true});
i.GenerateDiceTag=function(j){if(j===void 0){j=false;}var k=1;if(j){k=Math.floor(Math.random()*6)+1;}return g.format(i._DEFAULT_DICE_TEMPLATE,{imgDir:i._DEFAULT_IMG_DIR,resultNum:k});
};i.prototype.Exec=function(k){var l=this;var j=h.escape(k);j=f.replaceLoop(j,i.reReplace_EscapedDecoTag,"<span class='$1'>$2</span>");j=this.Format(e.Parser.Parse(j,this.at3ModeAsDefault,this.allowsOrTag));
j=j.replace(i.reReplace_EscapedDiceTag,function(m){return i.GenerateDiceTag(l.randomizesDiceTag);});j=a.lineBreaksToBR(j);j=h.unescape(j,"<BR>","g");return j;
};i.prototype.Format=function(j){var k=this;return j.map(function(n,m,l){return n.map(function(u,p,q){var s;if(u.EnableAt3Mode){if(u.IconNumber===-1){s=k.template.Body_At3Mode;
}else{s=k.template.Body_At3ModeAndIcon;}}else{s=k.template.Body;}var t="";if(u.IconNumber!==-1){t=k.profile.iconURLArray[u.IconNumber]||(i._DEFAULT_IMG_DIR+"default.jpg");
}var r=u.ChangedName===null?k.profile.nickname:u.ChangedName;var o=u.Text;return g.format(s,{iconURL:t,name:r,nameColor:k.profile.nameColor,bodyHTML:o});
}).join(k.separators.and);}).join(this.separators.or);};i._DEFAULT_TEMPLATE={Body:'<table class="WordsTable" CELLSPACING=0 CELLPADDING=0><tr><td class="Icon" rowspan="2"><IMG border = 0 alt=Icon align=left src="{iconURL}" width=60 height=60></td><td class="Name"><font color="{nameColor}" class="B">{name}</font></td></tr><tr><td class="Words">\u300C{bodyHTML}\u300D</td></tr></table>',Body_At3ModeAndIcon:'<table class="WordsTable" CELLSPACING=0 CELLPADDING=0><tr><td class="Icon"><IMG border = 0 alt=Icon align=left src="{iconURL}" width=60 height=60></td><td class="String">{bodyHTML}</td></tr></table>',Body_At3Mode:'<table class="WordsTable" CELLSPACING=0 CELLPADDING=0><tr><td class="Icon"></td><td class="String">{bodyHTML}</td></tr></table>'};
i._DEFAULT_DICE_TEMPLATE='<img alt="dice" src="{imgDir}d{resultNum}.png" border="0" height="20" width="20">';i._DEFAULT_IMG_DIR="http://www.sssloxia.jp/p/";
i._DETAULT_SEPARATORS={and:"",or:"<div class='separator_or'></div>"};i.reReplace_EscapedDecoTag=new RegExp(h.escape("<(F[1-7]|B|I|S)>([\\s\\S]*?)</\\1>"),"g");
i.reReplace_EscapedDiceTag=new RegExp(h.escape("<D>"),"g");return i;}());b.Formatter=d;});define("lib/ss/expr/rule",["require","exports"],function(c,b){function a(e){var f=e.length-e.replace(/\n/g,"").length;
var d=e.length-f;return{charCount:d,lfCount:f};}b.CountExprChars=a;});define("lib/ss/preview",["require","exports","lib/util/string/format","lib/preview","lib/ss/expr/formatter","lib/ss/expr/rule"],function(b,d,a,c,k,e){d.randomizesDiceTagResult=false;
var g=(function(l){__extends(m,l);function m(n){l.call(this,{insTarget:n.insTarget,insMode:n.insMode,delay_ms:m.DELAY_MS});this.textbox=n.textbox;this.profile=n.profile;
this.formatter=n.formatter;if(n.hasOwnProperty("template_container")){this.template_container=n.template_container;}else{this.template_container="<div class='preview'>{html}</div>";
}this.OnUpdate.RegisterEvent($(this.textbox),"keyup");}m.prototype.Update=function(o){var p=this.textbox.value;if(p===""){return this.Hide();}var n=o?Object.create(o):{};
n.html=this.formatter.Exec(p);var q=a.format(this.template_container,n);this.OverwritePreview(q);return this;};m.DELAY_MS=0;return m;}(c.Preview));d.SSPreview=g;
var f=(function(l){__extends(m,l);function m(n){var o=new k.Formatter({profile:n.profile,at3ModeAsDefault:false,template:m.TEMPLATE,randomizesDiceTag:d.randomizesDiceTagResult,allowsOrTag:true});
l.call(this,{insTarget:n.insTarget,insMode:n.insMode,textbox:n.textbox,profile:n.profile,formatter:o});}m.TEMPLATE=null;return m;}(g));d.SerifPreview=f;
var h=(function(m){__extends(l,m);function l(n){var o=new k.Formatter({profile:n.profile,at3ModeAsDefault:false,template:l.TEMPLATE,randomizesDiceTag:d.randomizesDiceTagResult});
m.call(this,{insTarget:n.insTarget,insMode:n.insMode,textbox:n.textbox,profile:n.profile,formatter:o});}l.TEMPLATE=null;return l;}(g));d.MessagePreview=h;
var j=(function(l){__extends(m,l);function m(n){var o=new k.Formatter({profile:n.profile,at3ModeAsDefault:true,template:m.TEMPLATE,randomizesDiceTag:d.randomizesDiceTagResult});
l.call(this,{insTarget:n.insTarget,insMode:n.insMode,textbox:n.textbox,profile:n.profile,formatter:o});this.nameBox=n.nameBox;this.titleBox=n.titleBox;
this.OnUpdate.RegisterEvent([{target:$(this.nameBox),eventType:"keyup"},{target:$(this.titleBox),eventType:"keyup"}]);}m.prototype.Update=function(){this.template_container=m.TEMPLATE_CONTAINER;
var o=this.titleBox.value||"無題";var n=this.nameBox.value;l.prototype.Update.call(this,{title:o,name:n});return this;};m.TEMPLATE=null;m.TEMPLATE_CONTAINER="<div class='preview'><div class='BackBoard'><b>xxx ：{title}</b> &nbsp;&nbsp;{name}&#12288;（20xx/xx/xx xx:xx:xx） <br> <br>{html}<br><br><br clear='ALL'></div></div>";
return m;}(g));d.PartyBBSPreview=j;var i=(function(l){__extends(m,l);function m(n){var o=new k.Formatter({profile:n.profile,at3ModeAsDefault:true,template:m.TEMPLATE,randomizesDiceTag:d.randomizesDiceTagResult});
l.call(this,{insTarget:n.insTarget,insMode:n.insMode,textbox:n.textbox,profile:n.profile,formatter:o,template_container:m.TEMPLATE_CONTAINER});this.countsChars=n.countsChars||false;
}m.prototype.UpdateContainer=function(n){if(this.countsChars){this.template_container=m.SelectCharCountContainer(n);}else{this.template_container=m.TEMPLATE_CONTAINER;
}return this;};m.SelectCharCountContainer=function(p){var o;if(p.charCount>m.MAX_LENGTH_OF_CHARS){o="<span name='charCount' class='char_count char_count_over'>{charCount}</span>";
}else{o="<span name='charCount' class='char_count'>{charCount}</span>";}var n;if(p.lfCount>m.MAX_COUNT_OF_LF){n="<span name='lfCount' class='lf_count lf_count_over'>{lfCount}</span>";
}else{n="<span name='lfCount' class='lf_count'>{lfCount}</span>";}return a.format(m.TEMPLATE_CONTAINER_COUNTS_CHAR,{charCount:o,lfCount:n});};m.prototype.Update=function(){var n=e.CountExprChars(this.textbox.value);
this.UpdateContainer(n);l.prototype.Update.call(this,n);return this;};m.TEMPLATE=null;m.TEMPLATE_CONTAINER="<div class='preview'><div class='tablestyle3'>{html}</div></div>";
m.TEMPLATE_CONTAINER_COUNTS_CHAR="<div class='preview'><p class='char_count_line'><span class='char_count_cnt'>{charCount} / 5000</span> <span class='lf_count_cnt'>(改行: {lfCount} / 2500)</span></p><div class='tablestyle3'>{html}</div></div>";
m.MAX_LENGTH_OF_CHARS=5000;m.MAX_COUNT_OF_LF=2500;return m;}(g));d.DiaryPreview=i;});define("lib/ss/pages/characterSettings",["require","exports"],function(c,a){var b=(function(){function d(){}d.ExtractIconUrlArray=function(){var h="/p/default.jpg";
var j=document.getElementById("TextBox7");if(j===null){return[];}var e=[j.value||h];for(var f=0;;f++){var g=document.getElementById("TextBox"+(f+12));if(g===null){return e;
}e.push(g.value||h);}};d.ExtractNickname=function(){var e=document.getElementById("TextBox2");if(e===null){return null;}return e.value;};return d;}());
a.CharacterSettings=b;});define("lib/ss/pages",["require","exports","lib/ss/pages/characterSettings"],function(b,a,d){function c(e){for(var f in e){if(!a.hasOwnProperty(f)){a[f]=e[f];
}}}c(d);});define("SSPreviewer.user",["require","exports","lib/ss/profile","lib/ss/pageConfig","lib/ss/page","lib/preview","lib/ss/preview","lib/ss/pages"],function(a,c,h,e,g,b,d,i){var f;
(function(j){function k(){d.SSPreview.DELAY_MS=100;$("head").append('<style type=\'text/css\'>\n    .clearfix:after {\n        content: "";\n        display: block;\n        clear: both;\n    }\n    .separator_or {\n        background-color: rgba(255,255,255,0.25);\n        border-radius: 2px;\n        margin: 4px 0px;\n        text-align: center;\n        vertical-align: middle;\n    }\n    .separator_or:before {\n        content: "- OR -";\n    }\n</style>');
function l(p){return $("textarea").toArray().map(function(u,t){return new d.SerifPreview({insTarget:u,insMode:b.InsertionMode.InsertAfter,textbox:u,profile:p});
});}function n(p){return $("textarea").toArray().map(function(u,t){var v=$(u).nextUntil("input").last().next()[0];return new d.MessagePreview({insTarget:v,insMode:b.InsertionMode.InsertAfter,textbox:u,profile:p});
});}function q(u){for(var v=0,t=u;v<t.length;v++){var p=t[v];p.Show();}}function o(t){for(var u=0,p=t;u<p.length;u++){var v=p[u];v.Hide();}}function s(t){$("head").append("<style type='text/css'>\n    OnActive, .active .hideOnActive {\n        display: none;\n    }\n</style>");
var p=$("<a id='showAllPreviews' class='clearFix' href='#' style='display: block; float: right;'><button type='button' onclick='return false;'>全てのプレビューを<span class='hideOnActive'>表示</span><span class='showOnActive'>隠す</span></button></a>").on("click",function(){p.toggleClass("active");
if(p.hasClass("active")){q(t);}else{o(t);}});$("td.BackMessage2").eq(0).prepend(p);}var r=e.PageConfig;var m=new h.Profile();r.Common=new g.Page(m,function(p){$("#char_Button").before("<center class='F1'>↓(Previewer) アイコン・愛称の自動読込↓</center>");
});r.MainPage=new g.Page(m,function(t){$("head").append("<style type='text/css'>\n    .char_count_line {\n        text-align: left;\n    }\n    .char_count_cnt {\n        font-size: 12px;\n    }\n    .lf_count_cnt {\n        font-size: 10px;\n    }\n    .char_count_line .char_count_over, .char_count_line .lf_count_over {\n        color: #CC3333;\n        font-weight: bold;\n    }\n    .char_count_line .char_count_over {\n        font-size: 16px;\n    }\n    .char_count_line .lf_count_over {\n        font-size: 14px;\n    }\n</style>");
var p=$("#Diary_TextBox")[0];var w=new d.DiaryPreview({insTarget:p,insMode:b.InsertionMode.InsertAfter,textbox:p,profile:t,countsChars:true});var u=$("#TextBox12")[0];
var v=new d.SerifPreview({insTarget:u,insMode:b.InsertionMode.InsertAfter,textbox:u,profile:t});s([w,v]);});r.PartyBBS=new g.Page(m,function(t){var p=$("#commentTxt");
var u=new d.PartyBBSPreview({insTarget:p.closest("div.BackBoard")[0],insMode:b.InsertionMode.InsertAfter,textbox:p[0],profile:t,nameBox:$("#nameTxt")[0],titleBox:$("#titleTxt")[0]});
s([u]);});r.Trade=new g.Page(m,function(p){var t=l(p);s(t);});r.Reinforcement=new g.Page(m,function(p){var t=l(p);s(t);});r.BattleSettings=new g.Page(m,function(p){var t=l(p);
s(t);});r.BattleWords=new g.Page(m,function(p){var t=l(p);s(t);});r.Message=new g.Page(m,function(p){var t=n(p);s(t);});r.GroupMessage=new g.Page(m,function(p){var t=n(p);
s(t);});r.CharacterSettings=new g.Page(m,function(p){p.SaveIconURLArray(i.CharacterSettings.ExtractIconUrlArray());p.SaveNickname(i.CharacterSettings.ExtractNickname());
});r.Community=new g.Page(m,function(t){var p=$("textarea")[0];var u=new d.DiaryPreview({insTarget:p,insMode:b.InsertionMode.InsertAfter,textbox:p,profile:t});
s([u]);});r.RunInitializer(m,document.location);}k();})(f||(f={}));});(function(){require(["SSPreviewer.user"],function(){});})();
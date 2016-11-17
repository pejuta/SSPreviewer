/// <reference path="typings/index.d.ts" />
/// <reference types="jquery" />
declare module "lib/ss/profile" {
    export interface IProfile {
        iconURLArray: string[];
        nickname: string;
        nameColor: string;
    }
    export class Profile implements IProfile {
        constructor();
        constructor(c: IProfile);
        iconURLArray: string[];
        nickname: string;
        nameColor: string;
        SaveIconURLArray(overwriteWith?: string[]): this;
        SaveNickname(overwriteWith?: string): this;
        SaveNameColor(overwriteWith?: string): this;
        private static LoadIconURLArray();
        private static SaveIconURLArray(iconURLArray);
        private static LoadNickname();
        private static SaveNickname(nickname);
        private static LoadNameColor();
        private static SaveNameColor(nameColor);
    }
}
declare module "lib/ss/page" {
    import { IProfile } from "lib/ss/profile";
    export class Page {
        private profile;
        private initializer;
        constructor(profile: IProfile, initializer: (s: IProfile) => void);
        Init(profile: IProfile): void;
        readonly Settings: IProfile;
        readonly Initializer: (s: IProfile) => void;
    }
    export class PageConfig {
        static ForAllPages: Page;
        static MainPage: Page;
        static PartyBBS: Page;
        static Trade: Page;
        static Reinforcement: Page;
        static BattleSettings: Page;
        static BattleWords: Page;
        static Message: Page;
        static GroupMessage: Page;
        static MessageLog: Page;
        static CharacterSettings: Page;
        static Community: Page;
        private static readonly pathnameToPage;
        static RunInitializer(profile: IProfile, location: Location): void;
    }
}
declare module "lib/util/string/format" {
    function format(template: string, args: {
        [index: string]: any;
    }): string;
    export = format;
}
declare module "lib/util/string/replaceLoop" {
    function replaceLoop(searchTarget: any, searchValue: string, replaceValue: string): string;
    function replaceLoop(searchTarget: any, searchValue: string, replacer: (substring: string, ...args: any[]) => string): string;
    function replaceLoop(searchTarget: any, searchValue: RegExp, replaceValue: string): string;
    function replaceLoop(searchTarget: any, searchValue: RegExp, replacer: (substring: string, ...args: any[]) => string): string;
    export = replaceLoop;
}
declare module "lib/util/html/escape" {
    export function escape(s: string): string;
    export function escape(s: string, findPattern: string, regexFlags?: string): string;
    export function unescape(s: string): string;
    export function unescape(s: string, findPattern: string, regexFlags?: string): string;
}
declare module "lib/util/html/tag" {
    export function lineBreaksToBR(html: string): string;
}
declare module "lib/ss/expr/parser" {
    export interface IParsedExpr {
        source: IExprSource;
        attr: IExprAttr;
    }
    export interface IExprSource {
        separator?: string;
        text: string;
    }
    export interface IExprAttr {
        at3Mode?: boolean;
        changedName?: string;
        iconNumber?: string;
    }
    export class Parser {
        static ParseAnd(source: string): IParsedExpr[];
        static ParseOr(source: string): IParsedExpr[][];
    }
}
declare module "lib/preview/model_formatter" {
    export interface IFormatter {
        Exec(source: string, extraArg?: {
            [index: string]: any;
        }): string;
    }
    export class Formatter implements IFormatter {
        Exec(source: string, extraArg?: {
            [index: string]: any;
        }): string;
    }
}
declare module "lib/ss/preview/templates" {
    import { IFormatTemplate } from "lib/ss/preview/model_formatter";
    export namespace Preview {
        let Diary: IFormatTemplate;
        let DiaryCharCountsHTML: string;
        let Message: IFormatTemplate;
        let PartyBBS: IFormatTemplate;
        let Serif: IFormatTemplate;
    }
}
declare module "lib/preview/config" {
    export let neverUpdateHTMLIfHidden: boolean;
    export let previewDelay_ms: number;
}
declare module "lib/ss/preview/config" {
    import * as Templates from "lib/ss/preview/templates";
    import * as Preview from "lib/preview/config";
    export { Templates, Preview };
    export namespace SSPreview {
        let imgBaseURL: string;
        let showsCharCountsOnDiary: boolean;
        let randomizesDiceTagResult: boolean;
        let diceTagTemplateHTML: string;
    }
}
declare module "lib/ss/preview/model_formatter" {
    import { IProfile } from "lib/ss/profile";
    import { IFormatter } from "lib/preview/model_formatter";
    export interface IFormatTemplate {
        readonly Body: string;
        readonly Body_At3ModeAndIcon: string;
        readonly Body_At3Mode: string;
        readonly Body_WhenOrIsEmpty?: string;
    }
    export class Formatter implements IFormatter {
        static _DEFAULT_TEMPLATE: IFormatTemplate;
        static _DEFAULT_DICE_TEMPLATE: string;
        static _DEFAULT_IMG_BASE_URL: string;
        static _DETAULT_SEPARATORS: {
            and: string;
            or: string;
        };
        constructor(args: {
            profile: IProfile;
            template?: IFormatTemplate;
            separators?: {
                and?: string;
                or?: string;
            };
            at3ModeAsDefault?: boolean;
            allowsOrTag?: boolean;
            htmlWhenOrHTMLIsEmpty?: string;
        });
        protected profile: IProfile;
        protected template: IFormatTemplate;
        protected separators: {
            and: string;
            or: string;
        };
        protected at3ModeAsDefault: boolean;
        protected allowsOrTag: boolean;
        protected htmlWhenOrHTMLIsEmpty: string;
        readonly Profile: IProfile;
        readonly Templates: IFormatTemplate;
        readonly Separators: {
            and: string;
            or: string;
        };
        readonly At3ModeAsDefault: boolean;
        readonly AllowsOrTag: boolean;
        readonly HTMLWhenOrHTMLIsEmpty: string;
        readonly DefaultIconURL: string;
        private static GenerateDiceTag(randomize?);
        private static reReplace_EscapedDecoTag;
        private static reReplace_EscapedDiceTag;
        Exec(source: string): string;
        protected Format(source: string): string;
        private FormatOrs(ors);
        private FormatAnds(ands);
    }
}
declare module "lib/interface/disposable" {
    export interface IDisposable {
        Dispose(): void;
    }
}
declare module "lib/util/timer/timer" {
    class Timer {
        protected date_start: number;
        protected time_ms: number;
        readonly Time_ms: number;
        readonly isRunning: boolean;
        resetTimeWhenStarting: boolean;
        Start(): this;
        Stop(): this;
        Pause(): this;
        ResetTime(): this;
        PrintTime(): this;
    }
    export = Timer;
}
declare module "lib/util/timer/timerEvent" {
    import { IDisposable } from "lib/interface/disposable";
    import Timer = require("lib/util/timer/timer");
    class TimerEvent<TCallbackArg> extends Timer implements IDisposable {
        private afterPeriod;
        private period_ms;
        constructor(afterPeriod: (arg?: TCallbackArg) => void, period_ms: number);
        private id;
        private callbackArg;
        private setCallbackArg(a);
        Start(callbackArg?: TCallbackArg): this;
        Stop(): this;
        Stop(callsCallback: boolean, newCallbackArg?: TCallbackArg): this;
        Pause(): this;
        ResetTime(newCallbackArg?: TCallbackArg): this;
        Dispose(): void;
    }
    export = TimerEvent;
}
declare module "lib/preview/model" {
    import { IDisposable } from "lib/interface/disposable";
    import { IFormatter } from "lib/preview/model_formatter";
    import TimerEvent = require("lib/util/timer/timerEvent");
    export type OnUpdatedCallback = (model: IPreviewModel) => (boolean | void);
    export type PreviewUpdateArg = {
        source: string;
        extraArg?: {
            [index: string]: any;
        };
    };
    export interface IPreviewModel extends IDisposable {
        readonly IsDisabled: boolean;
        readonly IsVisible: boolean;
        readonly PreviewHTML: string;
        onUpdated(callback: OnUpdatedCallback): this;
        onUpdated(callbacks: OnUpdatedCallback[]): this;
        offUpdated(callback: OnUpdatedCallback): this;
        offUpdated(callbacks: OnUpdatedCallback[]): this;
        ReserveUpdate(arg: PreviewUpdateArg): boolean;
        Update(arg: PreviewUpdateArg): this;
        Hide(): this;
        Show(): this;
        SetAsHidden(): this;
        SetAsShown(): this;
        SetAsDisabled(): this;
        SetAsEnabled(): this;
    }
    export class PreviewModel implements IPreviewModel {
        protected formatter: IFormatter;
        private delay_ms;
        constructor(formatter?: IFormatter, delay_ms?: number);
        protected previewHTML: string;
        readonly PreviewHTML: string;
        protected source: string;
        protected extraArg: {
            [index: string]: any;
        };
        Delay_ms: number;
        protected isVisible: boolean;
        readonly IsVisible: boolean;
        protected isDisabled: boolean;
        readonly IsDisabled: boolean;
        ReserveUpdate(arg: PreviewUpdateArg): boolean;
        protected timerEvt: TimerEvent<PreviewUpdateArg>;
        private InitTimerEvent();
        Update(arg: PreviewUpdateArg): this;
        private InitOnUpdating();
        protected UpdateInfo(arg: PreviewUpdateArg): boolean;
        Show(): this;
        Hide(): this;
        SetAsHidden(): this;
        SetAsShown(): this;
        SetAsDisabled(): this;
        SetAsEnabled(): this;
        private TriggerOnUpdatedEvent();
        private $onUpdated;
        onUpdated(callback: OnUpdatedCallback): this;
        onUpdated(callbacks: OnUpdatedCallback[]): this;
        offUpdated(callback: OnUpdatedCallback): this;
        offUpdated(callbacks: OnUpdatedCallback[]): this;
        Dispose(): void;
    }
}
declare module "lib/ss/preview/model" {
    import { Formatter } from "lib/ss/preview/model_formatter";
    import { PreviewModel, PreviewUpdateArg } from "lib/preview/model";
    export class SSPreviewModel extends PreviewModel {
        constructor(formatter: Formatter, delay_ms?: number);
        protected UpdateInfo(arg: PreviewUpdateArg): boolean;
    }
}
declare module "lib/ss/preview/partyBBS/model_formatter" {
    import { IProfile } from "lib/ss/profile";
    import { Formatter, IFormatTemplate } from "lib/ss/preview/model_formatter";
    export class PartyBBSFormatter extends Formatter {
        static TEMPLATE_CONTAINER: string;
        constructor(args: {
            profile: IProfile;
            template?: IFormatTemplate;
            separators?: {
                and?: string;
                or?: string;
            };
            at3ModeAsDefault?: boolean;
            randomizesDiceTag?: boolean;
            allowsOrTag?: boolean;
        });
        Exec(source: string, extraArg?: {
            title: string;
            name: string;
        }): string;
    }
}
declare module "lib/ss/preview/partyBBS/model" {
    import { IProfile } from "lib/ss/profile";
    import { SSPreviewModel } from "lib/ss/preview/model";
    import { PartyBBSFormatter } from "lib/ss/preview/partyBBS/model_formatter";
    export type PartyBBSPreviewExtraArg = {
        title: string;
        name: string;
        [index: string]: any;
    };
    export type PartyBBSPreviewUpdateArg = {
        source: string;
        extraArg?: PartyBBSPreviewExtraArg;
    };
    export class PartyBBSModel extends SSPreviewModel {
        constructor(profile: IProfile, delay_ms?: number);
        protected formatter: PartyBBSFormatter;
        protected extraArg: PartyBBSPreviewExtraArg;
        ReserveUpdate(arg: PartyBBSPreviewUpdateArg): boolean;
        protected UpdateInfo(arg: PartyBBSPreviewUpdateArg): boolean;
    }
}
declare module "lib/ss/preview/diary/model_formatter" {
    import { IProfile } from "lib/ss/profile";
    import { Formatter, IFormatTemplate } from "lib/ss/preview/model_formatter";
    export class DiaryFormatter extends Formatter {
        static TEMPLATE_CONTAINER: string;
        constructor(arg: {
            profile: IProfile;
            template?: IFormatTemplate;
            separators?: {
                and?: string;
                or?: string;
            };
            at3ModeAsDefault?: boolean;
            randomizesDiceTag?: boolean;
            allowsOrTag?: boolean;
        });
        Exec(source: string): string;
    }
}
declare module "lib/ss/expr/rule" {
    export function CountExprChars(source: string): {
        lfCount: number;
        charCount: number;
    };
}
declare module "lib/ss/preview/diary/model" {
    import { IProfile } from "lib/ss/profile";
    import { PreviewUpdateArg } from "lib/preview/model";
    import { SSPreviewModel } from "lib/ss/preview/model";
    export type CharCount = {
        charCount: number;
        lfCount: number;
    };
    export class DiaryModel extends SSPreviewModel {
        static readonly MAX_LENGTH_OF_CHARS: number;
        static readonly MAX_COUNT_OF_LFS: number;
        constructor(arg: {
            profile: IProfile;
            delay_ms?: number;
            showsCharCounts?: boolean;
        });
        private showsCharCounts;
        readonly ShowsCharCounts: boolean;
        private charCounts;
        readonly CharCounts: CharCount;
        protected UpdateInfo(arg: PreviewUpdateArg): boolean;
    }
}
declare module "lib/ss/preview/serif/model" {
    import { IProfile } from "lib/ss/profile";
    import { SSPreviewModel } from "lib/ss/preview/model";
    export class SerifModel extends SSPreviewModel {
        constructor(profile: IProfile, delay_ms?: number);
    }
}
declare module "lib/ss/preview/message/model" {
    import { IProfile } from "lib/ss/profile";
    import { SSPreviewModel } from "lib/ss/preview/model";
    export class MessageModel extends SSPreviewModel {
        constructor(profile: IProfile, delay_ms?: number);
    }
}
declare module "lib/ss/preview/model_formatters" {
    import { DiaryFormatter as Diary } from "lib/ss/preview/diary/model_formatter";
    import { PartyBBSFormatter as PartyBBS } from "lib/ss/preview/partyBBS/model_formatter";
    import { Formatter, IFormatTemplate } from "lib/ss/preview/model_formatter";
    import { IFormatter } from "lib/preview/model_formatter";
    export { Diary, PartyBBS, Formatter, IFormatTemplate, IFormatter };
}
declare module "lib/ss/preview/models" {
    import { PartyBBSModel as PartyBBS } from "lib/ss/preview/partyBBS/model";
    import { DiaryModel as Diary } from "lib/ss/preview/diary/model";
    import { SerifModel as Serif } from "lib/ss/preview/serif/model";
    import { MessageModel as Message } from "lib/ss/preview/message/model";
    import { IPreviewModel } from "lib/preview/model";
    export { PartyBBS, Diary, Serif, Message, IPreviewModel };
}
declare module "lib/preview/view" {
    import { IDisposable } from "lib/interface/disposable";
    import { IPreviewModel } from "lib/preview/model";
    export interface IInsert {
        target: HTMLElement;
        way: InsertWay;
    }
    export enum InsertWay {
        InsertAfter = 0,
        InsertBefore = 1,
        AppendTo = 2,
        PrependTo = 3,
    }
    export interface IPreviewView extends IDisposable {
        readonly PreviewContainer: HTMLElement;
        Update(model: IPreviewModel): boolean;
        Show(model: IPreviewModel): this;
        Hide(model: IPreviewModel): this;
    }
    export class PreviewView implements IPreviewView {
        private insert;
        static containerHTML: string;
        constructor(insert: IInsert);
        protected $container: JQuery;
        readonly PreviewContainer: HTMLElement;
        private InsertContainer();
        Hide(model: IPreviewModel): this;
        Show(model: IPreviewModel): this;
        Update(model: IPreviewModel): boolean;
        Dispose(): void;
    }
}
declare module "lib/ss/preview/diary/view" {
    import { DiaryModel } from "lib/ss/preview/diary/model";
    import { IInsert, PreviewView } from "lib/preview/view";
    export class DiaryView extends PreviewView {
        static _DEFAULT_TEMPLATE_CHARCOUNTS: string;
        constructor(insert: IInsert);
        private static BuildCharCountLine(counts);
        Update(model: DiaryModel): boolean;
    }
}
declare module "lib/ss/preview/views" {
    import { DiaryView as Diary } from "lib/ss/preview/diary/view";
    import { InsertWay, IInsert, IPreviewView } from "lib/preview/view";
    export { Diary, InsertWay, IInsert, IPreviewView };
}
declare module "lib/util/array/set" {
    class FakeSet<T> {
        protected equalityValidator: (v1: T, v2: T) => boolean;
        private innerArray;
        constructor(equalityValidator?: (v1: T, v2: T) => boolean, array?: T[]);
        has(e: T): boolean;
        indexOf(e: T): number;
        add(e: T): this;
        addAll(a: T[]): this;
        del(e: T): boolean;
        delAll(a: T[]): boolean;
        clear(): void;
        forEach(callback: (value1: T, value2: T, set: this) => any): void;
        readonly size: number;
        toArray(): T[];
    }
    export = FakeSet;
}
declare module "lib/util/jquery/customEvent" {
    import { IDisposable } from "lib/interface/disposable";
    export type EventCallback = (...args: any[]) => (boolean | void);
    export interface IEvent extends IDisposable {
        readonly Name: string;
        AddCallback(callback: EventCallback): this;
        AddCallbacks(callbacks: EventCallback[]): this;
        RemoveCallback(callback: EventCallback): this;
        RemoveCallbacks(): this;
        RemoveCallbacks(callbacks: EventCallback[]): this;
        AddTrigger(evt: IEventArg): boolean;
        AddTriggers(evts: IEventArg[]): this;
        RemoveTrigger(evt: IEventArg): boolean;
        RemoveTriggers(): this;
        RemoveTriggers(evts: IEventArg[]): this;
    }
    export interface IEventArg {
        target: JQuery;
        eventType: string;
    }
    export class Event implements IEvent {
        private name;
        constructor(name: string, callback?: (eventObject: JQueryEventObject) => any);
        readonly Name: string;
        private $callback;
        AddCallback(callback: EventCallback): this;
        AddCallbacks(callbacks: EventCallback[]): this;
        RemoveCallback(callback: EventCallback): this;
        RemoveCallbacks(): this;
        RemoveCallbacks(callbacks: EventCallback[]): this;
        private _thisEventCallback;
        private evts;
        AddTrigger(evt: IEventArg): boolean;
        AddTriggers(evts: IEventArg[]): this;
        RemoveTrigger(evt: IEventArg): boolean;
        RemoveTriggers(): this;
        RemoveTriggers(evts: IEventArg[]): this;
        private RemoveAllTriggers();
        Dispose(): void;
    }
}
declare module "lib/preview/controller" {
    import { Event } from "lib/util/jquery/customEvent";
    import { IDisposable } from "lib/interface/disposable";
    import { IPreviewModel, PreviewUpdateArg } from "lib/preview/model";
    import { IPreviewView } from "lib/preview/view";
    export interface IPreviewController extends IDisposable {
        readonly OnPreviewTriggerd: Event;
        BuildUpdateArg(...extraArgs: any[]): PreviewUpdateArg;
        ReserveUpdate(): boolean;
        Update(): this;
        Show(): this;
        Hide(): this;
        Enable(): this;
        Disable(): this;
    }
    export abstract class PreviewController implements IPreviewController {
        constructor(arg: {
            model: IPreviewModel;
            view: IPreviewView;
        });
        protected model: IPreviewModel;
        protected view: IPreviewView;
        protected callback_onPreviewTriggerd: (eventObject: JQueryEventObject) => void;
        private onPreviewTriggered;
        readonly OnPreviewTriggerd: Event;
        ReserveUpdate(): boolean;
        Update(): this;
        Show(): this;
        Hide(): this;
        Enable(): this;
        Disable(): this;
        abstract BuildUpdateArg(...extraArgs: any[]): PreviewUpdateArg;
        Dispose(): void;
    }
}
declare module "lib/ss/preview/controller" {
    import { IPreviewModel, PreviewUpdateArg } from "lib/preview/model";
    import { IPreviewView } from "lib/preview/view";
    import { PreviewController } from "lib/preview/controller";
    export interface ISSPreviewControllerCtorArg {
        model: IPreviewModel;
        view: IPreviewView;
        textbox: HTMLTextAreaElement | HTMLInputElement;
    }
    export class SSPreviewController extends PreviewController {
        constructor(arg: ISSPreviewControllerCtorArg);
        protected textbox: HTMLTextAreaElement | HTMLInputElement;
        BuildUpdateArg(extraArg?: {
            [index: string]: any;
        }): PreviewUpdateArg;
    }
}
declare module "lib/ss/preview/partyBBS/controller" {
    import { PartyBBSModel, PartyBBSPreviewUpdateArg } from "lib/ss/preview/partyBBS/model";
    import { SSPreviewController, ISSPreviewControllerCtorArg } from "lib/ss/preview/controller";
    export interface IPartyBBSControllerCtorArg extends ISSPreviewControllerCtorArg {
        titleInput: HTMLInputElement;
        nameInput: HTMLInputElement;
    }
    export class PartyBBSController extends SSPreviewController {
        constructor(arg: IPartyBBSControllerCtorArg);
        protected model: PartyBBSModel;
        private titleInput;
        private nameInput;
        BuildUpdateArg(extraArg?: {
            [index: string]: any;
        }): PartyBBSPreviewUpdateArg;
    }
}
declare module "lib/ss/preview/controllers" {
    import { PartyBBSController as PartyBBS } from "lib/ss/preview/partyBBS/controller";
    import { IPreviewController } from "lib/preview/controller";
    export { PartyBBS, IPreviewController };
}
declare module "lib/ss/preview/packagedPreview" {
    import { IPreviewModel } from "lib/preview/model";
    import { IInsert, IPreviewView } from "lib/preview/view";
    import { IPreviewController } from "lib/preview/controller";
    import { IProfile } from "lib/ss/profile";
    export interface IPackagedPreviewCtorArg {
        model: {
            profile: IProfile;
        };
        view: {
            insert: IInsert;
        };
        ctrl: {
            textbox: HTMLTextAreaElement | HTMLInputElement;
        };
    }
    export interface IPackagedPreview {
        readonly Model: IPreviewModel;
        readonly View: IPreviewView;
        readonly Controller: IPreviewController;
    }
}
declare module "lib/ss/preview/diary/package" {
    import { IProfile } from "lib/ss/profile";
    import { IPackagedPreview, IPackagedPreviewCtorArg } from "lib/ss/preview/packagedPreview";
    import { SSPreviewController } from "lib/ss/preview/controller";
    import { DiaryModel } from "lib/ss/preview/diary/model";
    import { DiaryView } from "lib/ss/preview/diary/view";
    export interface IDiaryPackageCtorArg extends IPackagedPreviewCtorArg {
        model: {
            profile: IProfile;
            showsCharCounts?: boolean;
        };
    }
    export class DiaryPackage implements IPackagedPreview {
        constructor(args: IDiaryPackageCtorArg);
        private _model;
        private _view;
        private _ctrl;
        readonly Model: DiaryModel;
        readonly View: DiaryView;
        readonly Controller: SSPreviewController;
    }
}
declare module "lib/ss/preview/message/package" {
    import { PreviewView } from "lib/preview/view";
    import { IPackagedPreview, IPackagedPreviewCtorArg } from "lib/ss/preview/packagedPreview";
    import { SSPreviewController } from "lib/ss/preview/controller";
    import { MessageModel } from "lib/ss/preview/message/model";
    export class MessagePackage implements IPackagedPreview {
        constructor(args: IPackagedPreviewCtorArg);
        private _model;
        private _view;
        private _ctrl;
        readonly Model: MessageModel;
        readonly View: PreviewView;
        readonly Controller: SSPreviewController;
    }
}
declare module "lib/ss/preview/partyBBS/package" {
    import { PreviewView } from "lib/preview/view";
    import { IPackagedPreview, IPackagedPreviewCtorArg } from "lib/ss/preview/packagedPreview";
    import { PartyBBSModel } from "lib/ss/preview/partyBBS/model";
    import { PartyBBSController } from "lib/ss/preview/partyBBS/controller";
    export interface IPartyBBSPackageCtorArg extends IPackagedPreviewCtorArg {
        ctrl: {
            textbox: HTMLTextAreaElement | HTMLInputElement;
            titleInput: HTMLInputElement;
            nameInput: HTMLInputElement;
        };
    }
    export class PartyBBSPackage implements IPackagedPreview {
        constructor(args: IPartyBBSPackageCtorArg);
        private _model;
        private _view;
        private _ctrl;
        readonly Model: PartyBBSModel;
        readonly View: PreviewView;
        readonly Controller: PartyBBSController;
    }
}
declare module "lib/ss/preview/serif/package" {
    import { PreviewView } from "lib/preview/view";
    import { IPackagedPreview, IPackagedPreviewCtorArg } from "lib/ss/preview/packagedPreview";
    import { SSPreviewController } from "lib/ss/preview/controller";
    import { SerifModel } from "lib/ss/preview/serif/model";
    export class SerifPackage implements IPackagedPreview {
        constructor(args: IPackagedPreviewCtorArg);
        private _model;
        private _view;
        private _ctrl;
        readonly Model: SerifModel;
        readonly View: PreviewView;
        readonly Controller: SSPreviewController;
    }
}
declare module "lib/ss/preview/packages" {
    import { DiaryPackage as Diary } from "lib/ss/preview/diary/package";
    import { MessagePackage as Message } from "lib/ss/preview/message/package";
    import { PartyBBSPackage as PartyBBS } from "lib/ss/preview/partyBBS/package";
    import { SerifPackage as Serif } from "lib/ss/preview/serif/package";
    import { IPackagedPreview, IPackagedPreviewCtorArg } from "lib/ss/preview/packagedPreview";
    export { Diary, Message, PartyBBS, Serif, IPackagedPreview, IPackagedPreviewCtorArg };
}
declare module "lib/ss/preview" {
    import * as Model from "lib/ss/preview/models";
    import * as Formatter from "lib/ss/preview/model_formatter";
    import * as View from "lib/ss/preview/views";
    import * as Controller from "lib/ss/preview/controllers";
    import * as Package from "lib/ss/preview/packages";
    import * as Config from "lib/ss/preview/config";
    import * as Profile from "lib/ss/profile";
    export { Model, Formatter, View, Controller, Package, Profile, Config };
}
declare module "lib/ss/pages/characterSettings" {
    export class CharacterSettings {
        static ExtractIconUrlArray(): string[];
        static ExtractNickname(): string;
    }
}
declare module "lib/ss/pages" {
    import { CharacterSettings } from "lib/ss/pages/characterSettings";
    export { CharacterSettings };
}
declare module "SSPreviewer.user" {
}

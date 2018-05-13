import { IPageMetaInfo, IRoute, ISeanceInitialInfo, IPackInfo } from "neweb-core";
import { Observable, BehaviorSubject, Subject } from "rxjs";
export interface IApplication {
    createRouter(params: IRouterConfig<any, any>): IRouter | Promise<IRouter>;
    getContext(): any;
    createPageTemplate(config: IPageTemplateConfig): IPageTemplate | Promise<IPageTemplate>;
    getFrameViewModulePackInfo(frameName: string): Promise<IPackInfo>;
    getFrameViewClass(frameName: string): Promise<any>;
    getFrameControllerClass(frameName: string): Promise<IControllerClass>;
}
export interface IPageTemplateClass {
    new(config: IPageTemplateConfig): IPageTemplate;
}
export interface IPageTemplateConfig extends IPageMetaInfo {
    body: string;
    initialInfo: ISeanceInitialInfo;
    template?: string | null;
}

export interface IPageTemplate {
    render(): string | Promise<string>;
}
export type RouteListener = (route: IRoute) => void;
export interface IRouter {
    route$: Subject<IRoute>;
    dispose(): void | Promise<void>;
}
export interface IRouterClass<APP, SESSION> {
    new(config: IRouterConfig<APP, SESSION>): IRouter;
}
export interface IRouterConfig<APP, SESSION> {
    app: APP;
    seance: ISeanceContext;
    session: ISessionContext<SESSION>;
}
export interface IApplicationContext {

}
export interface ISeanceContext {
    navigate(url: string): void | Promise<void>;
    url$: Observable<string>;
}
export interface IServerRequest {
    url: string;
    sessionId: string;
    headers: { [index: string]: string | undefined };
}
export interface IServerResponse {
    type: "NotFound" | "Redirect" | "Html";
    body: string;
    headers: { [index: string]: string | undefined };
}


export interface IController {
    data$: Observable<any>;
    dispatch: (name: string, ...args: any[]) => Promise<void> | void;
    dispose: () => Promise<void> | void;
    onChangeParams: (params: any) => Promise<void>;
}
export interface IControllerClass {
    new(config: IControllerConfig<any, any, any>): IController;
}
export interface IControllerConfig<PARAMS, APP, SESSION> {
    params: PARAMS;
    seance: ISeanceContext;
    session: ISessionContext<SESSION>;
    app: APP;
}

export interface IClientServerEvent {
    NotFoundSeance: { text: string };
}
export interface IModulePacker {
    addLocalPackage(path: string): Promise<IPackInfo>;
}

export interface ISessionsManager {
    getSessionContext(sessionId: string): ISessionContext<any> | Promise<ISessionContext<any>>;
}
export interface ISessionContext<SESSION extends { [index: string]: any }> {
    has<P extends keyof SESSION>(name: P): boolean;
    get$<P extends keyof SESSION>(name: P): Observable<SESSION[P]>;
    get<P extends keyof SESSION>(name: P): SESSION[P] | undefined;
    set<P extends keyof SESSION>(name: P, value: SESSION[P]): Promise<void> | void;
}

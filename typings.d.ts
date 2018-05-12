import { IPageMetaInfo, IRoute, ISeanceInitialInfo, IPackInfo } from "neweb-core";
import { Observable, BehaviorSubject, Subject } from "rxjs";
export interface IApplication {
    createRouter(params: {
        seance: ISeanceContext;
        sessionId: string;
    }): IRouter | Promise<IRouter>;
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
}

export interface IPageTemplate {
    render(): string | Promise<string>;
}
export type RouteListener = (route: IRoute) => void;
export interface IRouter {
    route$: Subject<IRoute>;
    dispose(): void | Promise<void>;
}
export interface IRouterClass {
    new(config: IRouterConfig): IRouter;
}
export interface IRouterConfig {
    seance: ISeanceContext;
    sessionId: string;
}
export interface IApplicationContext {

}
export interface ISeanceContext {
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
}


export interface IController {
    data$: Observable<any>;
    dispatch(name: string, ...args: any[]): void;
    dispose(): void | Promise<void>;
}
export interface IControllerClass {
    new(config: IControllerConfig): IController;
}
export interface IControllerConfig {
    params: any;
    seance: ISeanceContext;
    context: IApplicationContext;
}

export interface IClientServerEvent {
    NotFoundSeance: { text: string };
}
export interface IModulePacker {
    addLocalPackage(path: string): Promise<IPackInfo>;
}

import debug = require("debug");
import { IPage, IPageFrame, IPageRoute, IRedirectRoute, IRoute, IRoutePage } from "neweb-core";
import { Observable, Subject } from "rxjs";
import { filter, skip, take } from "rxjs/operators";
import { IApplication, IController, IRouter, ISeanceContext, ISessionsManager } from "../typings";
import PageComparator from "./PageComparator";
import PageCreator from "./PageCreator";

export interface ISeanceConfig {
    seanceId: string;
    sessionId: string;
    app: IApplication;
    sessionsManager: ISessionsManager;
}
interface IControllerItem {
    controllerId: string;
    controller: IController;
    createdAt: Date;
}
class Seance {
    public url$: Subject<string> = new Subject();
    public router: IRouter;
    public route$: Observable<IRoute>;
    public page$: Subject<IPage> = new Subject();
    public controllerData$: Subject<{
        controllerId: string;
        fieldName: string;
        value: any;
    }> = new Subject();
    protected currentPage: IPage | null = null;
    protected controllers: { [index: string]: IControllerItem } = {};
    constructor(protected config: ISeanceConfig) {

    }
    public getId() {
        return this.config.seanceId;
    }
    public async createController(frame: IPageFrame): Promise<IController> {
        const ControllerClass = await this.config.app.getFrameControllerClass(frame.frameName);
        const controller = new ControllerClass({
            session: await this.config.sessionsManager.getSessionContext(this.config.sessionId),
            seance: this.getContext(),
            app: await this.config.app.getContext(),
            params: frame.params,
        });
        if (controller.data) {
            Object.keys(controller.data).map((fieldName) => {
                const dataField = controller.data[fieldName];
                if (dataField instanceof Observable || typeof (dataField.subscribe) === "function") {
                    dataField.subscribe((value: any) => {
                        this.controllerData$.next({
                            controllerId: frame.frameId,
                            fieldName,
                            value,
                        });
                    });
                }
            });
        }
        this.controllers[frame.frameId] = {
            controller,
            controllerId: frame.frameId,
            createdAt: new Date(),
        };
        return controller;
    }
    public async init() {
        this.router = await this.config.app.createRouter({
            seance: this.getContext(),
            session: await this.config.sessionsManager.getSessionContext(this.config.sessionId),
            app: await this.config.app.getContext(),
        });
        this.route$ = this.router.route$;
        this.route$.pipe(filter((r) => r.type === "page"))
            .subscribe(async (route: IPageRoute) => {
                debug("neweb:seance")("new page", route.page);
                this.currentPage = this.currentPage ?
                    await this.replacePage(this.currentPage, route.page) : await this.createPage(route.page);
                this.page$.next(this.currentPage);
            });
        this.route$.pipe(filter((r) => r.type === "notFound"))
            .subscribe(() => {
                console.log("404");
            });
        this.route$.pipe(skip(1), filter((r) => r.type === "redirect")).subscribe((route: IRedirectRoute) => {
            this.navigate(route.url);
        });
    }
    public async replacePage(oldPage: IPage, routePage: IRoutePage): Promise<IPage> {
        const pageCreator = new PageCreator({
            app: this.config.app,
        });
        const newPage = await pageCreator.createPage(routePage);
        const pageComparator = new PageComparator();
        const info = pageComparator.getCompareInfo(oldPage, newPage);
        // TODO WAIT?
        info.frameidsForRemoving.map((id) => this.removeController(id));
        const changeParamsPromises = info.frameForChangeParams.map((frame) => {
            return this.controllers[frame.frameId].controller.onChangeParams(frame.params);
        });
        await Promise.all<any>(info.newFrames.map(async (frame) => {
            const controller = await this.createController(frame);
            const data = await this.waitControllerData(controller);
            frame.data = data;
        }).concat(changeParamsPromises));
        return info.page;
    }
    public async removeController(id: string) {
        if (this.controllers[id]) {
            await this.controllers[id].controller.dispose();
        }
        delete this.controllers[id];
    }
    public async createPage(routePage: IRoutePage): Promise<IPage> {
        const pageCreator = new PageCreator({
            app: this.config.app,
        });
        const page = await pageCreator.createPage(routePage);
        await Promise.all(page.frames.map(async (frame) => {
            const controller = await this.createController(frame);
            const data = await this.waitControllerData(controller);
            frame.data = data;
        }));
        return page;
    }
    public async dispose() {
        await this.router.dispose();
        await Promise.all(Object.keys(this.controllers)
            .map((controllerId) => this.controllers[controllerId].controller.dispose()));
    }
    public navigate = (url: string) => {
        debug("neweb:seance")("navigate to", url);
        this.url$.next(url);
    }
    public dispatch = async (controllerId: string, actionName: string, args: any[]) => {
        if (!this.controllers[controllerId]) {
            throw new Error("Not found contoller with id " + controllerId);
        }
        await this.controllers[controllerId].controller.dispatch(actionName, ...args);
    }
    public getContext(): ISeanceContext {
        return {
            url$: this.url$,
            navigate: this.navigate,
        };
    }
    protected async waitControllerData(controller: IController) {
        const data: any = {};
        if (!controller.data) {
            return data;
        }
        await Promise.all(Object.keys(controller.data).map(async (fieldName) => {
            const field = controller.data[fieldName];
            data[fieldName] = field instanceof Observable || typeof (field.pipe) === "function" ?
                await field.pipe(take(1)).toPromise() :
                field;
        }));
        return data;
    }
}
export default Seance;

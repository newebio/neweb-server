import { IPage, IPageFrame, IPageRoute, IRoute, IRoutePage } from "neweb-core";
import { Observable, Subject } from "rxjs";
import { filter, take } from "rxjs/operators";
import { IApplication, IController, IRouter, ISeanceContext } from "../typings";
import PageCreator from "./PageCreator";

export interface ISeanceConfig {
    seanceId: string;
    sessionId: string;
    app: IApplication;
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
        data: any;
    }> = new Subject();
    protected controllers: { [index: string]: IControllerItem } = {};
    constructor(protected config: ISeanceConfig) {

    }
    public getId() {
        return this.config.seanceId;
    }
    public async createController(frame: IPageFrame): Promise<IController> {
        const ControllerClass = await this.config.app.getFrameControllerClass(frame.frameName);
        const controller = new ControllerClass({
            seance: this.getContext(),
            context: await this.config.app.getContext(),
            params: frame.params,
        });
        controller.data$.subscribe((data) => {
            this.controllerData$.next({ controllerId: frame.frameId, data });
        });
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
            sessionId: this.config.sessionId,
        });
        this.route$ = this.router.route$;
        this.route$.pipe(filter((r) => r.type === "page"))
            .subscribe(async (route: IPageRoute) => {
                const page = await this.createPage(route.page);
                this.page$.next(page);
            });
    }
    public async createPage(routePage: IRoutePage): Promise<IPage> {
        const pageCreator = new PageCreator({
            app: this.config.app,
        });
        const page = await pageCreator.createPage(routePage);
        await Promise.all(page.frames.map(async (frame) => {
            const controller = await this.createController(frame);
            const data = await controller.data$.pipe(take(1)).toPromise();
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
        };
    }
}
export default Seance;

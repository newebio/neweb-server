import { ReplaySubject, Subscription } from "rxjs";
import { IControllerConfig } from "..";

class FrameController<PARAMS, DATA, APP, SESSION> {
    public data$: ReplaySubject<DATA> = new ReplaySubject<DATA>(1);
    protected subscriptions: Subscription[] = [];
    constructor(protected config: IControllerConfig<PARAMS, APP, SESSION>) {
        this.onInit();
    }
    public onInit() {
        this.data$.next({} as any);
    }
    public dispatch(actionName: string, ...args: any[]): void | Promise<void> {
        if ((this as any)[actionName]) {
            return (this as any)[actionName](...args);
        }
        throw new Error("Unknown action " + actionName);
    }
    public dispose() {
        this.subscriptions.map((s) => s.unsubscribe());
    }
}
export default FrameController;

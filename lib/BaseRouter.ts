import { IRoute } from "neweb-core";
import { Subject, Subscription } from "rxjs";
import { IRouter, IRouterConfig } from "..";

class BaseRouter implements IRouter {
    public route$: Subject<IRoute> = new Subject();
    protected urlSubscription: Subscription;
    constructor(protected config: IRouterConfig) {
        this.urlSubscription = config.seance.url$.subscribe((url) => {
            if (url === "/") {
                const route: IRoute = {
                    type: "page",
                    page: {
                        url,
                        rootFrame: {
                            name: "index",
                            params: {},
                            frames: {},
                        },
                    },
                };
                this.route$.next(route);
                return;
            }
            this.route$.next({
                type: "notFound",
                text: "Unknown url " + url,
            });
        });
    }
    public dispose() {
        this.urlSubscription.unsubscribe();
    }
}
export default BaseRouter;

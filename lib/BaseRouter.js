"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class BaseRouter {
    constructor(config) {
        this.config = config;
        this.route$ = new rxjs_1.Subject();
        this.urlSubscription = config.seance.url$.subscribe((url) => {
            if (url === "/") {
                const route = {
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
    dispose() {
        this.urlSubscription.unsubscribe();
    }
}
exports.default = BaseRouter;

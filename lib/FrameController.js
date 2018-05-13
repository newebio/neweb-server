"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class FrameController {
    constructor(config) {
        this.config = config;
        this.data$ = new rxjs_1.ReplaySubject(1);
        this.subscriptions = [];
        this.onInit();
    }
    onInit() {
        this.data$.next({});
    }
    dispatch(actionName, ...args) {
        if (this[actionName]) {
            return this[actionName](...args);
        }
        throw new Error("Unknown action " + actionName);
    }
    dispose() {
        this.subscriptions.map((s) => s.unsubscribe());
    }
}
exports.default = FrameController;

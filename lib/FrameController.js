"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FrameController {
    constructor(config) {
        this.config = config;
        this.data = {};
        this.subscriptions = [];
        this.onInit();
    }
    onInit() {
        //
    }
    onChangeParams(_) {
        //
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

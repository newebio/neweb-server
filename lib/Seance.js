"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const PageCreator_1 = require("./PageCreator");
class Seance {
    constructor(config) {
        this.config = config;
        this.url$ = new rxjs_1.Subject();
        this.page$ = new rxjs_1.Subject();
        this.controllerData$ = new rxjs_1.Subject();
        this.controllers = {};
        this.navigate = (url) => {
            this.url$.next(url);
        };
        this.dispatch = (controllerId, actionName, args) => __awaiter(this, void 0, void 0, function* () {
            if (!this.controllers[controllerId]) {
                throw new Error("Not found contoller with id " + controllerId);
            }
            yield this.controllers[controllerId].controller.dispatch(actionName, ...args);
        });
    }
    getId() {
        return this.config.seanceId;
    }
    createController(frame) {
        return __awaiter(this, void 0, void 0, function* () {
            const ControllerClass = yield this.config.app.getFrameControllerClass(frame.frameName);
            const controller = new ControllerClass({
                seance: this.getContext(),
                context: yield this.config.app.getContext(),
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
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.router = yield this.config.app.createRouter({
                seance: this.getContext(),
                sessionId: this.config.sessionId,
            });
            this.route$ = this.router.route$;
            this.route$.pipe(operators_1.filter((r) => r.type === "page"))
                .subscribe((route) => __awaiter(this, void 0, void 0, function* () {
                const page = yield this.createPage(route.page);
                this.page$.next(page);
            }));
        });
    }
    createPage(routePage) {
        return __awaiter(this, void 0, void 0, function* () {
            const pageCreator = new PageCreator_1.default({
                app: this.config.app,
            });
            const page = yield pageCreator.createPage(routePage);
            yield Promise.all(page.frames.map((frame) => __awaiter(this, void 0, void 0, function* () {
                const controller = yield this.createController(frame);
                const data = yield controller.data$.pipe(operators_1.take(1)).toPromise();
                frame.data = data;
            })));
            return page;
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.router.dispose();
            yield Promise.all(Object.keys(this.controllers)
                .map((controllerId) => this.controllers[controllerId].controller.dispose()));
        });
    }
    getContext() {
        return {
            url$: this.url$,
        };
    }
}
exports.default = Seance;
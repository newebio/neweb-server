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
class RemoteServer {
    constructor(config) {
        this.config = config;
        this.subscriptions = [];
        const seance = this.config.seance;
        this.subscriptions.push(seance.controllerData$.subscribe((params) => {
            this.config.client.newControllerData({
                controllerId: params.controllerId,
                fieldName: params.fieldName,
                value: params.value,
            });
        }));
        this.subscriptions.push(seance.page$.subscribe((page) => this.config.client.newPage({
            page,
        })));
    }
    navigate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.config.seance.navigate(params.url);
        });
    }
    dispatchControllerAction(params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.config.seance.dispatch(params.controllerId, params.actionName, params.args);
        });
    }
    dispose() {
        this.subscriptions.map((s) => s.unsubscribe());
    }
}
exports.default = RemoteServer;

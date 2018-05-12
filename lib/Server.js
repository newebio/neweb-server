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
const operators_1 = require("rxjs/operators");
const PageRenderer_1 = require("./PageRenderer");
const RemoteServer_1 = require("./RemoteServer");
class Server {
    constructor(config) {
        this.config = config;
    }
    resolveRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const seance = yield this.config.seancesManager.createSeance({
                sessionId: request.sessionId,
            });
            const routePromise = seance.route$.pipe(operators_1.take(1)).toPromise();
            const pagePromise = seance.page$.pipe(operators_1.take(1)).toPromise();
            seance.navigate(request.url);
            const route = yield routePromise;
            if (route.type === "notFound") {
                return {
                    type: "NotFound",
                    body: route.text,
                };
            }
            if (route.type === "redirect") {
                return {
                    type: "Redirect",
                    body: "Moved permanently",
                };
            }
            const page = yield pagePromise;
            const body = yield PageRenderer_1.default(this.config.app, page);
            const template = yield this.config.app.createPageTemplate({
                title: page.title,
                meta: page.meta,
                body,
                initialInfo: {
                    page,
                    seanceId: seance.getId(),
                },
            });
            return {
                type: "Html",
                body: yield template.render(),
            };
        });
    }
    connectClient({ client, seanceId, request }) {
        return __awaiter(this, void 0, void 0, function* () {
            const seance = yield this.config.seancesManager.resolveSeance({
                sessionId: request.sessionId,
                seanceId,
            });
            if (!seance) {
                client.error({
                    text: "Not found seance with id " + seanceId,
                });
                return;
            }
            const remoteServer = new RemoteServer_1.default({ seance, client });
            yield client.connectTo(remoteServer);
        });
    }
}
exports.default = Server;

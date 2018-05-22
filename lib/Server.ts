import { IPage, IRemoteClient } from "neweb-core";
import { take } from "rxjs/operators";
import { IApplication, IServerRequest, IServerResponse } from "../typings";
import RemoteServer from "./RemoteServer";
import SeancesManager from "./SeancesManager";
export interface IServerConfig {
    app: IApplication;
    seancesManager: SeancesManager;
    pageRenderer: {
        render: (page: IPage) => string | Promise<string>;
    };
}
class Server {
    constructor(protected config: IServerConfig) { }
    public async resolveRequest(request: IServerRequest): Promise<IServerResponse> {
        const seance = await this.config.seancesManager.createSeance({
            sessionId: request.sessionId,
        });
        const routePromise = seance.route$.pipe(take(1)).toPromise();
        const pagePromise = seance.page$.pipe(take(1)).toPromise();
        seance.navigate(request.url);
        const route = await routePromise;
        if (route.type === "notFound") {
            return {
                type: "NotFound",
                body: route.text,
                headers: {},
            };
        }
        if (route.type === "redirect") {
            return {
                type: "Redirect",
                body: "Moved permanently",
                headers: {
                    Location: route.url,
                },
            };
        }
        const page = await pagePromise;

        const body = await this.config.pageRenderer.render(page);

        const template = await this.config.app.createPageTemplate({
            env: await this.config.app.getEnvironment(),
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
            body: await template.render(),
            headers: {},
        };
    }
    public async connectClient({ client, seanceId, request }: {
        request: IServerRequest;
        seanceId: string;
        client: IRemoteClient;
    }) {
        const seance = await this.config.seancesManager.resolveSeance({
            sessionId: request.sessionId,
            seanceId,
        });
        if (!seance) {
            client.error({
                text: "Not found seance with id " + seanceId,
            });
            return;
        }
        const remoteServer = new RemoteServer({ seance, client });
        await client.connectTo(remoteServer);
    }
}
export default Server;

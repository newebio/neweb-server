import { IDispatchControllerActionParams, IRemoteClient, IRemoteServer } from "neweb-core";
import { Subscription } from "rxjs";
import Seance from "./Seance";

export interface IRemoteServerConfig {
    seance: Seance;
    client: IRemoteClient;
}
class RemoteServer implements IRemoteServer {
    protected subscriptions: Subscription[] = [];
    constructor(protected config: IRemoteServerConfig) {
        const seance = this.config.seance;
        this.subscriptions.push(
            seance.controllerData$.subscribe((params) => {
                this.config.client.newControllerData({
                    controllerId: params.controllerId,
                    data: params.data,
                });
            }),
        );
        this.subscriptions.push(
            seance.page$.subscribe((page) => this.config.client.newPage({
                page,
            })),
        );
    }
    public async dispatchControllerAction(params: IDispatchControllerActionParams) {
        await this.config.seance.dispatch(params.controllerId, params.actionName, params.args);
    }
    public dispose() {
        this.subscriptions.map((s) => s.unsubscribe());
    }
}
export default RemoteServer;

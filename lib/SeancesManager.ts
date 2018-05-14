import uid = require("uid-safe");
import { IApplication, ISessionsManager } from "../typings";
import Seance from "./Seance";
export interface ISeancesManagerConfig {
    app: IApplication;
    sessionsManager: ISessionsManager;
}
class SeancesManager {
    protected seances: {
        [index: string]: {
            createdAt: Date;
            seance: Seance;
            sessionId: string;
        };
    } = {};
    constructor(protected config: ISeancesManagerConfig) { }
    public async createSeance({ sessionId }: {
        sessionId: string;
    }) {
        const seanceId = await this.generateSeanceId();
        const seance = new Seance({
            seanceId, sessionId, app: this.config.app,
            sessionsManager: this.config.sessionsManager,
        });
        await seance.init();
        this.seances[seanceId] = {
            createdAt: new Date(),
            seance,
            sessionId,
        };
        return seance;
    }
    public async resolveSeance({ seanceId, sessionId }: {
        seanceId: string;
        sessionId: string;
    }) {
        return this.seances[seanceId]
            && this.seances[seanceId].sessionId === sessionId
            ? this.seances[seanceId].seance : null;
    }
    protected async generateSeanceId() {
        return uid(20);
    }
}
export default SeancesManager;

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
const uid = require("uid-safe");
const Seance_1 = require("./Seance");
class SeancesManager {
    constructor(config) {
        this.config = config;
        this.seances = {};
    }
    createSeance({ sessionId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const seanceId = yield this.generateSeanceId();
            const seance = new Seance_1.default({ seanceId, sessionId, app: this.config.app });
            yield seance.init();
            this.seances[seanceId] = {
                createdAt: new Date(),
                seance,
                sessionId,
            };
            return seance;
        });
    }
    resolveSeance({ seanceId }) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.seances[seanceId]
                // &&            this.seances[seanceId].sessionId === sessionId
                ? this.seances[seanceId].seance : null;
        });
    }
    generateSeanceId() {
        return __awaiter(this, void 0, void 0, function* () {
            return uid(20);
        });
    }
}
exports.default = SeancesManager;

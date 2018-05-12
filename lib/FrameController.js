"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class FrameController {
    constructor() {
        this.data$ = new rxjs_1.BehaviorSubject({});
    }
}
exports.default = FrameController;

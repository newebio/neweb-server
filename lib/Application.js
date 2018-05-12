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
const path_1 = require("path");
const with_error_1 = require("with-error");
const BaseRouter_1 = require("./BaseRouter");
const FrameController_1 = require("./FrameController");
const PageTemplate_1 = require("./PageTemplate");
class Application {
    constructor(config) {
        this.config = config;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            //
        });
    }
    getFrameViewClass(frameName) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.requireModule("frames/" + frameName + "/view")) || (() => null);
        });
    }
    getFrameControllerClass(frameName) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.requireModule("frames/" + frameName + "/controller")) || FrameController_1.default;
        });
    }
    createPageTemplate(config) {
        let PageTemplateClass = this.requireModule("Template");
        if (!PageTemplateClass) {
            PageTemplateClass = PageTemplate_1.default;
        }
        const template = new PageTemplateClass(config);
        return template;
    }
    createRouter(params) {
        let RouterClass = this.requireRouter();
        if (!RouterClass) {
            RouterClass = BaseRouter_1.default;
        }
        return new RouterClass(params);
    }
    getContext() {
        if (this.context) {
            return this.context;
        }
        const ContextClass = this.requireModule("Context");
        this.context = ContextClass ? new ContextClass() : {};
        return this.context;
    }
    requireRouter() {
        return this.requireModule("Router");
    }
    requireModule(path) {
        const [modulePath, error] = with_error_1.default(() => require.resolve(path_1.join(this.config.appDir, path)));
        if (error) {
            return null;
        }
        if (this.config.env === "development") {
            delete require.cache[modulePath];
        }
        const moduleExports = require(modulePath);
        return moduleExports.default;
    }
    getFrameViewModulePackInfo(frameName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.config.modulePacker.addLocalPackage(path_1.join(this.config.appDir, "frames", frameName, "view.js"));
        });
    }
}
exports.default = Application;

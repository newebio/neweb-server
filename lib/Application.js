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
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
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
    getEnvironment() {
        return this.config.env;
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
        return __awaiter(this, void 0, void 0, function* () {
            let PageTemplateClass = this.requireModule("Template");
            if (!PageTemplateClass) {
                PageTemplateClass = PageTemplate_1.default;
            }
            if (typeof (this.template) === "undefined") {
                const templatePath = path_1.resolve(path_1.join(this.config.appDir, "template.html"));
                this.template = (yield util_1.promisify(fs_1.exists)(templatePath)) ?
                    (yield util_1.promisify(fs_1.readFile)(templatePath)).toString() : null;
            }
            config.template = this.template;
            const template = new PageTemplateClass(config);
            return template;
        });
    }
    createRouter(params) {
        let RouterClass = this.requireRouter();
        if (!RouterClass) {
            RouterClass = BaseRouter_1.default;
        }
        return new RouterClass(params);
    }
    getContext() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.context) {
                return this.context;
            }
            const ContextClass = this.requireModule("Context");
            this.context = ContextClass ? new ContextClass({
                config: yield this.getConfig(),
            }) : {};
            return this.context;
        });
    }
    getConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof (this.appConfig) !== "undefined") {
                return this.appConfig;
            }
            const ConfigClass = yield this.requireModule("Config." + this.config.env);
            this.appConfig = ConfigClass ? new ConfigClass() : {
                session: {
                    secret: "4i6u4i856i8yni4y4",
                },
            };
            return this.appConfig;
        });
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

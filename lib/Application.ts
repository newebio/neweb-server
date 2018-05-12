import { IPackInfo } from "neweb-core";
import { join } from "path";
import withError from "with-error";
import {
    IApplication, IModulePacker, IPageTemplateClass, IPageTemplateConfig, IRouterClass, IRouterConfig,
} from "../typings";
import BaseRouter from "./BaseRouter";
import FrameController from "./FrameController";
import PageTemplate from "./PageTemplate";

export interface IApplicationConfig {
    appDir: string;
    env: "production" | "development";
    modulePacker: IModulePacker;
}
class Application implements IApplication {
    protected context: any;
    constructor(protected config: IApplicationConfig) { }
    public async init() {
        //
    }
    public async getFrameViewClass(frameName: string) {
        return (await this.requireModule("frames/" + frameName + "/view")) || (() => null);
    }
    public async getFrameControllerClass(frameName: string) {
        return (await this.requireModule("frames/" + frameName + "/controller")) || FrameController;
    }
    public createPageTemplate(config: IPageTemplateConfig) {
        let PageTemplateClass: IPageTemplateClass = this.requireModule("Template");
        if (!PageTemplateClass) {
            PageTemplateClass = PageTemplate;
        }
        const template = new PageTemplateClass(config);
        return template;
    }
    public createRouter(params: IRouterConfig) {
        let RouterClass: IRouterClass = this.requireRouter();
        if (!RouterClass) {
            RouterClass = BaseRouter;
        }
        return new RouterClass(params);
    }
    public getContext() {
        if (this.context) {
            return this.context;
        }
        const ContextClass: any = this.requireModule("Context");
        this.context = ContextClass ? new ContextClass() : {};
        return this.context;
    }
    public requireRouter() {
        return this.requireModule("Router");
    }
    public requireModule(path: string) {

        const [modulePath, error] = withError(() => require.resolve(join(this.config.appDir, path)));
        if (error) {
            return null;
        }
        if (this.config.env === "development") {
            delete require.cache[modulePath];
        }
        const moduleExports = require(modulePath);
        return moduleExports.default;
    }
    public async getFrameViewModulePackInfo(frameName: string): Promise<IPackInfo> {
        return this.config.modulePacker.addLocalPackage(
            join(this.config.appDir, "frames", frameName, "view.js"),
        );
    }
}
export default Application;

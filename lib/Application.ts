import { exists, readFile } from "fs";
import { IPackInfo } from "neweb-core";
import { join, resolve } from "path";
import { promisify } from "util";
import withError from "with-error";
import {
    IApplication, IApplicationConfig, IModulePacker,
    IPageTemplateClass, IPageTemplateConfig, IRouterClass, IRouterConfig,
} from "../typings";
import BaseRouter from "./BaseRouter";
import FrameController from "./FrameController";
import PageTemplate from "./PageTemplate";

export interface IApplicationSettings {
    appDir: string;
    env: "production" | "development";
    modulePacker: IModulePacker;
}
class Application implements IApplication {
    protected context: any;
    protected appConfig: any;
    protected template: null | undefined | string;
    constructor(protected config: IApplicationSettings) { }
    public async init() {
        //
    }
    public async getFrameViewClass(frameName: string) {
        return (await this.requireModule("frames/" + frameName + "/view")) || (() => null);
    }
    public async getFrameControllerClass(frameName: string) {
        return (await this.requireModule("frames/" + frameName + "/controller")) || FrameController;
    }
    public async createPageTemplate(config: IPageTemplateConfig) {
        let PageTemplateClass: IPageTemplateClass = this.requireModule("Template");
        if (!PageTemplateClass) {
            PageTemplateClass = PageTemplate;
        }
        if (typeof (this.template) === "undefined") {
            const templatePath = resolve(join(this.config.appDir, "template.html"));
            this.template = await promisify(exists)(templatePath) ?
                (await promisify(readFile)(templatePath)).toString() : null;
        }
        config.template = this.template;
        const template = new PageTemplateClass(config);
        return template;
    }
    public createRouter(params: IRouterConfig<any, any>) {
        let RouterClass: IRouterClass<any, any> = this.requireRouter();
        if (!RouterClass) {
            RouterClass = BaseRouter;
        }
        return new RouterClass(params);
    }
    public async getContext() {
        if (this.context) {
            return this.context;
        }
        const ContextClass: any = this.requireModule("Context");
        this.context = ContextClass ? new ContextClass({
            config: await this.getConfig(),
        }) : {};
        return this.context;
    }
    public async getConfig(): Promise<IApplicationConfig> {
        if (typeof (this.appConfig) !== "undefined") {
            return this.appConfig;
        }
        const ConfigClass = await this.requireModule("Config." + this.config.env);
        this.appConfig = ConfigClass ? new ConfigClass() : {
            session: {
                secret: "4i6u4i856i8yni4y4",
            },
        };
        return this.appConfig;
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

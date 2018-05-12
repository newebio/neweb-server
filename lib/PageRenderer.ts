import { IPage, IPageFrame, SeansStatusContext, StyledContext } from "neweb-core";
import React = require("react");
// tslint:disable-next-line:no-submodule-imports
import ReactDOMServer = require("react-dom/server");
import { IApplication } from "./../typings";
export interface IServerRendererConfig {
    app: IApplication;
}
class PageRenderer {
    protected styledId = 0;
    constructor(protected config: IServerRendererConfig) {

    }
    public async render(page: IPage) {
        let el: any;
        const frames = [...page.frames];
        for (const pageFrame of frames.reverse()) {
            el = await this.renderFrame(pageFrame, el);
        }
        return ReactDOMServer.renderToString(el);
    }
    protected async renderFrame(frame: IPageFrame, children: any) {
        ++this.styledId;
        const ViewClass = await this.config.app.getFrameViewClass(frame.frameName);
        return React.createElement(StyledContext.Provider, {
            value: this.styledId,
            children: React.createElement(SeansStatusContext.Provider, {
                value: "initializing",
                children: React.createElement(ViewClass, { params: frame.params, data: frame.data, children }),
            }),
        });
    }
}
export default function renderPage(app: IApplication, page: IPage) {
    return new PageRenderer({ app }).render(page);
}

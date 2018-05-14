import { INITIAL_VAR } from "neweb-core";
import { IPageTemplate, IPageTemplateConfig } from "../typings";
const OPEN_TAG = "/*{%";
const CLOSE_TAG = "%}*/";
class PageTemplate implements IPageTemplate {
    protected template = `<!doctype><html>
    <head><title>${OPEN_TAG}title${CLOSE_TAG}</title>${OPEN_TAG}meta${CLOSE_TAG}
    <meta charset="utf8" /></head><body>
    <div id="root">${OPEN_TAG}html${CLOSE_TAG}</div>
    <script>${OPEN_TAG}script${CLOSE_TAG}</script>
    <script async src="/bundle.${OPEN_TAG}env${CLOSE_TAG}.js"></script>
    </body></html>`;
    constructor(protected config: IPageTemplateConfig) {
        if (config.template) {
            this.template = config.template;
        }
    }
    public render() {
        return this.template
            .replace(OPEN_TAG + "html" + CLOSE_TAG, this.config.body)
            .replace(OPEN_TAG + "env" + CLOSE_TAG, this.config.env)
            .replace(OPEN_TAG + "title" + CLOSE_TAG, this.config.title || "")
            .replace(OPEN_TAG + "meta" + CLOSE_TAG, "<!--__page_meta_start__-->" + (this.config.meta
                ? this.config.meta.map((m) =>
                    `<meta name="${m.name}" content="${m.content}" />`).join("") : "") + "<!--__page_meta_end__-->")
            .replace(OPEN_TAG + "script" + CLOSE_TAG,
                `window["${INITIAL_VAR}"]=${JSON.stringify(this.config.initialInfo)}`);
    }
}
export default PageTemplate;

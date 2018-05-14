"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neweb_core_1 = require("neweb-core");
const OPEN_TAG = "/*{%";
const CLOSE_TAG = "%}*/";
class PageTemplate {
    constructor(config) {
        this.config = config;
        this.template = `<!doctype><html>
    <head><title>${OPEN_TAG}title${CLOSE_TAG}</title>${OPEN_TAG}meta${CLOSE_TAG}
    <meta charset="utf8" /></head><body>
    <div id="root">${OPEN_TAG}html${CLOSE_TAG}</div>
    <script>${OPEN_TAG}script${CLOSE_TAG}</script>
    <script async src="/bundle.${OPEN_TAG}env${CLOSE_TAG}.js"></script>
    </body></html>`;
        if (config.template) {
            this.template = config.template;
        }
    }
    render() {
        return this.template
            .replace(OPEN_TAG + "html" + CLOSE_TAG, this.config.body)
            .replace(OPEN_TAG + "env" + CLOSE_TAG, this.config.env)
            .replace(OPEN_TAG + "title" + CLOSE_TAG, this.config.title || "")
            .replace(OPEN_TAG + "meta" + CLOSE_TAG, "<!--__page_meta_start__-->" + (this.config.meta
            ? this.config.meta.map((m) => `<meta name="${m.name}" content="${m.content}" />`).join("") : "") + "<!--__page_meta_end__-->")
            .replace(OPEN_TAG + "script" + CLOSE_TAG, `window["${neweb_core_1.INITIAL_VAR}"]=${JSON.stringify(this.config.initialInfo)}`);
    }
}
exports.default = PageTemplate;

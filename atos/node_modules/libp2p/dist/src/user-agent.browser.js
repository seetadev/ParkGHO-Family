import * as pkg from "./version.js";
export function userAgent(name, version) {
    return `${name ?? pkg.name}/${version ?? pkg.version} browser/${globalThis.navigator.userAgent}`;
}
//# sourceMappingURL=user-agent.browser.js.map
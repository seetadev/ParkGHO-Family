import { Platform } from 'react-native';
import * as pkg from "./version.js";
export function userAgent(name, version) {
    return `${name ?? pkg.name}/${version ?? pkg.version} react-native/${Platform.OS}-${`${Platform.Version}`.replaceAll('v', '')}`;
}
//# sourceMappingURL=user-agent.react-native.js.map
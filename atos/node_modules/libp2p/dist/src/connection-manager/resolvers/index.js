import { RecursionLimitError } from "../../errors.js";
import { MAX_RECURSIVE_DEPTH } from "../constants.defaults.js";
/**
 * Recursively resolve multiaddrs
 */
export async function resolveMultiaddr(address, resolvers, options) {
    const depth = options.depth ?? 0;
    if (depth > (options.maxRecursiveDepth ?? MAX_RECURSIVE_DEPTH)) {
        throw new RecursionLimitError('Max recursive depth reached');
    }
    let resolved = false;
    const output = [];
    for (const resolver of Object.values(resolvers)) {
        if (resolver.canResolve(address)) {
            resolved = true;
            const addresses = await resolver.resolve(address, options);
            for (const address of addresses) {
                output.push(...(await resolveMultiaddr(address, resolvers, {
                    ...options,
                    depth: depth + 1
                })));
            }
        }
    }
    if (resolved === false) {
        output.push(address);
    }
    return output;
}
export { dnsaddrResolver } from "./dnsaddr.js";
//# sourceMappingURL=index.js.map
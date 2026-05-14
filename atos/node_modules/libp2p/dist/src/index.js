/**
 * @packageDocumentation
 *
 * Use the `createLibp2p` function to create a libp2p node.
 *
 * @example
 *
 * ```typescript
 * import { createLibp2p } from 'libp2p'
 *
 * const node = await createLibp2p({
 *   // ...other options
 * })
 * ```
 */
import { generateKeyPair } from '@libp2p/crypto/keys';
import { peerIdFromPrivateKey } from '@libp2p/peer-id';
import { validateConfig } from "./config.js";
import { Libp2p as Libp2pClass } from "./libp2p.js";
export { dnsaddrResolver } from "./connection-manager/resolvers/index.js";
/**
 * Returns a new instance of the Libp2p interface, generating a new PeerId
 * if one is not passed as part of the options.
 *
 * The node will be started unless `start: false` is passed as an option.
 *
 * @example
 *
 * ```TypeScript
 * import { createLibp2p } from 'libp2p'
 * import { tcp } from '@libp2p/tcp'
 * import { mplex } from '@libp2p/mplex'
 * import { noise } from '@chainsafe/libp2p-noise'
 * import { yamux } from '@chainsafe/libp2p-yamux'
 *
 * // specify options
 * const options = {
 *   transports: [tcp()],
 *   streamMuxers: [yamux(), mplex()],
 *   connectionEncrypters: [noise()]
 * }
 *
 * // create libp2p
 * const libp2p = await createLibp2p(options)
 * ```
 */
export async function createLibp2p(options = {}) {
    options.privateKey ??= await generateKeyPair('Ed25519');
    const node = new Libp2pClass({
        ...await validateConfig(options),
        peerId: peerIdFromPrivateKey(options.privateKey)
    });
    if (options.start !== false) {
        await node.start();
    }
    return node;
}
// a non-exhaustive list of methods found on the libp2p object
const LIBP2P_METHODS = ['dial', 'dialProtocol', 'hangUp', 'handle', 'unhandle', 'getMultiaddrs', 'getProtocols'];
/**
 * Returns true if the passed object is a libp2p node - this can be used for
 * type guarding in TypeScript.
 */
export function isLibp2p(obj) {
    if (obj == null) {
        return false;
    }
    if (obj instanceof Libp2pClass) {
        return true;
    }
    // if these are all functions it's probably a libp2p object
    return LIBP2P_METHODS.every(m => typeof obj[m] === 'function');
}
//# sourceMappingURL=index.js.map
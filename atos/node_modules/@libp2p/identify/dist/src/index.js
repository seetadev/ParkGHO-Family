/**
 * @packageDocumentation
 *
 * Use the `identify` function to add support for the [Identify protocol](https://github.com/libp2p/specs/blob/master/identify/README.md) to libp2p.
 *
 * This protocol allows network peers to discover the multiaddrs the current node listens on, and the protocols it supports.
 *
 * A second function, `identifyPush` is also exported to add support for [identify/push](https://github.com/libp2p/specs/blob/master/identify/README.md#identifypush).
 *
 * This protocol will send updates to all connected peers when the multiaddrs or protocols of the current node change.
 *
 * > [!TIP]
 * > For maximum network compatibility you should configure both protocols
 *
 * @example Enabling identify
 *
 * ```typescript
 * import { createLibp2p } from 'libp2p'
 * import { identify } from '@libp2p/identify'
 *
 * const node = await createLibp2p({
 *   // ...other options
 *   services: {
 *     identify: identify()
 *   }
 * })
 * ```
 *
 * @example Enabling identify push
 *
 * ```typescript
 * import { createLibp2p } from 'libp2p'
 * import { identifyPush } from '@libp2p/identify'
 *
 * const node = await createLibp2p({
 *   // ...other options
 *   services: {
 *     identifyPush: identifyPush()
 *   }
 * })
 * ```
 */
import { IdentifyPush as IdentifyPushClass } from "./identify-push.js";
import { Identify as IdentifyClass } from "./identify.js";
export function identify(init = {}) {
    return (components) => new IdentifyClass(components, init);
}
export function identifyPush(init = {}) {
    return (components) => new IdentifyPushClass(components, init);
}
//# sourceMappingURL=index.js.map
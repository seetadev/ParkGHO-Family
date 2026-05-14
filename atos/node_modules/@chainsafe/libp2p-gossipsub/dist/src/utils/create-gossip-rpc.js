/**
 * Create a gossipsub RPC object
 */
export function createGossipRpc(messages = [], control) {
    return {
        subscriptions: [],
        messages,
        control: control !== undefined
            ? {
                graft: control.graft ?? [],
                prune: control.prune ?? [],
                ihave: control.ihave ?? [],
                iwant: control.iwant ?? [],
                idontwant: control.idontwant ?? []
            }
            : undefined
    };
}
export function ensureControl(rpc) {
    if (rpc.control === undefined) {
        rpc.control = {
            graft: [],
            prune: [],
            ihave: [],
            iwant: [],
            idontwant: []
        };
    }
    return rpc;
}
//# sourceMappingURL=create-gossip-rpc.js.map
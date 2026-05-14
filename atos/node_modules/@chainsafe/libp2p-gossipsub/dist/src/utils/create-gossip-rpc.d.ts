import type { RPC } from '../message/rpc.js';
/**
 * Create a gossipsub RPC object
 */
export declare function createGossipRpc(messages?: RPC.Message[], control?: Partial<RPC.ControlMessage>): RPC;
export declare function ensureControl(rpc: RPC): Required<RPC>;
//# sourceMappingURL=create-gossip-rpc.d.ts.map
import type { Startable, Libp2pEvents, ComponentLogger, NodeInfo, ConnectionProtector, ConnectionGater, ContentRouting, Metrics, PeerId, PeerRouting, PeerStore, PrivateKey, Upgrader } from '@libp2p/interface';
import type { AddressManager, ConnectionManager, RandomWalk, Registrar, TransportManager } from '@libp2p/interface-internal';
import type { DNS } from '@multiformats/dns';
import type { Datastore } from 'interface-datastore';
import type { TypedEventTarget } from 'main-event';
export interface Components extends Record<string, any>, Startable {
    peerId: PeerId;
    privateKey: PrivateKey;
    nodeInfo: NodeInfo;
    logger: ComponentLogger;
    events: TypedEventTarget<Libp2pEvents>;
    addressManager: AddressManager;
    peerStore: PeerStore;
    upgrader: Upgrader;
    randomWalk: RandomWalk;
    registrar: Registrar;
    connectionManager: ConnectionManager;
    transportManager: TransportManager;
    connectionGater: ConnectionGater;
    contentRouting: ContentRouting;
    peerRouting: PeerRouting;
    datastore: Datastore;
    connectionProtector?: ConnectionProtector;
    metrics?: Metrics;
    dns?: DNS;
}
export interface ComponentsInit {
    peerId?: PeerId;
    privateKey?: PrivateKey;
    nodeInfo?: NodeInfo;
    logger?: ComponentLogger;
    events?: TypedEventTarget<Libp2pEvents>;
    addressManager?: AddressManager;
    peerStore?: PeerStore;
    upgrader?: Upgrader;
    randomWalk?: RandomWalk;
    metrics?: Metrics;
    registrar?: Registrar;
    connectionManager?: ConnectionManager;
    transportManager?: TransportManager;
    connectionGater?: ConnectionGater;
    contentRouting?: ContentRouting;
    peerRouting?: PeerRouting;
    datastore?: Datastore;
    connectionProtector?: ConnectionProtector;
    dns?: DNS;
}
export declare function defaultComponents(init?: ComponentsInit): Components;
export declare function checkServiceDependencies(components: Components): void;
//# sourceMappingURL=components.d.ts.map
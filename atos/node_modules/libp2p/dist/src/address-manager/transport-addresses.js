import { getNetConfig, isNetworkAddress, isPrivate, trackedMap } from '@libp2p/utils';
export const defaultValues = {
    maxObservedAddresses: 10
};
export class TransportAddresses {
    log;
    addresses;
    maxObservedAddresses;
    constructor(components, init = {}) {
        this.log = components.logger.forComponent('libp2p:address-manager:observed-addresses');
        this.addresses = trackedMap({
            name: 'libp2p_address_manager_transport_addresses',
            metrics: components.metrics
        });
        this.maxObservedAddresses = init.maxObservedAddresses ?? defaultValues.maxObservedAddresses;
    }
    get(multiaddr, ttl) {
        if (isPrivate(multiaddr)) {
            return {
                multiaddr,
                verified: true,
                type: 'transport',
                expires: Date.now() + ttl,
                lastVerified: Date.now()
            };
        }
        const key = this.toKey(multiaddr);
        let metadata = this.addresses.get(key);
        if (metadata == null) {
            metadata = {
                verified: !isNetworkAddress(multiaddr),
                expires: 0
            };
            this.addresses.set(key, metadata);
        }
        return {
            multiaddr,
            verified: metadata.verified,
            type: 'transport',
            expires: metadata.expires,
            lastVerified: metadata.lastVerified
        };
    }
    has(ma) {
        const key = this.toKey(ma);
        return this.addresses.has(key);
    }
    remove(ma) {
        const key = this.toKey(ma);
        const startingConfidence = this.addresses.get(key)?.verified ?? false;
        this.log('removing observed address %a', ma);
        this.addresses.delete(key);
        return startingConfidence;
    }
    confirm(ma, ttl) {
        const key = this.toKey(ma);
        const metadata = this.addresses.get(key) ?? {
            verified: false,
            expires: 0,
            lastVerified: 0
        };
        const startingConfidence = metadata.verified;
        metadata.verified = true;
        metadata.expires = Date.now() + ttl;
        metadata.lastVerified = Date.now();
        this.addresses.set(key, metadata);
        return startingConfidence;
    }
    unconfirm(ma, ttl) {
        const key = this.toKey(ma);
        const metadata = this.addresses.get(key) ?? {
            verified: false,
            expires: 0
        };
        const startingConfidence = metadata.verified;
        metadata.verified = false;
        metadata.expires = Date.now() + ttl;
        this.addresses.set(key, metadata);
        return startingConfidence;
    }
    toKey(ma) {
        if (!isNetworkAddress(ma)) {
            return ma.toString();
        }
        // only works for dns/ip based addresses
        const config = getNetConfig(ma);
        return `${config.host}-${config.port}-${config.protocol}`;
    }
}
//# sourceMappingURL=transport-addresses.js.map
import { isLinkLocal, isPrivate, trackedMap } from '@libp2p/utils';
import { multiaddr } from '@multiformats/multiaddr';
export const defaultValues = {
    maxObservedAddresses: 10
};
export class ObservedAddresses {
    log;
    addresses;
    maxObservedAddresses;
    constructor(components, init = {}) {
        this.log = components.logger.forComponent('libp2p:address-manager:observed-addresses');
        this.addresses = trackedMap({
            name: 'libp2p_address_manager_observed_addresses',
            metrics: components.metrics
        });
        this.maxObservedAddresses = init.maxObservedAddresses ?? defaultValues.maxObservedAddresses;
    }
    has(ma) {
        return this.addresses.has(ma.toString());
    }
    removePrefixed(prefix) {
        for (const key of this.addresses.keys()) {
            if (key.toString().startsWith(prefix)) {
                this.addresses.delete(key);
            }
        }
    }
    add(ma) {
        if (this.addresses.size === this.maxObservedAddresses) {
            return;
        }
        if (isPrivate(ma) || isLinkLocal(ma)) {
            return;
        }
        this.log('adding observed address %a', ma);
        this.addresses.set(ma.toString(), {
            verified: false,
            expires: 0
        });
    }
    getAll() {
        return Array.from(this.addresses)
            .map(([ma, metadata]) => ({
            multiaddr: multiaddr(ma),
            verified: metadata.verified,
            type: 'observed',
            expires: metadata.expires,
            lastVerified: metadata.lastVerified
        }));
    }
    remove(ma) {
        const startingConfidence = this.addresses.get(ma.toString())?.verified ?? false;
        this.log('removing observed address %a', ma);
        this.addresses.delete(ma.toString());
        return startingConfidence;
    }
    confirm(ma, ttl) {
        const addrString = ma.toString();
        const metadata = this.addresses.get(addrString) ?? {
            verified: false,
            expires: Date.now() + ttl,
            lastVerified: Date.now()
        };
        const startingConfidence = metadata.verified;
        metadata.verified = true;
        metadata.expires = Date.now() + ttl;
        metadata.lastVerified = Date.now();
        this.log('marking observed address %a as verified', addrString);
        this.addresses.set(addrString, metadata);
        return startingConfidence;
    }
}
//# sourceMappingURL=observed-addresses.js.map
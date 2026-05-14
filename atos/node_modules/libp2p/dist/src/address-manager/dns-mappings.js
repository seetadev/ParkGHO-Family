import { getNetConfig, isNetworkAddress, isPrivateIp, trackedMap } from '@libp2p/utils';
import { CODE_SNI, CODE_TLS, multiaddr } from '@multiformats/multiaddr';
const MAX_DATE = 8_640_000_000_000_000;
export const defaultValues = {
    maxObservedAddresses: 10
};
export class DNSMappings {
    log;
    mappings;
    constructor(components, init = {}) {
        this.log = components.logger.forComponent('libp2p:address-manager:dns-mappings');
        this.mappings = trackedMap({
            name: 'libp2p_address_manager_dns_mappings',
            metrics: components.metrics
        });
    }
    has(ma) {
        const config = getNetConfig(ma);
        let host = config.host;
        if ((config.type === 'ip4' || config.type === 'ip6') && config.sni != null) {
            host = config.sni;
        }
        for (const mapping of this.mappings.values()) {
            if (mapping.domain === host) {
                return true;
            }
        }
        return false;
    }
    add(domain, addresses) {
        addresses.forEach(ip => {
            this.log('add DNS mapping %s to %s', ip, domain);
            // we are only confident if this is an local domain mapping, otherwise
            // we will require external validation
            const verified = isPrivateIp(ip) === true;
            this.mappings.set(ip, {
                domain,
                verified,
                expires: verified ? MAX_DATE - Date.now() : 0,
                lastVerified: verified ? MAX_DATE - Date.now() : undefined
            });
        });
    }
    remove(ma) {
        const config = getNetConfig(ma);
        if (config.type !== 'ip4' && config.type !== 'ip6') {
            return false;
        }
        let wasConfident = false;
        for (const [ip, mapping] of this.mappings.entries()) {
            if (mapping.domain === config.sni) {
                this.log('removing %s to %s DNS mapping %e', ip, mapping.domain);
                this.mappings.delete(ip);
                wasConfident = wasConfident || mapping.verified;
            }
        }
        return wasConfident;
    }
    getAll(addresses) {
        const dnsMappedAddresses = [];
        for (let i = 0; i < addresses.length; i++) {
            const address = addresses[i].multiaddr;
            if (!isNetworkAddress(address)) {
                continue;
            }
            const config = getNetConfig(address);
            for (const [ip, mapping] of this.mappings.entries()) {
                if (config.host !== ip) {
                    continue;
                }
                // insert SNI tuple after TLS tuple, if one is present
                const maWithSni = this.maybeAddSNIComponent(address, mapping.domain);
                if (maWithSni != null) {
                    // remove the address and replace it with the version that includes
                    // the SNI tuple
                    addresses.splice(i, 1);
                    i--;
                    dnsMappedAddresses.push({
                        multiaddr: maWithSni,
                        verified: mapping.verified,
                        type: 'dns-mapping',
                        expires: mapping.expires,
                        lastVerified: mapping.lastVerified
                    });
                }
            }
        }
        return dnsMappedAddresses;
    }
    maybeAddSNIComponent(ma, domain) {
        const components = ma.getComponents();
        for (let j = 0; j < components.length; j++) {
            if (components[j].code === CODE_TLS && components[j + 1]?.code !== CODE_SNI) {
                components.splice(j + 1, 0, {
                    name: 'sni',
                    code: CODE_SNI,
                    value: domain
                });
                return multiaddr(components);
            }
        }
    }
    confirm(ma, ttl) {
        const config = getNetConfig(ma);
        let host = config.host;
        if ((config.type === 'ip4' || config.type === 'ip6') && config.sni != null) {
            host = config.sni;
        }
        let startingConfidence = false;
        for (const [ip, mapping] of this.mappings.entries()) {
            if (mapping.domain === host) {
                this.log('marking %s to %s DNS mapping as verified', ip, mapping.domain);
                startingConfidence = mapping.verified;
                mapping.verified = true;
                mapping.expires = Date.now() + ttl;
                mapping.lastVerified = Date.now();
            }
        }
        return startingConfidence;
    }
    unconfirm(ma, ttl) {
        const config = getNetConfig(ma);
        if (config.type !== 'ip4' && config.type !== 'ip6') {
            return false;
        }
        const host = config.sni ?? config.host;
        let wasConfident = false;
        for (const [ip, mapping] of this.mappings.entries()) {
            if (mapping.domain === host) {
                this.log('removing verification of %s to %s DNS mapping', ip, mapping.domain);
                wasConfident = wasConfident || mapping.verified;
                mapping.verified = false;
                mapping.expires = Date.now() + ttl;
            }
        }
        return wasConfident;
    }
}
//# sourceMappingURL=dns-mappings.js.map
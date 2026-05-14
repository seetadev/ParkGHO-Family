import { InvalidParametersError } from '@libp2p/interface';
export async function validateConfig(opts) {
    if (opts.connectionProtector === null && globalThis.process?.env?.LIBP2P_FORCE_PNET != null) {
        throw new InvalidParametersError('Private network is enforced, but no protector was provided');
    }
    return opts;
}
//# sourceMappingURL=config.js.map
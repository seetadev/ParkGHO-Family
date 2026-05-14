import { InvalidParametersError } from '@libp2p/interface';
import { INITIAL_STREAM_WINDOW, MAX_STREAM_WINDOW } from './constants.js';
export const defaultConfig = {
    enableKeepAlive: true,
    keepAliveInterval: 30_000,
    maxInboundStreams: 1_000,
    maxOutboundStreams: 1_000,
    maxMessageSize: 64 * 1024,
    maxEarlyStreams: 10,
    streamOptions: {
        initialStreamWindowSize: INITIAL_STREAM_WINDOW,
        maxStreamWindowSize: MAX_STREAM_WINDOW,
        inactivityTimeout: 120_000,
        maxReadBufferLength: 4_194_304,
        maxWriteBufferLength: Infinity
    }
};
export function verifyConfig(config) {
    if (config.keepAliveInterval != null && config.keepAliveInterval <= 0) {
        throw new InvalidParametersError('keep-alive interval must be positive');
    }
    if (config.maxInboundStreams != null && config.maxInboundStreams < 0) {
        throw new InvalidParametersError('max inbound streams must be larger or equal 0');
    }
    if (config.maxOutboundStreams != null && config.maxOutboundStreams < 0) {
        throw new InvalidParametersError('max outbound streams must be larger or equal 0');
    }
    if (config.maxMessageSize != null && config.maxMessageSize < 1024) {
        throw new InvalidParametersError('MaxMessageSize must be greater than a kilobyte');
    }
    if (config.streamOptions?.initialStreamWindowSize != null && config.streamOptions?.initialStreamWindowSize < INITIAL_STREAM_WINDOW) {
        throw new InvalidParametersError('InitialStreamWindowSize must be larger or equal 256 kB');
    }
    if (config.streamOptions?.maxStreamWindowSize != null && config.streamOptions?.initialStreamWindowSize != null && config.streamOptions?.maxStreamWindowSize < config.streamOptions?.initialStreamWindowSize) {
        throw new InvalidParametersError('MaxStreamWindowSize must be larger than the InitialStreamWindowSize');
    }
    if (config.streamOptions?.maxStreamWindowSize != null && config.streamOptions?.maxStreamWindowSize > 2 ** 32 - 1) {
        throw new InvalidParametersError('MaxStreamWindowSize must be less than equal MAX_UINT32');
    }
}
//# sourceMappingURL=config.js.map
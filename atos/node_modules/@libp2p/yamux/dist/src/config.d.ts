import type { StreamMuxerOptions, StreamOptions } from '@libp2p/interface';
export interface YamuxStreamOptions extends StreamOptions {
    /**
     * Used to control the initial window size that we allow for a stream.
     *
     * measured in bytes
     */
    initialStreamWindowSize?: number;
    /**
     * Used to control the maximum window size that we allow for a stream.
     */
    maxStreamWindowSize?: number;
}
export interface Config extends StreamMuxerOptions<YamuxStreamOptions> {
    /**
     * Used to do periodic keep alive messages using a ping
     */
    enableKeepAlive?: boolean;
    /**
     * How often to perform the keep alive
     *
     * measured in milliseconds
     */
    keepAliveInterval?: number;
}
export declare const defaultConfig: Required<Config> & {
    streamOptions: Required<YamuxStreamOptions>;
};
export declare function verifyConfig(config: Config): void;
//# sourceMappingURL=config.d.ts.map
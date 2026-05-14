import { decodeMessage, encodeMessage, MaxLengthError, message, streamMessage } from 'protons-runtime';
export var Identify;
(function (Identify) {
    let _codec;
    Identify.codec = () => {
        if (_codec == null) {
            _codec = message((obj, w, opts = {}) => {
                if (opts.lengthDelimited !== false) {
                    w.fork();
                }
                if (obj.protocolVersion != null) {
                    w.uint32(42);
                    w.string(obj.protocolVersion);
                }
                if (obj.agentVersion != null) {
                    w.uint32(50);
                    w.string(obj.agentVersion);
                }
                if (obj.publicKey != null) {
                    w.uint32(10);
                    w.bytes(obj.publicKey);
                }
                if (obj.listenAddrs != null && obj.listenAddrs.length > 0) {
                    for (const value of obj.listenAddrs) {
                        w.uint32(18);
                        w.bytes(value);
                    }
                }
                if (obj.observedAddr != null) {
                    w.uint32(34);
                    w.bytes(obj.observedAddr);
                }
                if (obj.protocols != null && obj.protocols.length > 0) {
                    for (const value of obj.protocols) {
                        w.uint32(26);
                        w.string(value);
                    }
                }
                if (obj.signedPeerRecord != null) {
                    w.uint32(66);
                    w.bytes(obj.signedPeerRecord);
                }
                if (opts.lengthDelimited !== false) {
                    w.ldelim();
                }
            }, (reader, length, opts = {}) => {
                const obj = {
                    listenAddrs: [],
                    protocols: []
                };
                const end = length == null ? reader.len : reader.pos + length;
                while (reader.pos < end) {
                    const tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 5: {
                            obj.protocolVersion = reader.string();
                            break;
                        }
                        case 6: {
                            obj.agentVersion = reader.string();
                            break;
                        }
                        case 1: {
                            obj.publicKey = reader.bytes();
                            break;
                        }
                        case 2: {
                            if (opts.limits?.listenAddrs != null && obj.listenAddrs.length === opts.limits.listenAddrs) {
                                throw new MaxLengthError('Decode error - repeated field "listenAddrs" had too many elements');
                            }
                            obj.listenAddrs.push(reader.bytes());
                            break;
                        }
                        case 4: {
                            obj.observedAddr = reader.bytes();
                            break;
                        }
                        case 3: {
                            if (opts.limits?.protocols != null && obj.protocols.length === opts.limits.protocols) {
                                throw new MaxLengthError('Decode error - repeated field "protocols" had too many elements');
                            }
                            obj.protocols.push(reader.string());
                            break;
                        }
                        case 8: {
                            obj.signedPeerRecord = reader.bytes();
                            break;
                        }
                        default: {
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                }
                return obj;
            }, function* (reader, length, prefix, opts = {}) {
                const obj = {
                    listenAddrs: 0,
                    protocols: 0
                };
                const end = length == null ? reader.len : reader.pos + length;
                while (reader.pos < end) {
                    const tag = reader.uint32();
                    switch (tag >>> 3) {
                        case 5: {
                            yield {
                                field: `${prefix}.protocolVersion`,
                                value: reader.string()
                            };
                            break;
                        }
                        case 6: {
                            yield {
                                field: `${prefix}.agentVersion`,
                                value: reader.string()
                            };
                            break;
                        }
                        case 1: {
                            yield {
                                field: `${prefix}.publicKey`,
                                value: reader.bytes()
                            };
                            break;
                        }
                        case 2: {
                            if (opts.limits?.listenAddrs != null && obj.listenAddrs === opts.limits.listenAddrs) {
                                throw new MaxLengthError('Streaming decode error - repeated field "listenAddrs" had too many elements');
                            }
                            yield {
                                field: `${prefix}.listenAddrs[]`,
                                index: obj.listenAddrs,
                                value: reader.bytes()
                            };
                            obj.listenAddrs++;
                            break;
                        }
                        case 4: {
                            yield {
                                field: `${prefix}.observedAddr`,
                                value: reader.bytes()
                            };
                            break;
                        }
                        case 3: {
                            if (opts.limits?.protocols != null && obj.protocols === opts.limits.protocols) {
                                throw new MaxLengthError('Streaming decode error - repeated field "protocols" had too many elements');
                            }
                            yield {
                                field: `${prefix}.protocols[]`,
                                index: obj.protocols,
                                value: reader.string()
                            };
                            obj.protocols++;
                            break;
                        }
                        case 8: {
                            yield {
                                field: `${prefix}.signedPeerRecord`,
                                value: reader.bytes()
                            };
                            break;
                        }
                        default: {
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                }
            });
        }
        return _codec;
    };
    function encode(obj) {
        return encodeMessage(obj, Identify.codec());
    }
    Identify.encode = encode;
    function decode(buf, opts) {
        return decodeMessage(buf, Identify.codec(), opts);
    }
    Identify.decode = decode;
    function stream(buf, opts) {
        return streamMessage(buf, Identify.codec(), opts);
    }
    Identify.stream = stream;
})(Identify || (Identify = {}));
//# sourceMappingURL=message.js.map
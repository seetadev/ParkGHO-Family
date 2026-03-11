import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import { createSiweMessageWithRecaps, generateAuthSig, LitAbility, LitAccessControlConditionResource } from "@lit-protocol/auth-helpers";
import { useWalletClient } from 'wagmi';
import { useState } from 'react';

interface LitProtocolManagerProps {
    fileURI: string;
    uploadHash: string;
}

function LitProtocolManager({ fileURI, uploadHash }: LitProtocolManagerProps) {
    const { data: walletClient } = useWalletClient(); 
    const [ciphertext, setCiphertext] = useState('');
    const [dataToEncryptHash, setDataToEncryptHash] = useState('');
    const [decryptedResult, setDecryptedResult] = useState('');
    const [litNodeClient, setLitNodeClient] = useState<any>(null);
    const [sessionSigs, setSessionSigs] = useState<any>(null);
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);

    const accessControlConditions = [
        {
            contractAddress: "",
            standardContractType: "",
            chain: "sepolia",
            method: "eth_getBalance",
            parameters: [":userAddress", "latest"],
            returnValueTest: {
                comparator: ">=",
                value: "1000000000000",
            },
        },
    ];

    function useEthersSigner(): (() => Promise<ethers.JsonRpcSigner | undefined>) {
        return async () => {
            if (!walletClient) return undefined;
            const provider = new ethers.BrowserProvider(walletClient.transport as any);
            return await provider.getSigner();
        };
    }

    const handleEncrypt = async () => {
        if (!uploadHash || !fileURI) return;
        
        setIsEncrypting(true);
        
        try {
            class Lit {
                litNodeClient: any;
                chain;

                constructor(chain: any) {
                    this.chain = chain;
                }

                async connect() {
                    this.litNodeClient = new LitJsSdk.LitNodeClient({
                        litNetwork: "datil-dev",
                    });
                    await this.litNodeClient.connect();
                }

                async encrypt(message: string) {
                    const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
                        {
                            //@ts-ignore
                            accessControlConditions,
                            dataToEncrypt: message,
                        },
                        this.litNodeClient,
                    );

                    return {
                        ciphertext,
                        dataToEncryptHash,
                    };
                }
            }

            const chain = "sepolia";
            let myLit = new Lit(chain);
            await myLit.connect();
            console.log("connected successfully");

            const { ciphertext: cipher, dataToEncryptHash: hash } = await myLit.encrypt(fileURI);
            
            console.log("ciphertext", cipher);
            console.log("dataToEncryptHash", hash);
            
            setCiphertext(cipher);
            setDataToEncryptHash(hash);
            setLitNodeClient(myLit.litNodeClient);

            // Prepare session signatures for later decryption
            const getSigner = useEthersSigner();
            const signer = await getSigner();
            if (!signer) {
                console.error("No signer found");
                return;
            }

            const address = await signer.getAddress();
            console.log("Connected address:", address);

            const accsResourceString = await LitAccessControlConditionResource.generateResourceString(
                //@ts-ignore
                accessControlConditions,
                hash
            );
            console.log("accsResourceString: ", accsResourceString);

            const sessionSigs = await myLit.litNodeClient.getSessionSigs({
                chain: "sepolia",
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
                resourceAbilityRequests: [
                    {
                        resource: new LitAccessControlConditionResource(accsResourceString),
                        ability: LitAbility.AccessControlConditionDecryption,
                    },
                ],
                //@ts-ignore
                authNeededCallback: async ({ resourceAbilityRequests, expiration, uri }) => {
                    const toSign = await createSiweMessageWithRecaps({
                        //@ts-ignore
                        uri,
                        //@ts-ignore
                        expiration,
                        //@ts-ignore
                        resources: resourceAbilityRequests,
                        walletAddress: address,
                        nonce: await myLit.litNodeClient.getLatestBlockhash(),
                        litNodeClient: myLit.litNodeClient,
                    });

                    return await generateAuthSig({
                        signer,
                        toSign,
                    });
                },
            });
            
            console.log("sessionSigs", sessionSigs);
            setSessionSigs(sessionSigs);
            
        } catch (error) {
            console.error("Encryption error:", error);
        } finally {
            setIsEncrypting(false);
        }
    };

    const handleDecrypt = async () => {
        if (!ciphertext || !dataToEncryptHash || !sessionSigs || !litNodeClient) return;
        
        setIsDecrypting(true);
        
        try {
            const decryptRes = await LitJsSdk.decryptToString(
                {
                    //@ts-ignore
                    accessControlConditions,
                    ciphertext,
                    dataToEncryptHash,
                    sessionSigs,
                    chain: "sepolia",
                },
                litNodeClient
            );

            console.log("decryptRes:", decryptRes);
            setDecryptedResult(decryptRes);

            await litNodeClient.disconnect();
            console.log("disconnected");
            
        } catch (error) {
            console.error("Decryption error:", error);
        } finally {
            setIsDecrypting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Encrypt Button */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-medium mb-2">Encrypt Data</h3>
                        <p className="text-gray-400 text-sm mb-4">Secure with Lit Protocol encryption</p>
                    </div>

                    <button
                        onClick={handleEncrypt}
                        disabled={!uploadHash || !fileURI || isEncrypting}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                            !uploadHash || !fileURI || isEncrypting
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-purple-500 hover:bg-purple-600 text-white transform hover:scale-105'
                        }`}
                    >
                        {isEncrypting ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Encrypting...
                            </div>
                        ) : (
                            'Encrypt Data'
                        )}
                    </button>

                    {ciphertext && (
                        <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <p className="text-purple-400 text-xs font-medium mb-1">🔐 Encryption Complete!</p>
                            <p className="text-gray-300 text-xs">Session signatures ready</p>
                        </div>
                    )}
                </div>

                {/* Decrypt Button */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl mx-auto mb-3 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-medium mb-2">Decrypt & Verify</h3>
                        <p className="text-gray-400 text-sm mb-4">Unlock and verify your encrypted data</p>
                    </div>

                    <button
                        onClick={handleDecrypt}
                        disabled={!ciphertext || !sessionSigs || isDecrypting}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                            !ciphertext || !sessionSigs || isDecrypting
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                        }`}
                    >
                        {isDecrypting ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Decrypting...
                            </div>
                        ) : (
                            'Decrypt Data'
                        )}
                    </button>

                    {decryptedResult && (
                        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-green-400 text-xs font-medium mb-1">✅ Decryption Success!</p>
                            <p className="text-gray-300 text-xs">Data verified and unlocked</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Display */}
            {decryptedResult && (
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-green-400 font-medium mb-3 flex items-center text-lg">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Decrypted Result
                    </h3>
                    <div className="bg-black/30 rounded-xl p-4 border border-green-500/10">
                        <p className="text-white font-mono text-sm leading-relaxed">
                            {decryptedResult}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LitProtocolManager;
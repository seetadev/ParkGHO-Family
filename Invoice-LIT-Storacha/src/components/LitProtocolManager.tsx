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
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            {/* Encrypt Section */}
            <div className="mb-8">
                <div className="bg-slate-50 rounded-md p-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Encrypt Data</h3>
                    <p className="text-sm text-slate-600">Secure your file with Lit Protocol encryption</p>
                </div>
                
                <button 
                    onClick={handleEncrypt} 
                    disabled={!uploadHash || !fileURI || isEncrypting}
                    className={`w-full py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                        !uploadHash || !fileURI || isEncrypting
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-sm'
                    }`}
                >
                    {isEncrypting ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Encrypting...
                        </div>
                    ) : (
                        'Encrypt Data'
                    )}
                </button>
                
                {ciphertext && (
                    <div className="mt-4 bg-purple-50 border border-purple-200 rounded-md p-4">
                        <div className="flex items-center mb-2">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <p className="ml-2 text-sm font-medium text-purple-800">Encryption Complete!</p>
                        </div>
                        <p className="text-sm text-purple-700">Session signatures ready for decryption</p>
                    </div>
                )}
            </div>

            {/* Decrypt Section */}
            <div className="mb-8">
                <div className="bg-slate-50 rounded-md p-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Decrypt & Verify</h3>
                    <p className="text-sm text-slate-600">Unlock and verify your encrypted data</p>
                </div>
                
                <button 
                    onClick={handleDecrypt} 
                    disabled={!ciphertext || !sessionSigs || isDecrypting}
                    className={`w-full py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                        !ciphertext || !sessionSigs || isDecrypting
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm'
                    }`}
                >
                    {isDecrypting ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Decrypting...
                        </div>
                    ) : (
                        'Decrypt Data'
                    )}
                </button>
                
                {decryptedResult && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex items-center mb-2">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="ml-2 text-sm font-medium text-green-800">Decryption Success!</p>
                        </div>
                        <p className="text-sm text-green-700">Data verified and unlocked</p>
                    </div>
                )}
            </div>

            {/* Decrypted Result */}
            {decryptedResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Decrypted Result</h3>
                    <div className="bg-white border border-slate-200 rounded-md p-3">
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap break-all font-mono">
                            {decryptedResult}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LitProtocolManager;
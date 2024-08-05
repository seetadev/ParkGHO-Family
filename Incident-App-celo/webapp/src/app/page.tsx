"use client";
import "./style.css"
import React, { useState, useEffect } from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
  ConnectButton,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  useAccount,
  configureChains,
  createConfig,
  WagmiConfig,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useContractEvent,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import "bootstrap/dist/css/bootstrap.min.css";
import "@rainbow-me/rainbowkit/styles.css";
import { stakingTNT20ABI } from "../ABI";
import {Table}  from 'antd'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { celoAlfajores } from "viem/chains";
// const TNT20_CONTRACT = '0x644B6533038DA0Ee6c330f51A16940139bbbE50B'
const TNT20_CONTRACT = "0xdCe351026f5F639BaEe313acdEBcd05044aAFF87";
const TNT721_CONTRACT = "0x045eE648e4BBAb1b1bcBe95B60e76C9A8143488f";
const projectID = "73bfede1812912189a63f8b354eac692";
const tokenSymbol = "RWD";

const theta = {
  id: 365,
  name: "Theta Testnet",
  network: "theta",
  nativeCurrency: {
    decimals: 18,
    name: "TFUEL",
    symbol: "TFUEL",
  },
  rpcUrls: {
    public: { http: ["https://eth-rpc-api-testnet.thetatoken.org/rpc"] },
    default: { http: ["https://eth-rpc-api-testnet.thetatoken.org/rpc"] },
  },
  blockExplorers: {
    etherscan: {
      name: "Theta Explorer",
      url: ": https://testnet-explorer.thetatoken.org/",
    },
    default: {
      name: "Theta Explorer",
      url: ": https://testnet-explorer.thetatoken.org/",
    },
  },
};


const { chains, publicClient } = configureChains([celoAlfajores], [publicProvider()]);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ projectId: projectID, chains }),
      injectedWallet({ chains }),
      walletConnectWallet({ projectId: projectID, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const contractConfigTNT20 = {
  address: TNT20_CONTRACT,
  abi: stakingTNT20ABI,
};

// Shows NFTs that are in the Users Wallet
function UserNFT(token: { id: number; uri: string; img: string }) {
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // const { refetch: fetchIsApproved } = useContractRead({
  //   address: TNT721_CONTRACT,
  //   abi: tnt721ABI,
  //   functionName: 'getApproved',
  //   args: [token.id],
  //   enabled: false,
  //   onSuccess(data) {
  //     if(data == TNT20_CONTRACT) {
  //       setIsApproved(true);
  //       setIsLoading(false);
  //     } else {
  //       writeApprove?.()
  //     }
  //   },
  //   // watch: true,
  // })

  const { data } = useContractRead({
    address: TNT20_CONTRACT,
    abi: stakingTNT20ABI,
    functionName: "getAllIncidents"
  })

  console.log(data);

  const { config: stakeConfig } = usePrepareContractWrite({
    address: TNT20_CONTRACT,
    abi: stakingTNT20ABI,
    functionName: "stake",
    args: [token.id],
    enabled: false,
  });

  // const {  write: writeApprove, isError: approveError } = useContractWrite(approveConfig);
  const { write: writeStake, isError: stakeError } =
    useContractWrite(stakeConfig);

  // useEffect(() => {
  //   if(approveError) setIsLoading(false);
  //   if(stakeError) setIsLoading(false);
  // }, [approveError, stakeError])

  return (
    <div
      style={{
        height: "50px",
        background: "#d2d2d2",
        borderRadius: "10px",
        width: "95%",
        marginBottom: "5px",
        minWidth: "350px",
      }}
    >
      <div
        className="row row-cols-3 justify-content-between"
        style={{ height: "50px" }}
      >
        <div className="col-xl-1" style={{ width: "50px" }}>
          <img
            src={token.img}
            style={{
              width: "40px",
              height: "40px",
              margin: "5px",
              borderRadius: "5px",
            }}
            alt="NFT"
          />
        </div>
        <div className="col-xl-6">
          <div
            className="d-flex justify-content-start align-items-center"
            style={{ height: "50px" }}
          >
            <p className="text-center" style={{ marginBottom: "0px" }}>
              {token.id}
            </p>
          </div>
        </div>
        <div className="col">
          <div
            className="d-flex justify-content-end align-items-center"
            style={{ height: "50px" }}
          >
            {isLoading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "50px", marginRight: "30px" }}
              >
                <div className="spinner-border" role="status">
                  <span className="sr-only"></span>
                </div>
              </div>
            ) : isApproved ? (
              <div
                className="d-flex align-items-center"
                style={{ height: "50px", marginRight: "5px" }}
              >
                <button
                  className="btn btn-secondary"
                  type="button"
                  style={{ marginRight: "10px" }}
                  onClick={() => {
                    setIsLoading(true);
                    writeStake?.();
                  }}
                >
                  Stake
                </button>
              </div>
            ) : (
              <div
                className="d-flex align-items-center"
                style={{ height: "50px", marginRight: "5px" }}
              >
                <button
                  className="btn btn-secondary"
                  type="button"
                  style={{ marginRight: "0px" }}
                  onClick={() => {
                    setIsLoading(true);
                    // writeApprove?.();
                    // fetchIsApproved?.()
                  }}
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserStakedNFT(token: { id: number; uri: string; img: string }) {
  const [tokenReward, setTokenReward] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // console.log("Setup Staked NFT", token.id)
  const { refetch: calculateRewards } = useContractRead({
    address: TNT20_CONTRACT,
    abi: stakingTNT20ABI,
    functionName: "calculateRewards",
    args: [token.id],
    enabled: false,
    onSuccess(data) {
      setTokenReward(
        Number(
          (data ? BigInt(data.toString()) : BigInt("0")) /
          BigInt("10000000000000000")
        ) / 100
      );
    },
  });

  useEffect(() => {
    calculateRewards().catch(() => {
      console.log("Error calculating Reward");
    });
  }, []);

  useContractEvent({
    address: TNT20_CONTRACT,
    abi: stakingTNT20ABI,
    eventName: "ClaimedReward",
    listener(log) {
      // console.log(log)
      // @ts-ignore
      if (Number(log[0].topics[1]) == token.id) {
        // console.log("Event ClaimedReward")
        setIsLoading(false);
        setTokenReward(0);
      }
    },
  });

  const { config: claimConfig } = usePrepareContractWrite({
    address: TNT20_CONTRACT,
    abi: stakingTNT20ABI,
    functionName: "claimRewards",
    args: [token.id],
    enabled: false,
  });

  const { config: unstakeConfig } = usePrepareContractWrite({
    address: TNT20_CONTRACT,
    abi: stakingTNT20ABI,
    functionName: "unstake",
    args: [token.id],
    enabled: false,
  });

  const { write: writeClaim, isError: claimError } =
    useContractWrite(claimConfig);
  const { write: writeUnstake, isError: unstakeError } =
    useContractWrite(unstakeConfig);

  useEffect(() => {
    if (claimError) setIsLoading(false);
    if (unstakeError) setIsLoading(false);
  }, [claimError, unstakeError]);

  return (
    <div
      style={{
        height: "50px",
        background: "#d2d2d2",
        borderRadius: "10px",
        width: "95%",
        marginBottom: "5px",
        minWidth: "350px",
      }}
    >
      <div
        className="row gx-0 row-cols-4 justify-content-between"
        style={{ height: "50px" }}
      >
        <div className="col-xl-1" style={{ width: "50px" }}>
          <img
            src={token.img}
            style={{
              width: "40px",
              height: "40px",
              margin: "5px",
              borderRadius: "5px",
            }}
            alt="NFT"
          />
        </div>
        <div className="col-1 col-xl-2">
          <div
            className="d-flex float-start justify-content-start align-items-center"
            style={{ height: "50px" }}
          >
            <p className="text-center" style={{ marginBottom: "0px" }}>
              {token.id}
            </p>
          </div>
        </div>
        <div className="col-xl-3">
          <div
            className="d-flex justify-content-start align-items-center"
            style={{ height: "50px" }}
          >
            <p className="text-center" style={{ marginBottom: "0px" }}>
              {tokenReward} {tokenSymbol}
            </p>
          </div>
        </div>
        <div className="col order-last" style={{ minWidth: "160px" }}>
          {isLoading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "50px", minWidth: "150px", marginRight: "10px" }}
            >
              <div className="spinner-border" role="status">
                <span className="sr-only"></span>
              </div>
            </div>
          ) : (
            <div
              className="d-flex justify-content-around align-items-center"
              style={{ height: "50px", minWidth: "150px", marginRight: "10px" }}
            >
              <button
                className="btn btn-secondary"
                type="button"
                style={{ marginRight: "2px" }}
                onClick={() => {
                  setIsLoading(true);
                  writeClaim?.();
                }}
              >
                Claim
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                style={{ marginLeft: "2px" }}
                onClick={() => {
                  setIsLoading(true);
                  writeUnstake?.();
                }}
              >
                Unstake
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserData({ address }: { address: string }) {
  const [myNFTs, setMyNFTs] = useState(0);

  // const { data, refetch } = useContractReads({
  //   contracts: [
  //     // @ts-ignore
  //     {
  //       ...contractConfigTNT20,
  //       functionName: 'stakedBalanceOf',
  //       args: [address],
  //     },
  //     // @ts-ignore
  //     {
  //       ...contractConfigTNT721,
  //       functionName: 'balanceOf',
  //       args: [address],
  //     },
  //   ],
  //   onSuccess(data) {
  //     // console.log(data)
  //     setMyNFTs(parseInt(`${data ? data[0].result : 0}`));
  //   }
  //   // watch: true,
  // })

  // useContractEvent({
  //   address: TNT20_CONTRACT,
  //   abi: stakingTNT20ABI,
  //   eventName: 'StakedNFT',
  //   listener() {
  //     refetch().catch(() => {console.log("Error refreshing balance data")})
  //   },
  // })

  // useContractEvent({
  //   address: TNT20_CONTRACT,
  //   abi: stakingTNT20ABI,
  //   eventName: 'UnStakedNFT',
  //   listener() {
  //     refetch().catch(() => {console.log("Error refreshing balance data")})
  //   },
  // })

  return (
    <>
      <h6
        className="text-center"
        style={{ paddingBottom: "10px", color: "gray" }}
      >
        My number of NFTs staked: {myNFTs}
      </h6>
      <div style={{ background: "#626262", height: "1px" }}></div>
      <div className="container">
        <div className="row" style={{ paddingBottom: "10px" }}>
          {/* {address && <StakedNFTs amount={Number(data && data[0].result ? Number(data[0].result) : 0)} address={address}></StakedNFTs>} */}
          {/* {address && <WalletNFTs amount={Number(data && data[1].result ? Number(data[1].result) : 0)} address={address}></WalletNFTs>} */}
        </div>
      </div>
    </>
  );
}

// function WalletNFTs({ amount, address }: { amount: number, address: string }) {
//   const [myTokensData, setMyTokensData] = useState<{ id: number; uri: string; img: string; }[]>([]);

//   useEffect(() => {
//     setMyTokensData([]);
//   }, [])

//   let contracts = [];
//   for(let i = 0; i<amount; i++) {
//     contracts.push({
//       ...contractConfigTNT721,
//       functionName: 'tokenOfOwnerByIndex',
//       args: [address, i],
//     })
//   }

//   const { data: tokenIds } = useContractReads({
//     // @ts-ignore
//     contracts: contracts,
//   });

//   contracts = [];
//   if(tokenIds) {
//     for(let i = 0; i<tokenIds?.length; i++) {
//       contracts.push({
//         ...contractConfigTNT721,
//         functionName: 'tokenURI',
//         args: [tokenIds[i].result],
//       })
//     }
//   }

//   const { data: tokenURIs } = useContractReads({
//     // @ts-ignore
//     contracts: contracts,
//   })

//   let tokens: {id: number, uri: string, img: string}[] = [];
//   if(tokenURIs && tokenIds) {
//     for(let i = 0; i<tokenURIs?.length; i++) {
//       tokens.push({
//         id: Number(tokenIds[i].result),
//         uri: tokenURIs[i].result as string,
//         img: '',
//       })
//     }
//   }
//   const fetchTokens = async () => {
//     try {
//       const updatedTokens = await Promise.all(
//           tokens.map(async (token) => {
//             const uriResponse = await fetch(token.uri);
//             const uriData = await uriResponse.json();
//             const imageUrl = uriData.image;
//             return {
//               id: token.id,
//               uri: token.uri,
//               img: imageUrl,
//             };
//           })
//       );
//       setMyTokensData(updatedTokens);
//     } catch (error) {
//       console.error('Error fetching tokens:', error);
//     }
//   };

//   useEffect(() => {
//     fetchTokens().catch(() => {console.log("Error fetching token data")});
//   }, [amount])

//   return (
//     <div className="col-md-6">
//       <h3 style={{ paddingLeft: '0px', paddingTop: '20px' }}>NFTs in your Wallet:</h3>
//       {myTokensData.map((token: {id: number, uri: string, img: string}) => (
//           <UserNFT key={token.id} id={token.id} uri={token.uri} img={token.img} />
//       ))}
//     </div>
//   );
// }

// function StakedNFTs({ amount, address }: { amount: number, address: string }) {
//   const [userStakedTokensData, setUserStakedTokensData] = useState<{ id: number; uri: string; img: string; }[]>([]);

//   useEffect(() => {
//     setUserStakedTokensData([]);
//   }, [])

//   let contracts = [];
//   for(let i = 0; i<amount; i++) {
//     contracts.push({
//       ...contractConfigTNT20,
//       functionName: 'stakedTokenOfOwnerByIndex',
//       args: [address, i],
//     })
//   }

//   const { data: stakedTokenIds } = useContractReads({
//     // @ts-ignore
//     contracts: contracts,
//   })

//   contracts = [];
//   if(stakedTokenIds) {
//     for(let i = 0; i<stakedTokenIds?.length; i++) {
//       contracts.push({
//         ...contractConfigTNT721,
//         functionName: 'tokenURI',
//         args: [stakedTokenIds[i]?.result],
//       })
//     }
//   }

//   const { data: stakedTokenURIs  } = useContractReads({
//     // @ts-ignore
//     contracts: contracts,
//   })

//   let stakedTokens: {id: number, uri: string, img: string}[] = [];
//   if(stakedTokenURIs && stakedTokenIds) {
//     for(let i = 0; i<(stakedTokenURIs ? stakedTokenURIs : []).length; i++) {
//       stakedTokens.push({
//         id: Number(stakedTokenIds[i]?.result),
//         uri: stakedTokenURIs[i]?.result as string,
//         img: '',
//       })
//     }
//   }

//   const fetchStakedTokens = async () => {
//     try {
//       const updatedTokens: {
//         id: number,
//         uri: string,
//         img: string,
//       }[] = await Promise.all(
//           stakedTokens.map(async (token) => {
//             const uriResponse = await fetch(token.uri);
//             const uriData = await uriResponse.json();
//             const imageUrl = uriData.image;
//             return {
//               id: token.id,
//               uri: token.uri,
//               img: imageUrl,
//             };
//           })
//       );
//       setUserStakedTokensData(updatedTokens);
//     } catch (error) {
//       console.error('Error fetching tokens:', error);
//     }
//   };

//   useEffect(() => {
//     fetchStakedTokens();
//   }, [amount])

//   return (
//     <div className="col-md-6">
//       <h3 style={{ paddingLeft: '0px', paddingTop: '20px' }}>Your Staked NFTs:</h3>
//       {userStakedTokensData.map((token: {id: number, uri: string, img: string}) => (
//           <UserStakedNFT key={token.id} id={token.id} uri={token.uri} img={token.img} />
//       ))}
//     </div>
//   );
// }

function YourApp() {
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [connected, setConnected] = useState(false);
  const { address } = useAccount();
  const [allTokens, setAllTokens] = useState(0);

  // const { data, refetch } = useContractReads({
  //   contracts: [
  //     // @ts-ignore
  //     {
  //       ...contractConfigTNT20,
  //       functionName: 'totalSupply',
  //     },
  //     // @ts-ignore
  //     {
  //       ...contractConfigTNT20,
  //       functionName: 'totalNFTsStaked',
  //     },
  //   ],
  //   watch: true,
  // })

  const { data } = useContractRead({
    address: "0xf43A836Fc651972Db751Eb033D5B78D37718ad72",
    abi: stakingTNT20ABI,
    functionName: "getIncident",
    args: [0],
  });

  const [text, setText] = useState("");

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const {
    data: itsData,
    isLoading,
    isSuccess,
    write,
  } = useContractWrite({
    // @ts-ignore
    address: "0xf43A836Fc651972Db751Eb033D5B78D37718ad72",
    // @ts-ignore
    abi: stakingTNT20ABI,
    // @ts-ignore
    functionName: "reportIncident",
    // @ts-ignore
    args: [text],
  });

  // useEffect(() => {
  //   if(data) {
  //     setAllTokens(Number((data[0].result ? BigInt(data[0].result.toString()) : BigInt('0')) / BigInt('10000000000000000'))/100)
  //     setTotalNFTs(Number(data[1].result ? BigInt(data[1].result.toString()) : BigInt('0')))
  //   }
  // }, [data]);

  // useEffect(() => {
  //   if(address) {
  //     setConnected(true)
  //     refetch()
  //   } else {
  //     setConnected(false)
  //   }
  // }, [address]);

  console.log("this is data", data);
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Reported By',
      dataIndex: 'reportedBy',
      key: 'reportedBy',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => formatDate(text),
    },
  ];


  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light justify-content-between">
        <a className="navbar-brand" href="#" style={{ paddingLeft: "10px" }}>
          Decireport
        </a>
        <div style={{ paddingRight: "10px" }}>
          <ConnectButton />
        </div>
      </nav>
      <section style={{ width: "100%", height: "100vh" }}>
        <div style={{ background: "#626262", height: "1px" }}></div>
        <h1 className="text-center" style={{ paddingTop: "20px" }}>
          Report Your Incident Application
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <label htmlFor="textInput">Enter your Report Here:</label>
            <textarea
            className="border-2 border-black"
              id="textInput"
              value={text}
              onChange={handleChange}
              rows={10}
              cols={50}
            />
            <br />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "30px" }}>
            <button
              style={{ width: "100px" }}
              onClick={() => write()}
              type="submit"
              className="bg-gray-300 p-2 rounded-lg"
            >
              Submit
            </button>
          </div>
        </div>
      </section>

      <div>
        {/* <Table columns={columns} dataSource={data} rowKey="id" /> */}
      </div>
    </div>
  );
}

function Home() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} initialChain={361}>
        <YourApp />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default Home;

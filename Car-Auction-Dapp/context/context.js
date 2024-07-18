import { createContext, useState, useEffect, useContext, useMemo } from "react";
import { BN } from "@project-serum/anchor";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

import {
  getLotteryAddress,
  getMasterAddress,
  getProgram,
  getTicketAddress,
  getTotalPrize,
} from "../utils/program";
import { confirmTx, mockWallet } from "../utils/helper";
import toast from 'react-hot-toast';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [masterAddress, setMasterAddress] = useState();
  const [lotteryAddress, setLotteryAddress] = useState();
  const [lottery, setLottery] = useState();
  const [lotteryPot, setLotteryPot] = useState();
  const [lotteryPlayers, setPlayers] = useState([]);
  const [lotteryId, setLotteryId] = useState();
  const [lotteryHistory, setLotteryHistory] = useState([]);
  const [userWinningId, setUserWinningId] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [intialized, setIntialized] = useState(false)

  // Get provider
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connection) {
      return getProgram(connection, wallet ?? mockWallet());
    }
  }, [connection, wallet]);

  useEffect(() => {
    updateState();
  }, [program]);

  useEffect(() => {
    if (!lottery) return;
    getPot();
    getPlayers();
    getHistory();
  }, [lottery]);

  const updateState = async () => {
    if (!program) return;

    try {
      if (!masterAddress) {
        const masterAddress = await getMasterAddress();
        setMasterAddress(masterAddress);
      }
      const master = await program.account.master.fetch(
        masterAddress ?? (await getMasterAddress())
      );
      setIntialized(true)
      setLotteryId(master.lastId);
      const lotteryAddress = await getLotteryAddress(master.lastId);
      setLotteryAddress(lotteryAddress);
      const lottery = await program.account.lottery.fetch(lotteryAddress);
      setLottery(lottery);

      // Get user's tickets for the current lottery
      if (!wallet?.publicKey) return;
      const userTickets = await program.account.ticket.all([
        {
          memcmp: {
            bytes: bs58.encode(new BN(lotteryId).toArrayLike(Buffer, "le", 4)),
            offset: 12,
          },
        },
        { memcmp: { bytes: wallet.publicKey.toBase58(), offset: 16 } },
      ]);

      // Check whether any of the user tickets win
      const userWin = userTickets.some(
        (t) => t.account.id === lottery.winnerId
      );
      if (userWin) {
        setUserWinningId(lottery.winnerId);
      } else {
        setUserWinningId(null);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const getPot = async () => {
    const pot = getTotalPrize(lottery);
    setLotteryPot(pot);
  };

  const getPlayers = async () => {
    const players = [lottery.lastTicketId];
    setPlayers(players);
  };

  const getHistory = async () => {
    if (!lotteryId) return;

    const history = [];

    for (const i in new Array(lotteryId).fill(null)) {
      const id = lotteryId - parseInt(i);
      if (!id) break;

      const lotteryAddress = await getLotteryAddress(id);
      const lottery = await program.account.lottery.fetch(lotteryAddress);
      const winnerId = lottery.winnerId;
      if (!winnerId) continue;

      const ticketAddress = await getTicketAddress(lotteryAddress, winnerId);
      const ticket = await program.account.ticket.fetch(ticketAddress);

      history.push({
        lotteryId: id,
        winnerId,
        winnerAddress: ticket.authority,
        prize: getTotalPrize(lottery),
      });
    }

    setLotteryHistory(history);
  };

  const initMaster = async () => {
    setError("");
    setSuccess("");
    console.log("Running")
    try {
      const txHash = await program.methods
        .initMaster()
        .accounts({
          master: masterAddress,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await confirmTx(txHash, connection);

      updateState();
      toast.success("Initialized Master")
    } catch (err) {
      setError(err.message);
      toast.error("Initializing FAILED!")
    }
  };

  const createLottery = async () => {
    setError("");
    setSuccess("");

    try {
      const lotteryAddress = await getLotteryAddress(lotteryId + 1);
      const txHash = await program.methods
        .createLottery(new BN(5).mul(new BN(LAMPORTS_PER_SOL)))
        .accounts({
          lottery: lotteryAddress,
          master: masterAddress,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await confirmTx(txHash, connection);

      updateState();
      toast.success("Auction Created")
    } catch (err) {
      setError(err.message);
      toast.error(err.message)
    }
  };

  const buyTicket = async () => {
    setError("");
    setSuccess("");


    try {
      console.log("BUYING")
      const txHash = await program.methods
        .buyTicket(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          ticket: await getTicketAddress(
            lotteryAddress,
            lottery.lastTicketId + 1
          ),
          buyer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await confirmTx(txHash, connection);
      toast.success("Bought a Car Bid Ticket!")
      updateState();
    } catch (err) {
      setError(err.message);
      toast.error(err.message)
    }
  };

  const pickWinner = async () => {
    setError("");
    setSuccess("");

    try {
      const txHash = await program.methods
        .pickWinner(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          authority: wallet.publicKey,
        })
        .rpc();
      await confirmTx(txHash, connection);

      updateState();
      toast.success("Picked winner!")
    } catch (err) {
      setError(err.message);
      toast.error(err.message)
    }
  };

  const claimPrize = async () => {
    setError("");
    setSuccess("");

    try {
      const txHash = await program.methods
        .claimPrize(lotteryId, userWinningId)
        .accounts({
          lottery: lotteryAddress,
          ticket: await getTicketAddress(lotteryAddress, userWinningId),
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await confirmTx(txHash, connection);

      updateState();
      toast.success("The Winner has claimed the prize!!")
    } catch (err) {
      setError(err.message);
      toast.error(err.message)
    }
  };

  return (
    <AppContext.Provider
      value={{
        isMasterInitialized: intialized,
        connected: wallet?.publicKey ? true : false,
        isLotteryAuthority:
          wallet && lottery && wallet.publicKey.equals(lottery.authority),
        lotteryId,
        lotteryPot,
        lotteryPlayers,
        lotteryHistory,
        isFinished: lottery && lottery.winnerId,
        canClaim: lottery && !lottery.claimed && userWinningId,
        initMaster,
        createLottery,
        buyTicket,
        pickWinner,
        claimPrize,
        error,
        success,
        intialized
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

import IDL from "./idl.json";
import {
  LOTTERY_SEED,
  MASTER_SEED,
  PROGRAM_ID,
  TICKET_SEED,
} from "./constants";

// How to fetch our Program
export const getProgram = (connection, wallet) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new Program(IDL, PROGRAM_ID, provider);
  return program;
};

export const getMasterAddress = async () => {
  return (
    await PublicKey.findProgramAddress([Buffer.from(MASTER_SEED)], PROGRAM_ID)
  )[0];
};

export const getLotteryAddress = async (id) => {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(LOTTERY_SEED), new BN(id).toArrayLike(Buffer, "le", 4)],
      PROGRAM_ID
    )
  )[0];
};

export const getTicketAddress = async (lotteryPk, id) => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(TICKET_SEED),
        lotteryPk.toBuffer(),
        new BN(id).toArrayLike(Buffer, "le", 4),
      ],
      PROGRAM_ID
    )
  )[0];
};

// Return the lastTicket ID and multiply the ticket price and convert LAMPORTS PER SOL and convert it to String
export const getTotalPrize = (lottery) => {
  return new BN(lottery.lastTicketId)
    .mul(lottery.ticketPrice)
    .div(new BN(LAMPORTS_PER_SOL))
    .toString();
};

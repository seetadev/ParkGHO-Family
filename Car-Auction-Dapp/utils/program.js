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

// PublicKey.findProgramAddress is deprecated in favour of the synchronous
// findProgramAddressSync which avoids unnecessary Promise overhead and is the
// recommended API in @solana/web3.js >= 1.68.
export const getMasterAddress = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MASTER_SEED)],
    PROGRAM_ID
  )[0];
};

export const getLotteryAddress = (id) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(LOTTERY_SEED), new BN(id).toArrayLike(Buffer, "le", 4)],
    PROGRAM_ID
  )[0];
};

export const getTicketAddress = (lotteryPk, id) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(TICKET_SEED),
      lotteryPk.toBuffer(),
      new BN(id).toArrayLike(Buffer, "le", 4),
    ],
    PROGRAM_ID
  )[0];
};

// Return the lastTicket ID and multiply the ticket price and convert LAMPORTS PER SOL and convert it to String
export const getTotalPrize = (lottery) => {
  return new BN(lottery.lastTicketId)
    .mul(lottery.ticketPrice)
    .div(new BN(LAMPORTS_PER_SOL))
    .toString();
};

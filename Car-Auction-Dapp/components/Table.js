import style from "../styles/Table.module.css";
import TableRow from "./TableRow";
import {useAppContext} from "../context/context";
import { PublicKey } from '@solana/web3.js';

const Table = () => {

  const {lotteryHistory} = useAppContext();
  // const lotteryHistory = [
  //   { lotteryId: 0, winnerId: 2, winnerAddress: new PublicKey("11111111111111111111111111111111"), prize: '15' },
  //   { lotteryId: 1, winnerId: 5, winnerAddress: new PublicKey("11111111111111111111111111111111"), prize: '40' },
  //   { lotteryId: 2, winnerId: 99, winnerAddress: new PublicKey("11111111111111111111111111111111"), prize: '99' },
  // ]
  return (
    <div className={style.wrapper}>
      <div className={style.tableHeader}>
        <div className={style.addressTitle}>💳 Car Auction No.</div>
        <div className={style.addressTitle}>💳 Address</div>
        <div className={style.addressTitle}>💳 Car Bid Ticket</div>
        <div className={style.amountTitle}>💲 Amount</div>
      </div>
      <div className={style.rows}>
        {lotteryHistory?.map((h, i) => (
          <TableRow key={i} {...h} />
        ))}
      </div>
    </div>
  );
};

export default Table;

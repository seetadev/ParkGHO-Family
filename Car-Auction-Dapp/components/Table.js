import style from "../styles/Table.module.css";
import TableRow from "./TableRow";
import {useAppContext} from "../context/context";
import { PublicKey } from '@solana/web3.js';

const Table = () => {

  const {lotteryHistory} = useAppContext();
  return (
    <div className={style.wrapper}>
      <div className={style.tableHeader}>
        <div className={style.addressTitle}>💳 Car Auction No.</div>
        <div className={style.addressTitle}>💳 Address</div>
        <div className={style.addressTitle}>💳 Car Bid Ticket</div>
        <div className={style.amountTitle}>💲 Amount</div>
      </div>
      <div className={style.rows}>
        {lotteryHistory?.map((h) => (
          // Use the stable lotteryId as the key so React can reconcile rows
          // correctly across re-renders. Using the array index would cause
          // incorrect diffing whenever history entries are prepended or removed.
          <TableRow key={h.lotteryId} {...h} />
        ))}
      </div>
    </div>
  );
};

export default Table;

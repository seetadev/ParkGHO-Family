import React from "react";
import ConnectButton from "./ConnectButton";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <div className="border text-white border-black border-b-white shadow-sm bg-transparent flex justify-between items-center p-4 lg:px-[10em] py-3">
      <div>
        <p className="font-extrabold text-xl">Health Tracker</p>
      </div>
      <div>
        <ConnectButton/>
      </div>
    </div>
  );
};

export default Navbar;

"use client"
import Image from "next/image";

export default function Home() {
  const clickHandler =()=>{
    window.location.href = "/incident-app";
  }
  return (
    <main className="flex w-full h-full min-h-screen flex-col items-center justify-between  ">
     <div>
      <button
      onClick={clickHandler}
       className="shadow border border-white text-white  rounded-full p-3  px-7 hover:shadow-lg transitions-all duration-200 font-bold hover:bg-white hover:text-black mt-[20em]">
        Getting started
      </button>
     </div>
    </main>
  );
}

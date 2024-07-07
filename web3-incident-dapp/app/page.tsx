"use client";
import Image from "next/image";
import { CiLocationArrow1 } from "react-icons/ci";
export default function Home() {
  const clickHandler = () => {
    window.location.href = "/incident-reporting";
  };
  return (
      <div className="flex lg:flex-row flex-col mt-[8em]  justify-evenly w-full  items-center">
        <div>
          <p className=" text-center md:text-left text-6xl md:text-8xl text-white font-extrabold">
            Deci<span className="text-red-400">Report</span>
          </p>
          <p className=" text-center text-white md:text-left md:text-xl mt-4 ">
            Report your road incidents securily and transparently
          </p>

          <div className="flex  w-full justify-between">
            <button
              onClick={clickHandler}
              className="m-auto flex gap-1 items-center  shadow border border-red-400 text-white  rounded-full p-3  px-7 hover:shadow-lg transitions-all duration-200 font-bold hover:bg-red-400 hover:text-black mt-[7em]"
            >
              Report Your Incident 
             <span className="rotate-45 text-xl text-white font-bold"> <CiLocationArrow1/></span>
            </button>
          </div>
        </div>
        <div className="">
          <Image src="/road-2.png" alt="image" width={900} height={900} />
        </div>
      </div>
  );
}

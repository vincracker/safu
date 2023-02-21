// import Transactions from "../components/transactions/transactions";
// import Receive from "../components/Transfer/receive/receive";

import { useState } from "react";

import { useWeb3React } from "@web3-react/core";

import { UseAppContext } from "../App";
import ConnectModal from "../components/Account/ConnectModal";
import Transactions from "../components/Transactions/Transactions";
import Receive from "../components/Transfer/receive/receive";
import Send from "../components/Transfer/send/send";
// import Sended from "../components/Transfer/send/sended";

export default function SRfund() {
  const { state, dispatch } = UseAppContext();

  const { toggle, received } = state;
  const { isActive } = useWeb3React();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // const [toggle, setToggle] = useState(false);

  const toggleClass = " transform translate-x-20";
  return (
    <section className="w-screen min-h-[calc(100vh-7.5rem)] ">
      <div className="w-11/12 md:max-w-7xl h-full mx-auto py-16">
        {!isActive ? (
          <div className="border-2 p-8 border-primary rounded-2xl md:w-[40%] mx-auto space-y-5">
            <div className="flex text-white ">
              {/*   Switch Container */}

              <div
                className=" w-[10.25rem] h-6 flex items-center bg-primary rounded-md px-0.5 py-4 cursor-pointer relative"
                onClick={() => {
                  dispatch({ type: "toggle" });
                }}
              >
                <div className="absolute px-3 flex justify-between w-full items-center text-lg font-medium">
                  <p>Send</p>
                  <p>Recieve</p>
                </div>
                {/* Switch */}
                <div
                  className={
                    "bg-white  h-7 w-20  rounded-md shadow-md transform duration-300 ease-in-out" +
                    (toggle ? null : toggleClass)
                  }
                ></div>
              </div>
            </div>
            <div className="text-center">
              {
                // Send
                !toggle ? (
                  <p>Connect your wallet to send fund</p>
                ) : (
                  // Recieve
                  <p>Connect your wallet to recieve fund</p>
                )
              }
            </div>
            <button
              className="w-full flex items-center justify-center bg-primary text-white rounded-md font-bold text-2xl py-3 px-4"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Connect Wallet
            </button>
            <ConnectModal isModalOpen={isAuthModalOpen} setIsModalOpen={setIsAuthModalOpen} />
          </div>
        ) : (
          <div className="border-2 p-8 border-primary rounded-2xl md:w-[40%] mx-auto space-y-5">
            <div className="flex text-white">
              {/*   Switch Container */}

              <div
                className=" w-[10.25rem] h-6 flex items-center bg-primary rounded-md px-0.5 py-4 cursor-pointer relative"
                onClick={() => {
                  dispatch({ type: "toggle" });
                }}
              >
                <div className="absolute px-3 flex justify-between w-full items-center text-lg font-medium">
                  <p>Send</p>
                  <p>Recieve</p>
                </div>
                {/* Switch */}
                <div
                  className={
                    "bg-white  h-7 w-20  rounded-md shadow-md transform duration-300 ease-in-out" +
                    (toggle ? null : toggleClass)
                  }
                ></div>
              </div>
            </div>
            {!toggle ? (
              // Send
              // sended ? (
              //   <Sended />
              //   <div/>
              // ) : (
              //   // <div />
              //   <Send />
              // )
              <Send />
            ) : // Recieve
            received ? (
              <Receive />
            ) : (
              // <Receive />
              <Receive />
            )}
          </div>
        )}
        {
          // Transactions
          isActive ? <Transactions /> : null
        }
      </div>
    </section>
  );
}

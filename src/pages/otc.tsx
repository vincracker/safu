// import Transactions from "../components/transactions/transactions";
// import Receive from "../components/Transfer/receive/receive";

import { useState } from "react";

import { useWeb3React } from "@web3-react/core";

import { UseAppContext } from "../App";
import ConnectModal from "../components/Account/ConnectModal";
import Send from "../components/Swap/send/send";
import Transactions from "../components/Transactions/Transactions";
// import Sended from "../components/Transfer/send/sended";

export default function OTC() {
  const { state } = UseAppContext();

  const { received } = state;
  const { isActive } = useWeb3React();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // const [toggle, setToggle] = useState(false);

  // const toggleClass = " transform translate-x-20";
  return (
    <section className="w-screen min-h-[calc(100vh-7.5rem)] ">
      <div className="w-11/12 md:max-w-7xl h-full mx-auto py-16">
        {!isActive ? (
          <div className="border-2 p-8 border-primary rounded-2xl md:w-[40%] mx-auto space-y-5">
            <div className="text-center">
              <p>Connect your wallet to initiate an OTC trade</p>
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
            {!received && <Send />}
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

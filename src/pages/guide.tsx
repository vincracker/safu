import { useState } from "react";

export default function Guide() {
  const [active, setActive] = useState(false);
  return (
    <section className="w-screen h-[calc(100vh-7.5rem)] font-Lato">
      <div className="w-11/12 md:max-w-7xl h-full mx-auto space-y-8 my-11">
        <h1 className="text-primary font-bold text-3xl">Guide</h1>

        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
          <li className="mr-2">
            <div
              className={`font-bold inline-block px-4 py-3 cursor-pointer rounded-lg ${
                !active ? "bg-primary text-white" : "bg-white text-black"
              }`}
              onClick={() => setActive(false)}
            >
              Send/Receive
            </div>
          </li>
          <li className="mr-2">
            <div
              className={`font-bold inline-block px-4 py-3 cursor-pointer rounded-lg ${
                active ? "bg-primary text-white" : "bg-white text-black"
              }`}
              onClick={() => setActive(true)}
            >
              Swap
            </div>
          </li>
        </ul>
        <div className="md:max-w-7xl h-full space-y-8 my-11">
          {!active ? (
            <div className="space-y-8">
              <div className="space-y-5">
                <h1 className="text-xl">How to send assets:</h1>
                <p>Step 1. Click into Send/Receive, toggle Send function and connect your wallet</p>
                <p>Step 2. Select asset to send, e.g. ETH, input amount to send and recipient address</p>
                <p>Step 3. Click send. Ensure details are correct in the confirmation box and click confirm</p>
                <p>Step 4. Copy and paste the passphrase and send it to your intended recipient</p>
                <p>Step 5. Wait for recipient to collect the assets</p>
              </div>
              <div className="space-y-5">
                <h1 className="text-xl">How to receive assets:</h1>
                <p>Step 1. Click into Send/Receive, toggle Receive function and connect your wallet</p>
                <p>Step 2. At the bottom of the page click claim on the pending transaction</p>
                <p>
                  Step 3. Enter the passphrase send to you by the sender, click confirm. Assets will be transferred to
                  your wallet if the passphrase is correct
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-5">
                <h1 className="text-xl">How to initiate an OTC/Escrow transaction:</h1>
                <p>Step 1. Click into OTC/Escrow function and connect your wallet</p>
                <p>Step 2. Select and input the amount and type of assets to send and receive</p>
                <p>Step 3. Click send and check the details, then click confirm</p>
                <p>Step 4. Send passphrase to counterparty and wait for them to complete the transaction</p>
              </div>
              <div className="space-y-5">
                <h1 className="text-xl">How to receive an OTC/Escrow transaction</h1>
                <p>Step 1. Click into OTC/Escrow function and connect your wallet</p>
                <p>
                  Step 2. Click enter passphrase in the transaction box at the bottom of the page, enter passphrase sent
                  by counterparty
                </p>
                <p>
                  Step 3. Ensure details are correct and click confirm. The trade will be completed and assets will be
                  transferred to your wallet if the passphrase is correct
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

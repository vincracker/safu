// import React from "react";

import { useState } from "react";

import { CopyToClipboard } from "react-copy-to-clipboard";

import { UseAppContext } from "../../../App";
import checkmark from "../../../assets/images/checkmark.svg";
import copy from "../../../assets/images/copy.svg";
import { CHAINS } from "../../../constants/networks";

type TransactionType = {
  txHash: string;
  chainId: number;
  sendToken: string;
  amount: number;
  passphrase: string;
  receiver: string;
  swapToken: string;
  swapAmount: number;
  swapDeadline: number;
};

interface PropsType {
  transaction: TransactionType;
}
export default function Sended({ transaction }: PropsType) {
  const { dispatch } = UseAppContext();
  const [copied, setCopied] = useState(false);
  return (
    <div className="font-Lato space-y-3">
      <div className="space-y-2">
        <p className="text-xl">
          <b>OTC transaction is pending...</b>
        </p>
        <p>
          TxHash:{" "}
          <a
            href={"https://goerli.etherscan.io/tx/" + transaction.txHash}
            target="_blank"
            className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          >
            {transaction.txHash.slice(0, 30)}.....
          </a>
        </p>
      </div>

      <div className="flex-col space-y-2">
        <p className="text-xl">
          {" "}
          <b>Passphrase</b>
        </p>
        <div className="flex items-center justify-between">
          <p className="text-primary font-bold text-2xl lg:text-3xl">{"" + transaction.passphrase + ""}</p>
          {!copied ? (
            <CopyToClipboard text={transaction.passphrase}>
              <button
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 2000);
                }}
              >
                <img src={copy} alt="copy" className="w-8 h-8" />
              </button>
            </CopyToClipboard>
          ) : (
            <button>
              <img src={checkmark} alt="checkmark" className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-200 p-1">
        <p>
          I am initiating an OTC trade to send you {transaction.amount} {transaction.sendToken} and get{" "}
          {transaction.swapAmount} {transaction.swapToken} from you.
        </p>
        <p>
          The deadline of this trade is <b> {new Date(transaction.swapDeadline * 1000).toLocaleString()}.</b>
        </p>
        <p>To complete the trade:</p>
        <br />
        <p className="">1. &nbsp; &nbsp; Go to website (OTC/Escrow)</p>
        <p className="">
          2. &nbsp; &nbsp; Connect the wallet:{" "}
          <b>
            {transaction.receiver.slice(0, 10)}.....
            {transaction.receiver.slice(transaction.receiver.length - 10, transaction.receiver.length)}
          </b>{" "}
          on {CHAINS[transaction.chainId].name + "(" + transaction.chainId + ")"}
        </p>
        <p className="">3. &nbsp; &nbsp; Click into the relevant transaction at the “Inbound” section</p>

        <p className="">
          4. &nbsp; &nbsp; Enter the passphrase: <b>{transaction.passphrase}</b>
        </p>
        <p className="">5. &nbsp; &nbsp; Confirm the trade details</p>
        <p className="">6. &nbsp; &nbsp; Click confirm</p>
        <br />
        <p>Done! Assets will be transferred automatically.</p>
      </div>

      {/* copy intruction to clipboard */}
      <CopyToClipboard
        text={`For the recipient to collect the assets:\n 1. Go to website Link to receive \n 2. Connect the wallet ${
          transaction.receiver
        } on ${CHAINS[transaction.chainId].name + "(" + transaction.chainId + ")"} \n 3. Enter the passphrase “${
          transaction.passphrase
        }” \n 4. Click “Collect” \n Done! Assets will be transferred automatically.
            `}
      >
        <button className="w-full flex items-center justify-center bg-gray-400 text-white rounded-md font-bold text-sm py-1.5 px-4 hover:bg-gray-300">
          Copy instructions to clipboard
        </button>
      </CopyToClipboard>

      {/* send again */}
      <button
        className="w-full flex items-center justify-center bg-primary text-white rounded-md font-bold text-sm py-1.5 px-4 hover:bg-gray-300"
        onClick={() => {
          dispatch({ type: "reset_sended" });
        }}
      >
        Send again
      </button>
    </div>
  );
}

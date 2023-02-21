import { useState } from "react";

import Modal from "react-modal";

import { UseAppContext } from "../../../App";
import logo from "../../../assets/images/logo.png";
import wrong from "../../../assets/images/wrong.svg";
import { getTxError } from "../../../hooks/useFormatError";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

interface PropsType {
  modalIsOpen: boolean;
  setIsOpen: (e: boolean) => void;
  tokenName: string;
  amount: number;
  to: string;
  swapTokenName: string;
  swapAmount: number;
  swapDeadline: number;
  feeRate: number;
  handleConfirm: (deadline: number) => Promise<void>;
  resetForm: () => void;
}

export default function SendModal({
  modalIsOpen,
  setIsOpen,
  tokenName,
  amount,
  to,
  swapTokenName,
  swapAmount,
  swapDeadline,
  feeRate,
  handleConfirm,
  resetForm
}: PropsType) {
  const { dispatch } = UseAppContext();

  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function closeModal() {
    setIsOpen(false);
    setFailed(false);
    resetForm();
  }

  async function handleModalConfirm() {
    dispatch({
      type: "send",
      payload: {
        eth: amount,
        address: to
      }
    });
    setLoading(true);

    await handleConfirm(swapDeadline)
      .then(() => {
        setLoading(false);
        resetForm();
        closeModal();
        dispatch({
          type: "sended_transaction"
        });
      })
      .catch((error) => {
        setLoading(false);
        setFailed(true);

        const RpcError = getTxError(error);
        if (error["error"]) {
          setErrorMsg("Error!" + `\n\n${error["error"]["message"]}`);
        } else {
          setErrorMsg("Error!" + `\n\n${RpcError.slice(0, RpcError.indexOf("("))}`);
        }

        // if (typeof error === "string") {
        //   setErrorMsg("Error!" + `\n\n${error}`);
        // } else if (error instanceof Error) {
        //   console.log(error);
        //   if (error.message.indexOf("reason") == 0) {
        //     setErrorMsg("Error!" + `\n\n${error}`);
        //   } else {
        //     setErrorMsg(
        //       "Error!" + `\n\n${error.message.slice(error.message.indexOf("reason"), error.message.indexOf(","))}`
        //     );
        //   }
        // }
      });

    // setTimeout(() => {
    //   setLoading(false);
    //   resetForm();
    //   closeModal();
    //   dispatch({
    //     type: "sended_transaction"
    //   });
    // }, 3000);
  }

  return (
    <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} ariaHideApp={false}>
      {!failed ? (
        <div className="p-4 flex flex-col items-center gap-y-3 w-80 md:w-96 font-Lato">
          <img src={logo} alt="logo" className="w-20" />
          {loading ? (
            <div className="flex flex-col items-center gap-y-2">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
              <p>Waiting for network confirmation</p>
              <p>
                Initiating a transfer of {amount} {tokenName} to address {to}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-y-3 w-full">
              <p>
                You will send {amount} {tokenName} and receive{" "}
                {(swapAmount - (feeRate / 10000) * swapAmount).toFixed(7)} {swapTokenName}
              </p>
              <p>
                with {to.slice(0, 5)}...{to.slice(to.length - 5, to.length - 1)} as your counterparty
              </p>
              <p>
                Transaction fee: {((feeRate / 10000) * amount).toFixed(7)} {tokenName}
              </p>
              <p>
                Recipient will receive {(amount - (feeRate / 10000) * amount).toFixed(7)} {tokenName}
              </p>
              <p>Order will expire in {new Date(swapDeadline * 1000).toLocaleString()}</p>

              <div className="w-full flex justify-center items-center gap-x-3">
                <button className="bg-gray-400 text-white w-full py-1 rounded-lg" onClick={closeModal}>
                  Back
                </button>
                <button className="bg-primary text-white w-full py-1 rounded-lg" onClick={handleModalConfirm}>
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 flex flex-col items-center gap-y-3 w-80 md:w-96 font-Lato">
          <img src={wrong} alt="wrong" className="w-20" />
          <div className="flex flex-col items-center gap-y-3">
            <p>Transaction Failed</p>
            <p className="w-30">{errorMsg}</p>
            <div className="w-full flex justify-center items-center gap-x-3">
              <button className="bg-primary text-white w-full py-1 rounded-lg" onClick={closeModal}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

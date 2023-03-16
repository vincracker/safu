import { useState } from "react";

// import { ethers } from "ethers";
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
  amount: number;
  token: string;
  fee: number;
  handleConfirm: () => Promise<void>;
  resetForm: () => void;
}

export default function ReceiveModal({
  modalIsOpen,
  setIsOpen,
  amount,
  token,
  fee,
  handleConfirm,
  resetForm
}: PropsType) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { dispatch } = UseAppContext();

  function closeModal() {
    setIsOpen(false);
    setFailed(false);
    resetForm();
  }

  async function handleModalConfirm() {
    setLoading(true);

    await handleConfirm()
      .then(() => {
        setLoading(false);
        resetForm();
        closeModal();
        dispatch({
          type: "received_transaction"
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
      });
  }

  return (
    <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} ariaHideApp={false}>
      {!failed ? (
        <div className="p-4 flex flex-col items-center gap-y-3 w-80 md:w-96 font-Lato">
          <img src={logo} alt="logo" className="w-20" />
          {loading ? (
            <div className="flex flex-col items-center gap-y-2">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
              <p>Waiting for confirmation</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-y-3 w-full">
              <p>You would receive {(amount - fee).toFixed(5) + " " + token} </p>
              <p>Transaction fee: {fee.toFixed(5) + " " + token}</p>
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

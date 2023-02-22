import { useEffect, useState } from "react";

// import { UseAppContext } from "../../App";
import { gql, useQuery } from "@apollo/client";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, Contract, ethers } from "ethers";
import { useFormik } from "formik";
import keccak256 from "keccak256";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useLocation } from "react-router-dom";

import erc20_abi from "../../abi/GenericERC20.json";
import abi from "../../abi/SaFuSend.json";
import { UseAppContext } from "../../App";
import eth from "../../assets/images/eth.png";
import link from "../../assets/images/link.png";
import logo from "../../assets/images/logo.png";
import { tokenslist } from "../../constants/tokenData";
import { useContract } from "../../hooks/useContract";
import { contract_address, etherscan } from "../../utils/constant";

const GET_ORDERS = gql`
  query GetOrders {
    orders {
      id
      tokenAddress
      amount
      passphrase
      sender {
        id
      }
      receiver {
        id
      }
      isSwap
      status
      swapAmount
      swapTokenAddres
      swapDeadline
      senderHash
      receiverHash
    }
  }
`;

type Order = {
  id: string;
  tokenAddress: string;
  amount: bigint;
  passphrase: string;
  sender: string;
  receiver: string;
  isSwap: boolean;
  status: bigint;
  swapAmount: bigint;
  swapTokenAddress: string;
  swapDeadline: number;
  senderHash: string;
  receiverHash: string | null;
};

export default function Transactions() {
  const location = useLocation();
  const [btnSelected, setBtnSelected] = useState("Sending");
  const { state } = UseAppContext();
  const { toggle, sended, received } = state;
  const [orders, setOrders] = useState<Order[]>();
  const [orderSelect, setOrderSelect] = useState<Order>({} as Order);
  const [modal, setModal] = useState(false);
  const [claimModal, setClaimModal] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fee, setFeeRate] = useState(0);
  const [pp, setPP] = useState("");
  const { refetch } = useQuery(GET_ORDERS, {
    onCompleted: (data) => {
      // console.log(data);
      const newData: Order[] = data.orders.map((order: any) => {
        return {
          id: order.id,
          tokenAddress: order.tokenAddress,
          amount: order.amount,
          passphrase: order.passphrase,
          sender: order.sender.id,
          receiver: order.receiver.id,
          isSwap: order.isSwap,
          status: order.status,
          swapAmount: order.swapAmount,
          swapTokenAddress: order.swapTokenAddres,
          swapDeadline: order.swapDeadline,
          senderHash: order.senderHash,
          receiverHash: order.receiverHash
        };
      });
      setOrders(newData);
      // setAddress(account);
    },
    onError: (error) => {
      console.log(error);
    }
  });
  const { account, provider } = useWeb3React();
  // const { state, dispatch } = UseAppContext();
  const chiron_contract: Contract | undefined = useContract(contract_address, abi);
  useEffect(() => {
    if (chiron_contract) {
      chiron_contract.fee_rate().then((res: number) => {
        setFeeRate(res);
      });
    }
  }, [chiron_contract]);

  const handleConfirm = async () => {
    if (pp != "") {
      setLoading(true);
      await cancelOrder(pp)
        .then(() => {
          setCanceled(true);
          setLoading(false);
          refetch();
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };

  const cancelOrder = async (passphrase: string) => {
    if (!provider || !account) {
      window.alert("Wallet not connected");
      throw Error("Wallet not connected");
    }

    if (provider && chiron_contract) {
      const tx = await chiron_contract.retrieve_unclaimed_order(passphrase);
      await tx.wait();
    }
  };

  const handleCancel = (pp_hash: string) => {
    setPP(pp_hash);
    setModal(true);
  };

  const cancelClaim = () => {
    setClaimModal(false);
  };

  const handleClaimSucceed = () => {
    setClaimModal(false);
    refetch();
  };

  useEffect(() => {
    refetch();
  }, [sended, received, toggle]);

  return (
    <div className="font-Lato border-2 border-primary rounded-2xl md:w-[40%] mx-auto  mt-6">
      {modal && (
        <div className="fixed w-full h-full top-0 left-0 bg-[#04073882] backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-1/4 h-fit border-primary p-10 border-2 bg-white top-[50%] left-[30%] rounded-lg flex flex-col items-center gap-5">
            {!canceled ? (
              <>
                <p className="text-xl font-bold text-primary">Do you confirm cancel the order?</p>

                {loading ? (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-2 px-4 cursor-not-allowed"
                    disabled
                  >
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                    Processing...
                  </button>
                ) : (
                  <button
                    className="w-full flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-2 px-4"
                    onClick={() => handleConfirm()}
                  >
                    Confirm
                  </button>
                )}

                <button
                  className="w-full flex items-center justify-center bg-slate-500 text-white rounded-md font-bold text-xl py-2 px-4"
                  onClick={() => {
                    setModal(false);
                    setPP("");
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-primary">Cancel Successfully</p>
                <button
                  className="w-full flex items-center justify-center bg-slate-500 text-white rounded-md font-bold text-xl py-2 px-4"
                  onClick={() => {
                    setModal(false);
                    setCanceled(false);
                    setPP("");
                  }}
                >
                  Okay
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {claimModal && (
        <ClaimModal order={orderSelect} cancelClaim={cancelClaim} handleClaimSucceed={handleClaimSucceed} />
      )}

      <div className="w-full flex items-center justify-between py-1 px-4 border-b-2 border-primary mb-2">
        <button
          className={`px-4 py-1  border-[#00B0F0] ${btnSelected === "Sending" && "border-b-2"}`}
          onClick={() => {
            setBtnSelected("Sending");
          }}
        >
          Sending
        </button>
        <button
          className={`px-4 py-1  border-[#00B0F0] ${btnSelected === "Receiving" && "border-b-2"}`}
          onClick={() => {
            setBtnSelected("Receiving");
          }}
        >
          Receiving
        </button>
        <button
          className={`px-4 py-1  border-[#00B0F0] ${btnSelected === "Completed" && "border-b-2"}`}
          onClick={() => {
            setBtnSelected("Completed");
          }}
        >
          Completed
        </button>
      </div>

      {orders != undefined &&
        account != undefined &&
        // Sending
        (btnSelected === "Sending" ? (
          <div className="h-64 p-4 overflow-y-scroll">
            {orders
              .filter((order: Order) => order.sender == account.toLowerCase() && order.status.toString() == "0")
              .filter((order: Order) => (location.pathname == "/app" ? order.isSwap == false : order.isSwap == true))
              .length > 0 ? (
              orders
                .filter((order: Order) => order.sender == account.toLowerCase() && order.status.toString() == "0")
                .map((order) => {
                  return (
                    <div className="px-4 py-3 flex items-center border-b border-gray-500" key={order.id}>
                      {!order.isSwap ? (
                        <div className="w-full flex justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-x-3">
                              <img src={eth} alt="eth" className="h-8 w-8" />
                              <p>
                                {ethers.utils.formatEther(order.amount)}{" "}
                                {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                  ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                  : "UNK"}
                              </p>
                            </div>
                            <p>
                              {order.receiver.slice(0, 10)}...
                              {order.receiver.slice(order.receiver.length - 10, order.receiver.length)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-col items-center gap-x-2">
                              {/* <p>{order.senderHash.slice(0, 10)}...</p> */}
                              <a target="_blank" href={etherscan + "tx/" + order.senderHash}>
                                <img src={link} alt="link" className="w-6 h-6" />
                              </a>
                            </div>
                            {order.status.toString() === "0" ? (
                              <button
                                className="bg-[#4F57A8] text-white px-4 py-0.5 rounded-sm"
                                onClick={() => {
                                  // dispatch({
                                  //   type: "cancel_transaction",
                                  //   payload: transaction.id
                                  // });
                                  handleCancel(order.passphrase);
                                }}
                              >
                                Cancel
                              </button>
                            ) : order.status.toString() === "1" ? (
                              <button className="bg-[#4F57A8] text-white px-4 py-0.5 rounded-sm">Cancelled</button>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 flex-col w-full">
                          <div className="flex space-x-2 justify-between">
                            <div className="flex items-center gap-x-3">
                              <img
                                src={
                                  tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].logoURI
                                    : "/https://www.google.com/search?q=erc20+token+icon&sxsrf=AJOqlzWFemc1K-V90X4rqmz8jC9Lje0U5g:1675922616189&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj3yNWh4of9AhXGkmoFHbyhBOoQ_AUoAXoECAEQAw&biw=1680&bih=862&dpr=2#imgrc=7LqRKq0I4xkygM"
                                }
                                alt="eth"
                                className="h-8 w-8"
                              />
                              <img
                                src={
                                  tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].logoURI
                                    : "/https://www.google.com/search?q=erc20+token+icon&sxsrf=AJOqlzWFemc1K-V90X4rqmz8jC9Lje0U5g:1675922616189&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj3yNWh4of9AhXGkmoFHbyhBOoQ_AUoAXoECAEQAw&biw=1680&bih=862&dpr=2#imgrc=7LqRKq0I4xkygM"
                                }
                                alt="eth"
                                className="h-8 w-8"
                              />
                              <p>
                                {ethers.utils.formatEther(order.amount)}{" "}
                                {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                  ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                  : "UNK"}
                              </p>
                              <p> {"< >"}</p>
                              <p>
                                {ethers.utils.formatEther(order.swapAmount)}{" "}
                                {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                  ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                                  : "UNK"}
                              </p>
                            </div>
                            <div className="space-y-2 text-end">
                              <div className="flex flex-col items-center gap-x-2">
                                {/* <p>{order.senderHash.slice(0, 10)}...</p> */}
                                <a target="_blank" href={etherscan + "tx/" + order.senderHash}>
                                  <img src={link} alt="link" className="w-6 h-6" />
                                </a>
                              </div>

                              {order.status.toString() === "0" ? (
                                <button
                                  className="bg-[#4F57A8] text-white px-4 py-0.5 rounded-sm"
                                  onClick={() => {
                                    // dispatch({
                                    //   type: "cancel_transaction",
                                    //   payload: transaction.id
                                    // });
                                    handleCancel(order.passphrase);
                                  }}
                                >
                                  Cancel
                                </button>
                              ) : order.status.toString() === "1" ? (
                                <button className="bg-[#4F57A8] text-white px-4 py-0.5 rounded-sm">Cancelled</button>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-x-3">
                            <p> Counterparty address:</p>
                            <p>
                              {order.receiver.slice(0, 5)}...
                              {order.receiver.slice(order.receiver.length - 5, order.receiver.length)}
                            </p>
                            <div className="rounded-full overflow-hidden w-6 h-6 inline-block bg-[#2362FF]">
                              <svg x="0" y="0" width="24" height="24">
                                <rect
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                  transform="translate(-3.000997466513636 5.553768960528579) rotate(126.2 12 12)"
                                  fill="#1897F2"
                                ></rect>
                                <rect
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                  transform="translate(-8.596187094007108 -4.434598946399147) rotate(266.4 12 12)"
                                  fill="#F2A202"
                                ></rect>
                                <rect
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                  transform="translate(19.099437161091057 5.921056634506256) rotate(75.4 12 12)"
                                  fill="#FB185C"
                                ></rect>
                              </svg>
                            </div>
                          </div>
                          <div className="flex items-center gap-x-3 justify-between">
                            <p> You Send:</p>
                            <p>
                              {ethers.utils.formatEther(order.amount)}{" "}
                              {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                : "UNK"}
                            </p>{" "}
                          </div>
                          <div className="flex items-center gap-x-3 justify-between">
                            <p> You Receive: (net of fee)</p>
                            <p>
                              {ethers.utils.formatEther(
                                BigNumber.from(order.swapAmount).sub(BigNumber.from(order.swapAmount).div(10))
                              )}{" "}
                              {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                                : "UNK"}
                            </p>
                          </div>
                          <div className="flex items-center gap-x-3 justify-between">
                            <p>OTC Deadline: </p>
                            <p>
                              <b>{new Date(order.swapDeadline * 1000).toLocaleString()}</b>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <div className="h-full flex items-center justify-center">No transactions</div>
            )}
          </div>
        ) : btnSelected === "Receiving" ? (
          <div className="h-64 p-4 overflow-y-scroll">
            {orders.filter((order: Order) => order.receiver == account.toLowerCase() && order.status.toString() == "0")
              .length > 0 ? (
              orders
                .filter((order) => order.receiver == account.toLowerCase() && order.status.toString() == "0")
                .filter((order: Order) => (location.pathname == "/app" ? order.isSwap == false : order.isSwap == true))
                .map((order) => {
                  return (
                    <div
                      className="px-4 py-3 flex items-center justify-between border-b border-gray-500"
                      key={order.id}
                    >
                      {!order.isSwap ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-x-3">
                            <img src={eth} alt="eth" className="h-8 w-8" />
                            <p>
                              {ethers.utils.formatEther(order.amount)}{" "}
                              {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                : "UNK"}
                            </p>
                          </div>
                          <p>
                            {order.sender.slice(0, 10)}...
                            {order.sender.slice(order.sender.length - 10, order.sender.length)}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 flex-col w-full">
                          <div className="flex space-x-2 justify-between">
                            <div className="flex items-center gap-x-3">
                              <img
                                src={
                                  tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].logoURI
                                    : "/https://www.google.com/search?q=erc20+token+icon&sxsrf=AJOqlzWFemc1K-V90X4rqmz8jC9Lje0U5g:1675922616189&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj3yNWh4of9AhXGkmoFHbyhBOoQ_AUoAXoECAEQAw&biw=1680&bih=862&dpr=2#imgrc=7LqRKq0I4xkygM"
                                }
                                alt="eth"
                                className="h-8 w-8"
                              />
                              <img
                                src={
                                  tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].logoURI
                                    : "/https://www.google.com/search?q=erc20+token+icon&sxsrf=AJOqlzWFemc1K-V90X4rqmz8jC9Lje0U5g:1675922616189&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj3yNWh4of9AhXGkmoFHbyhBOoQ_AUoAXoECAEQAw&biw=1680&bih=862&dpr=2#imgrc=7LqRKq0I4xkygM"
                                }
                                alt="eth"
                                className="h-8 w-8"
                              />
                              <p>
                                {ethers.utils.formatEther(order.amount)}{" "}
                                {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                  ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                  : "UNK"}
                              </p>
                              <p> {"< >"}</p>
                              <p>
                                {ethers.utils.formatEther(order.swapAmount)}{" "}
                                {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                  ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                                  : "UNK"}
                              </p>
                            </div>
                            <div className="space-y-2 text-end">
                              <div className="flex flex-col items-center gap-x-2">
                                {/* <p>{order.senderHash.slice(0, 10)}...</p> */}
                                <a target="_blank" href={etherscan + "tx/" + order.senderHash}>
                                  <img src={link} alt="link" className="w-6 h-6" />
                                </a>
                              </div>

                              <button
                                className="bg-[#4F57A8] text-white px-4 py-0.5 rounded-sm"
                                onClick={() => {
                                  // dispatch({
                                  //   type: "cancel_transaction",
                                  //   payload: transaction.id
                                  // });
                                  // handleCancel(order.passphrase);
                                  setOrderSelect(order);
                                  setClaimModal(true);
                                }}
                              >
                                Claim
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-x-3">
                            <p> Counterparty address:</p>
                            <p>
                              {order.sender.slice(0, 5)}...
                              {order.sender.slice(order.sender.length - 5, order.sender.length)}
                            </p>
                            <div className="rounded-full overflow-hidden w-6 h-6 inline-block bg-[#2362FF]">
                              <svg x="0" y="0" width="24" height="24">
                                <rect
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                  transform="translate(-3.000997466513636 5.553768960528579) rotate(126.2 12 12)"
                                  fill="#1897F2"
                                ></rect>
                                <rect
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                  transform="translate(-8.596187094007108 -4.434598946399147) rotate(266.4 12 12)"
                                  fill="#F2A202"
                                ></rect>
                                <rect
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                  transform="translate(19.099437161091057 5.921056634506256) rotate(75.4 12 12)"
                                  fill="#FB185C"
                                ></rect>
                              </svg>
                            </div>
                          </div>
                          <div className="flex items-center gap-x-3 justify-between">
                            <p> You Send:</p>
                            <p>
                              {ethers.utils.formatEther(order.swapAmount)}{" "}
                              {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                                : "UNK"}
                            </p>
                          </div>
                          <div className="flex items-center gap-x-3 justify-between">
                            <p> You Receive: (net of fee)</p>
                            <p>
                              {ethers.utils.formatEther(
                                BigNumber.from(order.amount).sub(BigNumber.from(order.amount).div(10))
                              )}{" "}
                              {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                : "UNK"}
                            </p>{" "}
                          </div>
                          <div className="flex items-center gap-x-3 justify-between">
                            <p>OTC Deadline: </p>
                            <p>
                              <b>{new Date(order.swapDeadline * 1000).toLocaleString()}</b>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <div className="h-full flex items-center justify-center">No transactions</div>
            )}
          </div>
        ) : (
          <div className="h-64 p-4 overflow-y-scroll">
            {orders
              .filter(
                (order) =>
                  (order.sender == account.toLowerCase() || order.receiver == account.toLowerCase()) &&
                  (order.status.toString() === "2" || order.status.toString() === "1")
              )
              .filter((order: Order) => (location.pathname == "/app" ? order.isSwap == false : order.isSwap == true))
              .length > 0 ? (
              orders
                .filter((order: Order) => (location.pathname == "/app" ? order.isSwap == false : order.isSwap == true))
                .map((order) => {
                  return (
                    <div
                      className="px-4 py-3 flex items-center justify-between border-b border-gray-500"
                      key={order.id}
                    >
                      {!order.isSwap ? (
                        <div className="flex w-full justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-x-3">
                              <img src={eth} alt="eth" className="h-8 w-8" />
                              <p>
                                {ethers.utils.formatEther(order.amount)}{" "}
                                {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                  ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                  : "UNK"}
                              </p>
                            </div>
                            <div className="flex items-center gap-x-3">
                              <p> Counterparty address:</p>
                              <p>
                                {order.receiver.slice(0, 5)}...
                                {order.receiver.slice(order.sender.length - 5, order.receiver.length)}
                              </p>
                              <div className="rounded-full overflow-hidden w-6 h-6 inline-block bg-[#2362FF]">
                                <svg x="0" y="0" width="24" height="24">
                                  <rect
                                    x="0"
                                    y="0"
                                    width="24"
                                    height="24"
                                    transform="translate(-3.000997466513636 5.553768960528579) rotate(126.2 12 12)"
                                    fill="#1897F2"
                                  ></rect>
                                  <rect
                                    x="0"
                                    y="0"
                                    width="24"
                                    height="24"
                                    transform="translate(-8.596187094007108 -4.434598946399147) rotate(266.4 12 12)"
                                    fill="#F2A202"
                                  ></rect>
                                  <rect
                                    x="0"
                                    y="0"
                                    width="24"
                                    height="24"
                                    transform="translate(19.099437161091057 5.921056634506256) rotate(75.4 12 12)"
                                    fill="#FB185C"
                                  ></rect>
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-col items-center gap-x-2">
                              {/* <p>{order.senderHash.slice(0, 10)}...</p> */}
                              <a href={"https://goerli.etherscan.io/tx/" + order.receiverHash} target="_blank">
                                <img src={link} alt="link" className="w-6 h-6" />
                              </a>
                            </div>
                            <div className="flex items-start">
                              {/* <p>{transaction.TxId}</p> */}
                              <div className="flex justify-center w-full  gap-x-2">
                                {order.status.toString() === "1" ? (
                                  <button className="bg-[#39393a] text-white px-4 py-0.5 rounded-sm" disabled>
                                    Cancelled
                                  </button>
                                ) : order.status.toString() === "2" ? (
                                  <button className="bg-[#39393a] text-white px-4 py-0.5 rounded-sm" disabled>
                                    {account.toLowerCase() == order.sender ? "Sent" : "Received"}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 flex-col w-full">
                          <div className="flex space-x-2 justify-between">
                            <div className="flex items-center gap-x-3">
                              <img
                                src={
                                  tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].logoURI
                                    : "/https://www.google.com/search?q=erc20+token+icon&sxsrf=AJOqlzWFemc1K-V90X4rqmz8jC9Lje0U5g:1675922616189&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj3yNWh4of9AhXGkmoFHbyhBOoQ_AUoAXoECAEQAw&biw=1680&bih=862&dpr=2#imgrc=7LqRKq0I4xkygM"
                                }
                                alt="eth"
                                className="h-8 w-8"
                              />
                              <img
                                src={
                                  tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].logoURI
                                    : "/https://www.google.com/search?q=erc20+token+icon&sxsrf=AJOqlzWFemc1K-V90X4rqmz8jC9Lje0U5g:1675922616189&source=lnms&tbm=isch&sa=X&ved=2ahUKEwj3yNWh4of9AhXGkmoFHbyhBOoQ_AUoAXoECAEQAw&biw=1680&bih=862&dpr=2#imgrc=7LqRKq0I4xkygM"
                                }
                                alt="eth"
                                className="h-8 w-8"
                              />
                              <p>
                                {ethers.utils.formatEther(order.amount)}{" "}
                                {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                  ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                  : "UNK"}
                              </p>
                              <p> {"< >"}</p>
                              <p>
                                {ethers.utils.formatEther(order.swapAmount)}{" "}
                                {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                  ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                                  : "UNK"}
                              </p>
                            </div>
                            <div className="space-y-2 text-end">
                              <div className="flex flex-col items-center gap-x-2">
                                {/* <p>{order.senderHash.slice(0, 10)}...</p> */}
                                <a href={"https://goerli.etherscan.io/tx/" + order.receiverHash} target="_blank">
                                  <img src={link} alt="link" className="w-6 h-6" />
                                </a>
                              </div>

                              <div className="flex items-start">
                                {/* <p>{transaction.TxId}</p> */}
                                <div className="flex justify-center w-full  gap-x-2">
                                  {order.status.toString() === "0" ? (
                                    <button className="bg-[#4F57A8] text-white px-4 py-0.5 rounded-sm" disabled>
                                      {" "}
                                      Sending
                                    </button>
                                  ) : order.status.toString() === "1" ? (
                                    <button className="bg-[#4F57A8] text-white px-4 py-0.5 rounded-sm" disabled>
                                      Cancelled
                                    </button>
                                  ) : order.status.toString() === "2" ? (
                                    <button className="bg-[#39393a] text-white px-4 py-0.5 rounded-sm" disabled>
                                      {account.toLowerCase() == order.sender ? "Sent" : "Received"}
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-x-3">
                            <p> Counterparty address:</p>
                            {account.toLowerCase() == order.sender ? (
                              <p>
                                {order.receiver.slice(0, 5)}...
                                {order.receiver.slice(order.sender.length - 5, order.receiver.length)}
                              </p>
                            ) : (
                              <p>
                                {order.sender.slice(0, 5)}...
                                {order.sender.slice(order.sender.length - 5, order.sender.length)}
                              </p>
                            )}

                            <div className="rounded-full overflow-hidden w-6 h-6 inline-block bg-[#2362FF]">
                              <svg x="0" y="0" width="24" height="24">
                                <rect
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                  transform="translate(-3.000997466513636 5.553768960528579) rotate(126.2 12 12)"
                                  fill="#1897F2"
                                ></rect>
                                <rect
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                  transform="translate(-8.596187094007108 -4.434598946399147) rotate(266.4 12 12)"
                                  fill="#F2A202"
                                ></rect>
                                <rect
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                  transform="translate(19.099437161091057 5.921056634506256) rotate(75.4 12 12)"
                                  fill="#FB185C"
                                ></rect>
                              </svg>
                            </div>
                          </div>
                          <div>
                            {account.toLowerCase() == order.sender ? (
                              <div className="flex-col gap-y-2">
                                <div className="flex items-center gap-x-3 justify-between">
                                  <p> You Sent:</p>
                                  <p>
                                    {ethers.utils.formatEther(order.amount)}{" "}
                                    {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                      ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                      : "UNK"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-x-3 justify-between">
                                  <p> You Received:</p>
                                  <p>
                                    {ethers.utils.formatEther(
                                      BigNumber.from(order.swapAmount).sub(
                                        BigNumber.from(order.swapAmount).mul(fee).div(10000)
                                      )
                                    )}
                                    {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                      ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                                      : "UNK"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-col gap-y-2">
                                <div className="flex items-center gap-x-3 justify-between">
                                  <p> You Sent:</p>
                                  <p>
                                    {ethers.utils.formatEther(order.swapAmount)}{" "}
                                    {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                                      ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                                      : "UNK"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-x-3 justify-between">
                                  <p> You Received:</p>
                                  <p>
                                    {ethers.utils.formatEther(
                                      BigNumber.from(order.amount).sub(BigNumber.from(order.amount).mul(fee).div(10000))
                                    )}
                                    {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                                      ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                                      : "UNK"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* <div className="space-y-2 text-end"></div> */}
                    </div>
                  );
                })
            ) : (
              <div className="h-full flex items-center justify-center">No transactions</div>
            )}
          </div>
        ))}
    </div>
  );
}

interface PropsType {
  order: Order;
  cancelClaim: () => void;
  handleClaimSucceed: () => void;
}

const ClaimModal = ({ order, cancelClaim, handleClaimSucceed }: PropsType) => {
  const [pp, setPP] = useState("");
  const [validPP, setValidPP] = useState(false);
  const [approved, setApproved] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const { provider, account } = useWeb3React();
  const chiron_contract: Contract | undefined = useContract(contract_address, abi);
  const [fee, setFeeRate] = useState(0);
  const [txHash, setTxHash] = useState("");

  const hashPP = (pp: string): string => {
    return "0x" + keccak256(Buffer.from(pp)).toString("hex");
  };

  const formik = useFormik({
    initialValues: {
      passphrase: ""
    },
    onSubmit: (values) => {
      console.log(values);
      // setValidPP(true);
      if (!approved) {
        if (order) {
          approveAllowance(order.swapTokenAddress, order.swapAmount);
        }
      } else {
        setPP(values.passphrase);
        setValidPP(true);
      }
    },
    validate: async (values) => {
      if (hashPP(values.passphrase) === order.passphrase) {
        if (provider && account && order) {
          if (order.swapTokenAddress != ethers.constants.AddressZero) {
            const erc20 = new ethers.Contract(order.swapTokenAddress, erc20_abi, provider.getSigner(account));
            const balance = await erc20.balanceOf(account);
            if (balance.lt(order.amount)) {
              setError("Balance not enough");
            } else {
              setError("");
            }
          } else {
            const balance = await provider.getBalance(account);
            if (balance.lt(order.amount)) {
              setError("Balance not enough");
            } else {
              setError("");
            }
          }
        }
      } else {
        setError("Your passphrse is incorrect");
      }
    }
  });

  const claimOrder = async () => {
    if (!provider || !account) {
      window.alert("Wallet not connected");
      handleClaimSucceed();
      throw Error("Wallet not connected");
    }
    if (chiron_contract) {
      setLoading(true);
      try {
        const tx = await chiron_contract.claim_asset(pp, {
          value:
            order.swapTokenAddress === ethers.constants.AddressZero
              ? BigNumber.from(order.amount)
              : ethers.utils.parseEther("0")
        });
        setTxHash(tx.hash);
        await tx.wait();
        setLoading(false);
        setClaimed(true);
      } catch (error) {
        console.log(error);
        window.alert(error);
        setLoading(false);
      }
    }
  };

  const approveAllowance = async (tokenAddres: string, amount: bigint) => {
    // console.log(error);
    if (provider && account) {
      const erc20 = new ethers.Contract(tokenAddres, erc20_abi, provider.getSigner(account));
      setLoading(true);

      try {
        const approveTx = await erc20.approve(contract_address, amount.toString());
        approveTx.wait().then(() => {
          setApproved(true);
          setLoading(false);
        });
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (order.swapTokenAddress == ethers.constants.AddressZero) {
      setApproved(true);
    } else {
      setApproved(false);
    }
  }, [order]);

  useEffect(() => {
    if (chiron_contract) {
      chiron_contract.fee_rate().then((res: number) => {
        setFeeRate(res);
      });
    }
  }, [chiron_contract]);

  return (
    <div className="fixed w-full h-full top-0 left-0 bg-[#04073882] backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="w-1/3 h-fit border-primary p-8 border-2 bg-white rounded-lg flex flex-col items-center gap-5">
        {!validPP ? (
          <form className="w-full" onSubmit={formik.handleSubmit}>
            <div className="w-full flex flex-col items-center">
              <label className="space-y-2 w-4/5">
                <p>Enter passphrase</p>
                <div className="w-full relative">
                  <input
                    name="passphrase"
                    type={show ? "text" : "password"}
                    className="w-full bg-[#1F40CB] opacity-60 p-4 mb-0 text-white font-bold rounded-md focus:outline-none placeholder:text-white"
                    onChange={formik.handleChange}
                    value={formik.values.passphrase}
                    placeholder="<XXXXXXXX>"
                    required
                  />
                  {show ? (
                    <AiOutlineEye
                      size={30}
                      className="absolute right-5 top-4 cursor-pointer opacity-60 hover:opacity-90"
                      onClick={() => {
                        setShow(false);
                      }}
                    />
                  ) : (
                    <AiOutlineEyeInvisible
                      size={30}
                      className="absolute right-5 top-4 cursor-pointer opacity-60 hover:opacity-90"
                      onClick={() => {
                        setShow(true);
                      }}
                    />
                  )}
                </div>

                {error.length > 0 ? <p className="text-red-500 text-end mt-0">{error}</p> : null}
              </label>
              <br />

              {!loading ? (
                <button
                  className="w-4/5 flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-2 px-4"
                  type="submit"
                >
                  {approved ? "Confirm" : "Approve"}
                </button>
              ) : (
                <button className="w-4/5 flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-2 px-4">
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                </button>
              )}
            </div>
          </form>
        ) : !claimed ? (
          <>
            {!loading ? (
              <div className="w-full flex flex-col items-center gap-4">
                <img src={logo} alt="logo" className="w-20" />
                <p>
                  You will send {ethers.utils.formatEther(order.swapAmount)}{" "}
                  {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                    : "UNK"}{" "}
                  and receive{" "}
                  {ethers.utils.formatEther(
                    BigNumber.from(order.amount).sub(BigNumber.from(order.amount).mul(fee).div(10000))
                  )}{" "}
                  {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                    ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                    : "UNK"}
                </p>
                <p>
                  with {order.sender.slice(0, 5)}...{order.sender.slice(order.sender.length - 5, order.sender.length)}{" "}
                  as your counterparty
                </p>
                <p>
                  Transaction fee {ethers.utils.formatEther(BigNumber.from(order.swapAmount).mul(fee).div(10000))}{" "}
                  {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                    : "UNK"}{" "}
                </p>
                <p>
                  Counterparty will receive{" "}
                  {ethers.utils.formatEther(
                    BigNumber.from(order.swapAmount).sub(BigNumber.from(order.swapAmount).mul(fee).div(10000))
                  )}{" "}
                  {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                    : "UNK"}{" "}
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4">
                <img src={logo} alt="logo" className="w-20" />
                <p>Waiting for confirmation</p>
                <p>
                  Swapping {ethers.utils.formatEther(BigNumber.from(order.swapAmount))}{" "}
                  {tokenslist.filter((token) => token.address == order.swapTokenAddress).length > 0
                    ? tokenslist.filter((token) => token.address == order.swapTokenAddress)[0].symbol
                    : "UNK"}{" "}
                  for{" "}
                  {ethers.utils.formatEther(
                    BigNumber.from(order.amount).sub(BigNumber.from(order.amount).mul(fee).div(10000))
                  )}{" "}
                  {tokenslist.filter((token) => token.address == order.tokenAddress).length > 0
                    ? tokenslist.filter((token) => token.address == order.tokenAddress)[0].symbol
                    : "UNK"}{" "}
                </p>
              </div>
            )}

            {!loading ? (
              <button
                className="w-4/5 flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-2 px-4"
                onClick={() => claimOrder()}
              >
                Confirm
              </button>
            ) : (
              <button className="w-4/5 flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-2 px-4">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </button>
            )}
          </>
        ) : (
          <>
            <div className="w-full flex flex-col items-center">
              <img src={logo} alt="logo" className="w-20" />
              <p>Your trade has been completed</p>
              <p>
                TxHash:{" "}
                <a
                  href={"https://goerli.etherscan.io/tx/" + txHash}
                  target="_blank"
                  className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                >
                  {txHash.slice(0, 30)}.....
                </a>
              </p>
            </div>
          </>
        )}

        <button
          className="w-4/5 flex items-center justify-center bg-slate-500 text-white rounded-md font-bold text-xl py-2 px-4"
          onClick={() => {
            cancelClaim();
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};

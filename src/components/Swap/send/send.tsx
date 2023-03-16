import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

import { useEffect, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import { useWeb3React } from "@web3-react/core";
import { Contract, ethers } from "ethers";
import { useFormik } from "formik";
import keccak256 from "keccak256";

import erc20_abi from "../../../abi/GenericERC20.json";
import abi from "../../../abi/SaFuSend.json";
import { UseAppContext } from "../../../App";
import { tokenslist } from "../../../constants/tokenData";
import { useContract } from "../../../hooks/useContract";
import { contract_address, stableCoins, feeCollectCap } from "../../../utils/constant";
import Sended from "./sended";
import SendModal from "./sendModal";
import TokenModal from "./tokenModal";

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
  sendTokenFee: number;
  swapTokenFee: number;
};
type TokenType = {
  name: string;
  address: string;
  symbol: string;
  logoURI: string;
};

const GET_PENDING_ORDERS = gql`
  query GetSwapOrder {
    orders {
      id
      tokenAddress
      amount
      passphrase
      receiver {
        id
      }
      isSwap
      status
      swapAmount
      swapTokenAddres
      swapDeadline
      senderHash
    }
  }
`;

type Order = {
  id: string;
  tokenAddress: string;
  amount: bigint;
  passphrase: string;
  receiver: string;
  isSwap: boolean;
  status: bigint;
  swapAmount: bigint;
  swapTokenAddress: string;
  swapDeadline: bigint;
  senderHash: string;
};

const Send = () => {
  const { state } = UseAppContext();
  const { sended } = state;

  const [modalIsOpen, setIsOpen] = useState(false);
  const [timestamp, setTimestamp] = useState(0);
  const [sendTokenModalIsOpen, setSendTokenModalIsOpen] = useState(false);
  const [swapTokenModalIsOpen, setSwapTokenModalIsOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionType>();
  const [approve, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [swapError, setSwapError] = useState("");
  const [addressError, setAddressError] = useState("");
  const { account, provider, chainId } = useWeb3React();
  const [orders, setOrders] = useState<Order[]>();
  const [feeRate, setFeeRate] = useState<number>(0);

  const { refetch } = useQuery(GET_PENDING_ORDERS, {
    onCompleted: (data) => {
      const orderData: Order[] = data.orders
        .filter((order: any) => order.isSwap)
        .map((order: any) => {
          return {
            id: order.id,
            tokenAddress: order.tokenAddress,
            amount: order.amount,
            passphrase: order.passphrase,
            receiver: order.receiver.id,
            isSwap: order.isSwap,
            status: order.status,
            swapAmount: order.swapAmount,
            swapTokenAddress: order.swapTokenAddress,
            swapDeadline: order.swapDeadline,
            senderHash: order.senderHash
          };
        });
      console.log(orderData);
      setOrders(orderData);
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const chiron_contract: Contract | undefined = useContract(contract_address, abi);

  const initialToken: TokenType = {
    name: tokenslist[0].name,
    address: tokenslist[0].address ? tokenslist[0].address : ethers.constants.AddressZero,
    symbol: tokenslist[0].symbol,
    logoURI: tokenslist[0].logoURI
  };

  const setSendToken = (token: TokenType) => {
    formik.setFieldValue("sendToken", token);
  };

  const setSwapToken = (token: TokenType) => {
    formik.setFieldValue("receiveToken", token);
  };

  const formik = useFormik({
    initialValues: {
      amount: 0,
      to: "",
      sendToken: initialToken,
      receiveToken: initialToken,
      swapAmount: 0,
      swapDeadline: 60
    },
    onSubmit: (values) => {
      let passphrase = ethers.Wallet.createRandom().address.slice(0, 20);
      while (
        orders != undefined &&
        orders.filter((order: Order) => order.status.toString() == "0" && order.passphrase == hashPP(passphrase))
          .length > 0
      ) {
        passphrase = ethers.Wallet.createRandom().address.slice(0, 20);
      }
      const localTime = Math.floor(Date.now() / 1000);
      setTimestamp(localTime);
      setTransactionData({
        txHash: "",
        chainId: chainId ? chainId : 0,
        amount: values.amount,
        sendToken: values.sendToken.symbol,
        passphrase: passphrase,
        receiver: values.to,
        swapToken: values.receiveToken.symbol,
        swapAmount: values.swapAmount,
        swapDeadline: localTime + Number(values.swapDeadline),
        sendTokenFee:
          is_stable_coin(values.sendToken.address) && (values.amount * feeRate) / 10000 >= feeCollectCap
            ? feeCollectCap
            : (values.amount * feeRate) / 10000,
        swapTokenFee:
          is_stable_coin(values.receiveToken.address) && (values.swapAmount * feeRate) / 10000 >= feeCollectCap
            ? feeCollectCap
            : (values.amount * feeRate) / 10000
      });
      setIsOpen(true);
    },
    validate: async (values) => {
      if (values.amount <= 0) {
        setError("Please input amount larger than 0");
      } else {
        if (account && provider) {
          let balance = ethers.BigNumber.from(0);
          if (values.sendToken.address == ethers.constants.AddressZero) {
            balance = await provider.getBalance(account);
          } else {
            const erc20 = new ethers.Contract(values.sendToken.address, erc20_abi, provider.getSigner(account));
            try {
              const tokenBalance = await erc20.balanceOf(account);
              balance = tokenBalance;

              const allowance = await erc20.allowance(account, contract_address);
              if (ethers.BigNumber.from(allowance).lt(ethers.utils.parseEther(values.amount.toString()))) {
                setApproved(false);
              } else {
                setApproved(true);
              }
            } catch (error) {
              console.log(error);
            }
          }

          if (ethers.utils.parseEther(values.amount.toString()).gt(balance)) {
            setError("Insufficient balance");
          } else {
            setError("");
          }
        }
      }

      if (values.swapAmount <= 0) {
        setSwapError("Please input amount larger than 0");
      } else {
        setSwapError("");
      }

      if (values.to != "" && !ethers.utils.isAddress(values.to)) {
        setAddressError("Address not valid");
      } else {
        setAddressError("");
      }
      // console.log(values.swapDeadline);
    }
  });

  const handleConfirm = async (deadline: number) => {
    if (transactionData) {
      await addNewOrder(
        formik.values.sendToken.address,
        formik.values.amount,
        transactionData.passphrase,
        formik.values.to,
        true,
        formik.values.receiveToken.address,
        formik.values.swapAmount,
        deadline
      );
    }
  };

  const addNewOrder = async (
    token_address: string,
    amount: number,
    passphrase: string,
    receiver: string,
    isSwap = false,
    swap_address = ethers.constants.AddressZero,
    swap_amount = 0,
    swapDeadline = 0
  ) => {
    if (!provider || !account) {
      window.alert("Wallet not connected");
      return;
    }

    if (provider && chiron_contract && chainId) {
      const tx = await chiron_contract.add_order(
        token_address,
        ethers.utils.parseEther(amount.toString()),
        "0x" + keccak256(Buffer.from(passphrase)).toString("hex"),
        receiver,
        isSwap,
        swap_address,
        isSwap ? ethers.utils.parseEther(swap_amount.toString()) : 0,
        swapDeadline,
        {
          value:
            token_address === ethers.constants.AddressZero
              ? ethers.utils.parseEther(amount.toString())
              : ethers.utils.parseEther("0")
        }
      );
      // await tx.wait();
      setTransactionData({
        txHash: tx.hash,
        chainId: chainId,
        amount,
        sendToken: formik.values.sendToken.symbol,
        passphrase,
        receiver,
        swapToken: formik.values.receiveToken.symbol,
        swapAmount: swap_amount,
        swapDeadline: swapDeadline,
        sendTokenFee:
          is_stable_coin(formik.values.sendToken.address) && (formik.values.amount * feeRate) / 10000 >= feeCollectCap
            ? feeCollectCap
            : (formik.values.amount * feeRate) / 10000,
        swapTokenFee:
          is_stable_coin(formik.values.receiveToken.address) &&
          (formik.values.swapAmount * feeRate) / 10000 >= feeCollectCap
            ? feeCollectCap
            : (formik.values.amount * feeRate) / 10000
      });
      refetch();
      // message.info(`Success!\n\nTx Hash: ${tx.hash}`);
      // setTxHash(tx.hash);
      // setSuccess(true);
    }
  };

  const approveAllowance = async (tokenAddres: string, amount: number) => {
    if (error.length == 0 && addressError.length == 0) {
      // console.log(error);
      if (provider && account) {
        const erc20 = new ethers.Contract(tokenAddres, erc20_abi, provider.getSigner(account));
        setLoading(true);

        try {
          const approveTx = await erc20.approve(contract_address, ethers.utils.parseEther(amount.toString()));
          approveTx.wait().then(() => {
            setApproved(true);
            setLoading(false);
          });
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      }
    }
  };

  const hashPP = (pp: string): string => {
    return "0x" + keccak256(Buffer.from(pp)).toString("hex");
  };

  const is_stable_coin = (address: string): boolean => {
    return stableCoins.filter((coin) => coin.toUpperCase() == address.toUpperCase()).length > 0;
  };

  useEffect(() => {
    if (chiron_contract) {
      chiron_contract.fee_rate().then((res: any) => {
        setFeeRate(+res);
      });
    }
  }, []);

  return (
    <div>
      {!sended ? (
        <div className="w-full font-Lato">
          <form className="text-black w-full flex flex-col gap-y-6" onSubmit={formik.handleSubmit}>
            <label htmlFor="amount">
              <p>I want to send:</p>
              <div className="relative">
                <input
                  name="amount"
                  type="number"
                  className="w-full bg-[#1F40CB] opacity-60 p-4 text-white font-bold rounded-md placeholder:text-white"
                  onChange={formik.handleChange}
                  value={formik.values.amount}
                  required
                  step={"any"}
                  min={0.0001}
                />

                <button
                  className="absolute flex items-center gap-x-2 text-white font-bold top-1 right-1 px-4 py-2 rounded-full bg-[#5570df]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSendTokenModalIsOpen(true);
                  }}
                >
                  {formik.values.sendToken.logoURI == "/" && formik.values.sendToken.name == "Unknown token" ? (
                    <div className="w-10 rounded-full bg-indigo-400 flex justify-center items-center">UNK</div>
                  ) : (
                    <img
                      src={formik.values.sendToken.logoURI}
                      alt={formik.values.sendToken.symbol}
                      className="w-7 h-7 rounded-full"
                    />
                  )}
                  <p>{formik.values.sendToken.symbol}</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {formik.values.amount > 0 && error.length <= 0 ? (
                <>
                  {is_stable_coin(formik.values.sendToken.address) &&
                  (feeRate / 10000) * formik.values.amount >= feeCollectCap ? (
                    <p>
                      Counterparty will receive {(formik.values.amount - feeCollectCap).toFixed(7)}{" "}
                      {formik.values.sendToken.symbol} net of fee
                    </p>
                  ) : (
                    <p>
                      Counterparty will receive{" "}
                      {(formik.values.amount - (feeRate / 10000) * formik.values.amount).toFixed(7)}{" "}
                      {formik.values.sendToken.symbol} net of fee
                    </p>
                  )}
                </>
              ) : null}
              {error.length > 0 ? <p className="text-red-500 text-end">{error}</p> : null}
            </label>
            <label htmlFor="to">
              <p>To the address:</p>
              <input
                name="to"
                type="text"
                className="w-full bg-[#1F40CB] opacity-60 p-4 text-white font-bold rounded-md focus:outline-none placeholder:text-white"
                onChange={formik.handleChange}
                value={formik.values.to}
                placeholder="0x..."
                required
              />
              {addressError.length > 0 ? <p className="text-red-500 text-end">{addressError}</p> : null}
            </label>
            <label htmlFor="swapAmount">
              <p>Counterparty will send:</p>
              <div className="relative">
                <input
                  name="swapAmount"
                  type="number"
                  className="w-full bg-[#1F40CB] opacity-60 p-4 text-white font-bold rounded-md placeholder:text-white"
                  onChange={formik.handleChange}
                  value={formik.values.swapAmount}
                  required
                  step={"any"}
                  min={0.0001}
                />

                <button
                  className="absolute flex items-center gap-x-2 text-white font-bold top-1 right-1 px-4 py-2 rounded-full bg-[#5570df]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSwapTokenModalIsOpen(true);
                  }}
                >
                  {formik.values.receiveToken.logoURI == "/" && formik.values.receiveToken.name == "Unknown token" ? (
                    <div className="w-10 rounded-full bg-indigo-400 flex justify-center items-center">UNK</div>
                  ) : (
                    <img
                      src={formik.values.receiveToken.logoURI}
                      alt={formik.values.receiveToken.symbol}
                      className="w-7 h-7 rounded-full"
                    />
                  )}
                  <p>{formik.values.receiveToken.symbol}</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {formik.values.swapAmount > 0 && error.length <= 0 ? (
                <>
                  {is_stable_coin(formik.values.receiveToken.address) &&
                  (feeRate / 10000) * formik.values.amount >= feeCollectCap ? (
                    <p>
                      Counterparty will receive {(formik.values.amount - feeCollectCap).toFixed(7)}{" "}
                      {formik.values.receiveToken.symbol} net of fee
                    </p>
                  ) : (
                    <p>
                      Counterparty will receive{" "}
                      {(formik.values.amount - (feeRate / 10000) * formik.values.amount).toFixed(7)}{" "}
                      {formik.values.receiveToken.symbol} net of fee
                    </p>
                  )}
                </>
              ) : null}
              {swapError.length > 0 ? <p className="text-red-500 text-end">{swapError}</p> : null}
            </label>

            <label htmlFor="swapDeadline">
              <p>Expried in:</p>
              <select
                name="swapDeadline"
                id="swapDeadline"
                onChange={formik.handleChange}
                value={formik.values.swapDeadline}
                className="rounded-md font-bold border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-[#1F40CB] opacity-60 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="60">1 Minute</option>
                <option value="600">10 Minutes</option>
                <option value="3600">1 hour</option>
                <option value="86400">1 day</option>
                <option value="259200">3 days</option>
                <option value="604800">7 days</option>
              </select>
            </label>

            {formik.values.sendToken.address == ethers.constants.AddressZero || approve ? (
              <button
                type="submit"
                className={`w-full flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-2 px-4 ${
                  swapError.length != 0 || error.length != 0 || addressError.length != 0
                    ? "cursor-not-allowed bg-slate-400"
                    : ""
                }`}
              >
                Send
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  approveAllowance(formik.values.sendToken.address, formik.values.amount);
                }}
                disabled={error.length != 0 || addressError.length != 0 ? true : false}
                className={`w-full flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-2 px-4 ${
                  error.length != 0 || addressError.length != 0 ? "cursor-not-allowed" : ""
                }`}
              >
                {!loading ? (
                  <>Approve</>
                ) : (
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
                )}
              </button>
            )}
          </form>
        </div>
      ) : (
        transactionData && <Sended transaction={transactionData} />
      )}

      <SendModal
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        tokenName={formik.values.sendToken.symbol}
        amount={formik.values.amount}
        to={formik.values.to}
        swapTokenName={formik.values.receiveToken.symbol}
        swapAmount={formik.values.swapAmount}
        swapDeadline={timestamp + Number(formik.values.swapDeadline)}
        sendFee={transactionData ? transactionData.sendTokenFee : 0}
        receiveFee={transactionData ? transactionData.swapTokenFee : 0}
        handleConfirm={handleConfirm}
        resetForm={formik.resetForm}
      />

      <TokenModal modalIsOpen={sendTokenModalIsOpen} setIsOpen={setSendTokenModalIsOpen} setToken={setSendToken} />
      <TokenModal modalIsOpen={swapTokenModalIsOpen} setIsOpen={setSwapTokenModalIsOpen} setToken={setSwapToken} />
    </div>
  );
};

export default Send;

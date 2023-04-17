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
  amount: number;
  passphrase: string;
  receiver: string;
  fee: number;
};
type TokenType = {
  name: string;
  address: string;
  symbol: string;
  logoURI: string;
};

const GET_PENDING_ORDERS = gql`
  query GetOrdersByPasspharse {
    orders {
      id
      tokenAddress
      amount
      passphrase
      receiver {
        id
      }
      status
    }
  }
`;

type Order = {
  id: string;
  tokenAddress: string;
  amount: bigint;
  passphrase: string;
  receiver: string;
  status: bigint;
};

const Send = () => {
  const { state } = UseAppContext();
  const { sended } = state;

  const [modalIsOpen, setIsOpen] = useState(false);
  const [tokenModalIsOpen, setTokenModalIsOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionType>();
  const [approve, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addressError, setAddressError] = useState("");
  const { account, provider, chainId } = useWeb3React();
  const [orders, setOrders] = useState<Order[]>();
  const [feeRate, setFeeRate] = useState<number>(0);
  const [isCap, setIsCap] = useState<boolean>(false);

  const { refetch } = useQuery(GET_PENDING_ORDERS, {
    onCompleted: (data) => {
      const orderData: Order[] = data.orders.map((order: any) => {
        return {
          id: order.id,
          tokenAddress: order.tokenAddress,
          amount: order.amount,
          passphrase: order.passphrase,
          receiver: order.receiver.id,
          status: order.status
        };
      });
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

  const setToken = (token: TokenType) => {
    formik.setFieldValue("token", token);
  };

  const formik = useFormik({
    initialValues: {
      amount: 0,
      to: "",
      token: initialToken
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
      setTransactionData({
        txHash: "",
        chainId: chainId ? chainId : 0,
        amount: values.amount,
        passphrase: passphrase,
        receiver: values.to,
        fee: isCap ? feeCollectCap : values.amount - (values.amount * feeRate) / 100000
      });
      setIsOpen(true);
    },
    validate: async (values) => {
      if (values.amount <= 0) {
        setError("Please input amount larger than 0");
      } else {
        if (account && provider) {
          let balance = ethers.BigNumber.from(0);
          if (values.token.address == ethers.constants.AddressZero) {
            balance = await provider.getBalance(account);
          } else {
            const erc20 = new ethers.Contract(values.token.address, erc20_abi, provider.getSigner(account));
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

      if (values.to != "" && !ethers.utils.isAddress(values.to)) {
        setAddressError("Address not valid");
      } else {
        setAddressError("");
      }

      const feeCollect = values.amount - (values.amount * feeRate) / 10000;
      console.log(feeCollect);
      if (is_stable_coin(values.token.address) && feeCollect > feeCollectCap) {
        setIsCap(true);
      } else {
        setIsCap(false);
      }
    }
  });

  const is_stable_coin = (address: string): boolean => {
    return stableCoins.filter((token) => token.toUpperCase() == address.toUpperCase()).length > 0;
  };

  const handleConfirm = async () => {
    if (transactionData) {
      await addNewOrder(
        formik.values.token.address,
        formik.values.amount,
        transactionData.passphrase,
        formik.values.to
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
      // console.log(tx);
      setTransactionData({
        txHash: tx.hash,
        chainId: chainId,
        amount,
        passphrase,
        receiver,
        fee: isCap ? feeCollectCap : amount - (amount * feeRate) / 100000
      });
      refetch();
      // message.info(`Success!\n\nTx Hash: ${tx.hash}`);
      // setTxHash(tx.hash);
      // setSuccess(true);
    }
  };

  const approveAllowance = async (tokenAddres: string, amount: number) => {
    if (error.length == 0 && addressError.length == 0) {
      console.log(error);
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

  useEffect(() => {
    if (chiron_contract) {
      chiron_contract.transfer_fee_rate().then((res: any) => {
        setFeeRate(+res);
      });
    }
  }, []);

  // console.log(keccak256(Buffer.from("ss")).toString("hex"));

  // const handleSubmit = (e: any) => {
  //   e.preventDefault();

  //   if (eth > balance) {
  //     setError("Insufficient Balance");
  //     setTimeout(() => {
  //       setError("");
  //     }, 2000);

  //     return;s
  //   }

  //   if (eth > 0 && address.length > 0) {
  //     setIsOpen(true);
  //   } else {
  //     setError("Please fill all the fields");
  //   }
  // };

  // const addNewOrder = (e: any) => {
  //   console.log(e);
  //   resetForm();
  // };

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

                {/* <label htmlFor="token" className="absolute top-2 right-1">
                  <Select
                    name="token"
                    onChange={(e) => formik.setFieldValue("token", e)}
                    defaultValue={formik.values.token}
                    options={options}
                    value={formik.values.token}
                  />
                </label> */}
                <button
                  className="absolute flex items-center gap-x-2 text-white font-bold top-1 right-1 px-4 py-2 rounded-full bg-[#5570df]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTokenModalIsOpen(true);
                  }}
                >
                  {formik.values.token.logoURI == "/" && formik.values.token.name == "Unknown token" ? (
                    <div className="w-10 rounded-full bg-indigo-400 flex justify-center items-center">UNK</div>
                  ) : (
                    <img
                      src={formik.values.token.logoURI}
                      alt={formik.values.token.symbol}
                      className="w-7 h-7 rounded-full"
                    />
                  )}
                  <p>{formik.values.token.symbol}</p>
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
                  {!isCap ? (
                    <p>
                      Counterparty will receive{" "}
                      {(formik.values.amount - (formik.values.amount * feeRate) / 10000).toFixed(6)}{" "}
                      {formik.values.token.symbol} net of fee
                    </p>
                  ) : (
                    <p>
                      Counterparty will receive {formik.values.amount - feeCollectCap} {formik.values.token.symbol} net
                      of fee
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
            {formik.values.token.address == ethers.constants.AddressZero || approve ? (
              <button
                type="submit"
                className={`w-full flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-2 px-4 ${
                  error.length != 0 || addressError.length != 0 ? "cursor-not-allowed" : ""
                }`}
              >
                Send
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  approveAllowance(formik.values.token.address, formik.values.amount);
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
        tokenName={formik.values.token.symbol}
        amount={formik.values.amount}
        to={formik.values.to}
        fee={isCap ? feeCollectCap : (formik.values.amount * feeRate) / 10000}
        handleConfirm={handleConfirm}
        resetForm={formik.resetForm}
      />

      <TokenModal modalIsOpen={tokenModalIsOpen} setIsOpen={setTokenModalIsOpen} setToken={setToken} />
    </div>
  );
};

export default Send;

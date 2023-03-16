import { Buffer } from "buffer";

import { useEffect, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import { useWeb3React } from "@web3-react/core";
import { Contract, ethers } from "ethers";
import { useFormik } from "formik";
import keccak256 from "keccak256";

import abi from "../../../abi/SaFuSend.json";
import { UseAppContext } from "../../../App";
import { tokenslist } from "../../../constants/tokenData";
import { useContract } from "../../../hooks/useContract";
import { contract_address, stableCoins, feeCollectCap } from "../../../utils/constant";
import ReceiveModal from "./receivModal";

window.Buffer = window.Buffer || Buffer;

const GET_ORDERS_BY_PASSPHARSE = gql`
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

type TokenType = {
  name: string;
  address: string;
  symbol: string;
  logoURI: string;
};

export default function Receive() {
  // const [passphrase, setPassphrase] = useState("");
  const { state, dispatch } = UseAppContext();
  const { received } = state;
  const { provider, account } = useWeb3React();
  const [orders, setOrders] = useState<Order[]>();
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [modalIsOpen, setIsOpen] = useState(false);
  const chiron_contract: Contract | undefined = useContract(contract_address, abi);
  const [feeRate, setFeeRate] = useState<number>(0);

  const initialToken: TokenType = {
    name: tokenslist[0].name,
    address: tokenslist[0].address ? tokenslist[0].address : ethers.constants.AddressZero,
    symbol: tokenslist[0].symbol,
    logoURI: tokenslist[0].logoURI
  };

  const { loading } = useQuery(GET_ORDERS_BY_PASSPHARSE, {
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
      console.log(loading);
      console.log(error);
    }
  });

  const formik = useFormik({
    initialValues: {
      passphrase: "",
      amount: 0,
      token: initialToken
    },
    onSubmit: (values) => {
      if (orders && account) {
        const claimOrder = orders.filter(
          (order) =>
            order.receiver == account.toLowerCase() &&
            order.passphrase === hashPP(values.passphrase) &&
            order.status.toString() === "0"
        )[0];
        const token = tokenslist.filter(
          (token) => token.address.toUpperCase() === claimOrder.tokenAddress.toUpperCase()
        )[0];
        formik.setFieldValue("amount", ethers.utils.formatEther(claimOrder.amount));
        formik.setFieldValue("token", token);
        setIsOpen(true);
      }
    },
    validate: (values) => {
      if (orders && account && values.passphrase != "") {
        if (
          orders.filter(
            (order) =>
              order.receiver == account.toLowerCase() &&
              order.passphrase === hashPP(values.passphrase) &&
              order.status.toString() === "0"
          ).length == 0
        ) {
          setError("Invalid passphrase");
        } else {
          setError("");
        }
      } else {
        setError("");
      }
    }
  });

  const hashPP = (pp: string): string => {
    return "0x" + keccak256(Buffer.from(pp)).toString("hex");
  };

  const is_stable_coin = (address: string): boolean => {
    return stableCoins.filter((token) => token.toUpperCase() == address.toUpperCase()).length > 0;
  };

  const handleConfirm = async () => {
    try {
      await claimOrder(formik.values.passphrase);
    } catch (error) {
      console.log(error);
    }
  };

  const claimOrder = async (passphrase_hash: string) => {
    if (!provider || !account) {
      window.alert("Wallet not connected");
      throw Error("Wallet not connected");
    }

    if (provider && chiron_contract) {
      const tx = await chiron_contract.claim_asset(passphrase_hash);
      await tx.wait();
      setTxHash(tx.hash);
    }
  };

  const reset = () => {
    dispatch({
      type: "reset_received"
    });
  };

  useEffect(() => {
    if (chiron_contract) {
      chiron_contract.fee_rate().then((res: any) => {
        setFeeRate(+res);
      });
    }
  }, []);

  return (
    <div className="w-full font-Lato">
      {!received ? (
        <form className="text-black w-full flex flex-col gap-y-6" onSubmit={formik.handleSubmit}>
          <p>Please ensure that your wallet address matches the one provided by the sender</p>
          <label className="space-y-2">
            <p>Enter passphrase</p>
            <input
              name="passphrase"
              type="text"
              className="w-full bg-[#1F40CB] opacity-60 p-4 mb-0 text-white font-bold rounded-md focus:outline-none placeholder:text-white"
              onChange={formik.handleChange}
              value={formik.values.passphrase}
              placeholder="<XXXXXXXX>"
              required
            />
            {error.length > 0 ? <p className="text-red-500 text-end mt-0">{error}</p> : null}
          </label>
          {error.length > 0 ? (
            <button
              type="submit"
              className="w-full flex items-center justify-center bg-slate-500 text-gray-200 rounded-md font-bold text-xl py-1 px-4 cursor-not-allowed pointer-events-none"
            >
              Confirm
            </button>
          ) : (
            <button
              type="submit"
              className="w-full flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-1 px-4"
            >
              Confirm
            </button>
          )}
        </form>
      ) : (
        <div className=" w-full flex flex-col gap-y-6">
          <p>Transfer completed! amount has been sent</p>
          <div className="flex flex-col">
            <p>View your transaction ID:</p>
            <p>
              <a href="/">{txHash.slice(0, 20)}</a>
            </p>
          </div>
          <button
            onClick={reset}
            className="w-full flex items-center justify-center bg-primary text-white rounded-md font-bold text-xl py-1 px-4"
          >
            Claim more
          </button>
        </div>
      )}

      <ReceiveModal
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        handleConfirm={handleConfirm}
        amount={formik.values.amount}
        token={formik.values.token.symbol}
        fee={
          is_stable_coin(formik.values.token.address) &&
          formik.values.amount - (formik.values.amount * feeRate) / 10000 >= feeCollectCap
            ? feeCollectCap
            : formik.values.amount - formik.values.amount * feeRate
        }
        resetForm={formik.resetForm}
      />
    </div>
  );
}

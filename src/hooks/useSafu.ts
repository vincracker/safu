import { Contract } from "ethers";

import abi from "../abi/SaFuSend.json";
import { contract_address } from "../utils/constant";
import { useSignerOrProvider } from "./useSignerOrProvider";

export const getFeeRate = async () => {
  const signerOrProvider = useSignerOrProvider();

  const chiron_contract: Contract | undefined = new Contract(contract_address, abi, signerOrProvider);

  if (chiron_contract !== undefined) {
    try {
      const feeRate = await chiron_contract.fee_rate().toString();
      return feeRate;
    } catch (error) {
      console.log(error);
      return "0";
    }
  }
  return "0";
};

export const checkStableCoin = async (token_address: string) => {
  const signerOrProvider = useSignerOrProvider();

  const chiron_contract: Contract | undefined = new Contract(contract_address, abi, signerOrProvider);
  if (chiron_contract !== undefined) {
    try {
      const res = (await chiron_contract.is_stable_coin(token_address)) || false;
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  return false;
};

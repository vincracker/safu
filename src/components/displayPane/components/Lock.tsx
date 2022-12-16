import { useState } from "react";

import {
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  HStack,
  Button,
  Select,
  InputGroup,
  Alert,
  AlertIcon
} from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import { message } from "antd";
import { ethers } from "ethers";

import erc20_abi from "../../../abi/GenericERC20.json";
import contract_abi from "../../../abi/SaFuSend.json";
import { contract_address } from "../../../utils/constant";

// import { useNativeBalance } from "../../../hooks/useNativeBalance";
// import { parseBigNumberToFloat } from "../../../utils/formatters";

const Lock: React.FC = () => {
  const { account, provider } = useWeb3React();
  // const balance = useNativeBalance(provider, account);
  const [amount, setAmount] = useState<number | null>();
  const [receiver, setReceiver] = useState<string>();
  const [isEth, setIsEth] = useState(true);
  const [passpharse, setPasspharse] = useState("");

  const [txHash, setTxHash] = useState("");
  const [success, setSuccess] = useState(false);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  function LockAsset(event: { preventDefault: () => void }): void {
    event.preventDefault();

    if (!provider || !account) {
      window.alert("Wallet not connected");
      return;
    }

    async function add_asset(amt: number): Promise<void> {
      const token_address = isEth
        ? "0x0000000000000000000000000000000000000000"
        : "0xC4800955340B980286d961EDEcf173ddeAb747eC";
      const amount_string = ethers.utils.parseEther(amt.toString());
      const passphrase_hash = ethers.utils.formatBytes32String(passpharse);
      const isSwap = false;
      const swap_address = "0x0000000000000000000000000000000000000000";
      const swap_amount = "0";

      if (provider) {
        try {
          const signer = await provider.getSigner(account);
          const contract = new ethers.Contract(contract_address, contract_abi, signer);
          const erc20 = new ethers.Contract(token_address, erc20_abi, signer);

          if (!isEth && !approved) {
            const allowance = await erc20.allowance(account, contract_address);
            if (ethers.BigNumber.from(allowance).lt(amount_string)) {
              const approve_tx = await erc20.approve(contract_address, amount_string);
              setLoading(true);
              approve_tx.wait().then(() => {
                setApproved(true);
                setLoading(false);
              });
            }
          } else {
            const tx = await contract.add_asset_to_contract(
              token_address,
              amount_string,
              passphrase_hash,
              receiver,
              isSwap,
              swap_address,
              swap_amount,
              {
                value: isEth ? amount_string : ethers.utils.parseEther("0")
              }
            );
            message.info(`Success!\n\nTx Hash: ${tx.hash}`);
            setTxHash(tx.hash);
            setSuccess(true);
          }
        } catch (error) {
          if (typeof error === "string") {
            message.error("Error!" + `\n\n${error}`);
          } else if (error instanceof Error) {
            message.error("Error!" + `\n\n${error.message}`);
            // console.log(error);
          }
        }
      }
    }

    if (amount && receiver) add_asset(amount);
  }

  return (
    <div style={{ width: "100%", minWidth: "250px" }}>
      <Stack spacing={3} align={"center"}>
        <div style={{ display: "inline-flex", gap: "10px", width: "80%" }}>
          <Input
            focusBorderColor="darkblue"
            variant="filled"
            placeholder="Address"
            size="lg"
            onChange={(e) => setReceiver(e.target.value)}
          />
        </div>
        <div style={{ width: "80%" }}>
          <InputGroup size="lg" gap={10}>
            <NumberInput style={{ width: "100%" }} variant="filled" focusBorderColor="darkblue">
              <HStack style={{ position: "relative" }}>
                <NumberInputField placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                <div style={{ position: "absolute", right: "1%" }}>
                  <Select
                    bgColor={"blue.700"}
                    color={"white"}
                    // variant="filled"
                    style={{ borderRadius: "20px" }}
                    size="sm"
                    onChange={(e) => {
                      setIsEth(e.target.value == "eth" ? true : false);
                    }}
                  >
                    <option value="eth">
                      <img src="https://s2.coinmarketcap.com/static/img/coins/200x200/1027.png" /> ETH
                    </option>
                    <option value="erc20">ERC20</option>
                  </Select>
                </div>
              </HStack>
            </NumberInput>
          </InputGroup>
        </div>
        <div style={{ width: "80%" }}>
          <Input
            focusBorderColor="darkblue"
            variant="filled"
            placeholder="Passpharse"
            size="lg"
            onChange={(e) => setPasspharse(e.target.value)}
          />
        </div>
        <div style={{ width: "80%" }}>
          <Button
            // colorScheme={isEth || approved ? "purple" : "facebook"}
            colorScheme={"facebook"}
            size="lg"
            width={"100%"}
            onClick={(e) => LockAsset(e)}
            isLoading={loading}
          >
            {isEth || approved ? "Send" : "Approved"}
          </Button>
        </div>
        <Stack spacing={3} style={{ width: "100%", color: "black" }}>
          {success && (
            <Alert status="success">
              <AlertIcon />
              Success! Tx Hash: {txHash}
            </Alert>
          )}
        </Stack>
      </Stack>
    </div>
  );
};

export default Lock;

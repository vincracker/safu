import { useState } from "react";

import { Input, Stack, Button, AlertIcon, Alert } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import { message } from "antd";
import { ethers } from "ethers";

import contract_abi from "../../../abi/SaFuSend.json";
import { contract_address } from "../../../utils/constant";

// import { useNativeBalance } from "../../../hooks/useNativeBalance";
// import { parseBigNumberToFloat } from "../../../utils/formatters";

// const styles = {
//   buttonTransfer: {
//     display: "flex",
//     margin: "15px 0"
//   }
// } as const;

const Unlock: React.FC = () => {
  const { account, provider } = useWeb3React();
  const [passpharse, setPasspharse] = useState("");
  const [txHash, setTxHash] = useState("");
  const [success, setSuccess] = useState(false);

  function UnlockAsset(event: { preventDefault: () => void }): void {
    event.preventDefault();

    if (!provider || !account) {
      window.alert("Wallet not connected");
      return;
    }

    async function claim_asset(pass: string): Promise<void> {
      const passphrase_hash = ethers.utils.formatBytes32String(pass);

      if (provider) {
        try {
          const signer = await provider.getSigner(account);
          const contract = new ethers.Contract(contract_address, contract_abi, signer);
          const tx = await contract.claim_asset(passphrase_hash);
          message.info(`Success!\n\nTx Hash: ${tx.hash}`);
          setTxHash(tx.hash);
          setSuccess(true);
        } catch (error) {
          if (typeof error === "string") {
            message.error("Error!" + `\n\n${error}`);
          } else if (error instanceof Error) {
            message.error("Error!" + `\n\n${error.message}`);
          }
        }
      }
    }

    if (passpharse) claim_asset(passpharse);
  }

  return (
    <div style={{ width: "100%", minWidth: "250px" }}>
      <Stack spacing={3} align={"center"}>
        <div style={{ width: "80%" }}>
          <Input variant="outline" placeholder="Passpharse" size="lg" onChange={(e) => setPasspharse(e.target.value)} />
        </div>

        <div style={{ width: "80%" }}>
          <Button
            colorScheme="purple"
            size="lg"
            width={"100%"}
            onClick={(e) => {
              UnlockAsset(e);
            }}
          >
            Unlock
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

export default Unlock;

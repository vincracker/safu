import React from "react";

import { ChakraProvider } from "@chakra-ui/react";
import { Web3ReactProvider } from "@web3-react/core";
import { createRoot } from "react-dom/client";

import App from "./App";
import connectors from "./connectors";
import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Web3ReactProvider connectors={connectors}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </Web3ReactProvider>
  </React.StrictMode>
);

import React from "react";

import { ApolloProvider } from "@apollo/client";
import { Web3ReactProvider } from "@web3-react/core";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import connectors from "./connectors";
import client from "./utils/client";

import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Web3ReactProvider connectors={connectors}>
      <BrowserRouter>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </BrowserRouter>
    </Web3ReactProvider>
  </React.StrictMode>
);

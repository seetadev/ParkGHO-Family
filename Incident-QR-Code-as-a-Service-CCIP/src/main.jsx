import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
} from "react-router-dom";
import App from "./App";
import { store } from "./services/store";
import { Web3ModalProvider } from "./components/QR-Code-Dapp/Web3WalletProvider";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Web3ModalProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </Web3ModalProvider>
    </Router>
  </React.StrictMode>
);
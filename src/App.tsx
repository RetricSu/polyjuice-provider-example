import { ContractFactory, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import "./App.css";
import {
  polyjuiceWallet,
  polyjuiceWeb3HttpProvider,
  polyjuiceWeb3,
  ethersWeb3Provider,
  createEthersSignerWithMetamask,
  SIMPLE_STORAGE_V2_ABI,
  SIMPLE_STORAGE_V2_BYTECODE,
  polyjuiceJsonRpcProvider,
} from "./godwoken";

// !do not use dotenv in production,
// react will build this env var into build files
// thus that everyone will see it
require("dotenv").config();

function App() {
  const [scriptHash, setScriptHash] = useState<string>();
  const [encodeArgs, setEncodeArgs] = useState<string>();
  const [deployedContractAddress, setDeployedContractAddress] = useState<string>();

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getScriptHashByAccountId(0x0);
    ecodeArgs();
  };

  const getScriptHashByAccountId = (id: number) => {
    polyjuiceWeb3HttpProvider.godwoker
      .getScriptHashByAccountId(id)
      .then((result) => {
        setScriptHash(result);
      });
  };

  const ecodeArgs = () => {
    const data = polyjuiceWallet.godwoker.encodeArgs({
      from: "",
      to: "",
      gas: "",
      gasPrice: "",
      data: "",
      value: "",
    });
    console.log("ethers ecode data:", data);

    const data2 = polyjuiceWeb3HttpProvider.godwoker.encodeArgs({
      from: "",
      to: "",
      gas: "",
      gasPrice: "",
      data: "",
      value: "",
    });
    console.log("web3 ecode data:", data2);

    if (data === data2) {
      setEncodeArgs(data);
    } else {
      setEncodeArgs(
        "polyjuiceWeb3HttpProvider encodeArgs is not equal to polyjuiceWallet encodeArgs. failed."
      );
    }
  };

  const deployContractWithEtherContractFactory = async () => {
    const signer = await createEthersSignerWithMetamask();
    
    const contractDeployer = new ContractFactory(
      SIMPLE_STORAGE_V2_ABI,
      SIMPLE_STORAGE_V2_BYTECODE,
      signer
    );
    let overrides = {
      gasLimit: 0x54d30,
      gasPrice: 0x0,
      value: 0x0,
    };
    const contract = await contractDeployer.deploy(overrides);
    await contract.deployed();
    // ! please do not use `contract.address` as contractAddress here. 
    // due to an known issue, it is wrong eth address in polyjuice. 
    const txReceipt: any = await polyjuiceJsonRpcProvider.godwoker.eth_getTransactionReceipt(contract.deployTransaction.hash);
    console.log(`txReceipt: ${JSON.stringify(txReceipt, null, 2)}`);
    setDeployedContractAddress(txReceipt.contractAddress);
  }

  const sendTxUsingWeb3WithMetamaskSigning = async () => {
    const tx = {
      from: "0xFb2C72d3ffe10Ef7c9960272859a23D24db9e04A",
      to: deployedContractAddress,
      value: "0x00",
      data: "0x00",
      gas: "0x3da0ad",
      gasPrice: "0x00",
    };
    polyjuiceWeb3.eth.sendTransaction(tx).then((result) => {
      console.log(result);
    });
  };

  const sendTxUsingEthersWithMetamaskSigning = async () => {
    const tx = {
      from: "0xFb2C72d3ffe10Ef7c9960272859a23D24db9e04A",
      to: deployedContractAddress,
      value: "0x00",
      data: "0x00",
      gas: "0x3da0ad",
      gasPrice: "0x00",
    };
    const params = [tx];
    const transactionHash = await ethersWeb3Provider.send(
      "eth_sendTransaction",
      params
    );
    console.log("transactionHash is " + transactionHash);
  };

  const sendTxUsingEthersContractWithMetamaskSigning = async () => {
    const signer = await createEthersSignerWithMetamask();
    const simpleStorageV2Contract = new ethers.Contract(
      deployedContractAddress!,
      SIMPLE_STORAGE_V2_ABI,
      signer
    );
    let overrides = {
      gasLimit: 0x54d30,
      gasPrice: 0x0,
      value: 0x0,
    };
    const txResponse = await simpleStorageV2Contract.set(
      process.env.REACT_APP_ETH_ADDRESS,
      overrides
    );
    console.log(txResponse);
  };

  return (
    <div className="App">
      <header>
        <a
          className="App-link"
          href="https://github.com/jjyr/godwoken-testnet"
          target="_blank"
          rel="noopener noreferrer"
        >
          Godwoken Polyjuice E2E Tester 
        </a>
        <p>Account 0x0 Script Hash: {scriptHash}</p>
        <p>encodeArgs for empty eth tx: {encodeArgs}</p>
        <p>
          <button onClick={deployContractWithEtherContractFactory}>
          deployContractWithEtherContractFactory
          </button>
        </p>
        <p>
          deployed contract address: {deployedContractAddress}
        </p>
        <p>
          <button onClick={sendTxUsingWeb3WithMetamaskSigning}>
            sendTxWithMetamaskSigning
          </button>
        </p>
        <p>
          <button onClick={sendTxUsingEthersWithMetamaskSigning}>
            sendTxUsingEthersWithMetamaskSigning
          </button>
        </p>
        <p>
          <button onClick={sendTxUsingEthersContractWithMetamaskSigning}>
            sendTxUsingEthersContractWithMetamaskSigning
          </button>
        </p>
      </header>
    </div>
  );
}

export default App;

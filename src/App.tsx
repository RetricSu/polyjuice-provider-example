import { ContractFactory, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import "./App.css";
import { AbiItems } from "@polyjuice-provider/base";
import {
  polyjuiceWallet,
  polyjuiceWalletWebsocket,
  polyjuiceWebsocketProvider,
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
  const [deployedContractAddress, setDeployedContractAddress] =
    useState<string>();

  const ETH_ADDRESS = process.env.REACT_APP_ETH_ADDRESS;

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
    const txReceipt: any =
      await polyjuiceJsonRpcProvider.godwoker.eth_getTransactionReceipt(
        contract.deployTransaction.hash
      );
    console.log(`txReceipt: ${JSON.stringify(txReceipt, null, 2)}`);
    setDeployedContractAddress(txReceipt.contractAddress);
  };

  const sendTxUsingWeb3WithMetamaskSigning = async () => {
    const tx = {
      from: ETH_ADDRESS,
      to: deployedContractAddress || process.env.REACT_APP_EXAMPLE_CONTRACT_ADDRESS,
      value: "0x00",
      data: "0x00", // todo: replace valid data
      gas: "0x3da0ad",
      gasPrice: "0x00",
    };
    polyjuiceWeb3.eth.sendTransaction(tx).then((result) => {
      console.log(result);
    });
  };

  const sendTxUsingEthersWithMetamaskSigning = async () => {
    const tx = {
      from: ETH_ADDRESS,
      to: deployedContractAddress || process.env.REACT_APP_EXAMPLE_CONTRACT_ADDRESS,
      value: "0x00",
      data: "0x00", // todo: replace valid data
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

  const sendTxUsingWeb3ContractWithMetamaskSigning = async () => {
    const simpleStorageV2Contract = new polyjuiceWeb3.eth.Contract(
      SIMPLE_STORAGE_V2_ABI as AbiItems,
      deployedContractAddress || process.env.REACT_APP_EXAMPLE_CONTRACT_ADDRESS
    );
    const txReceipt = await simpleStorageV2Contract.methods.set(ETH_ADDRESS).send({
      from: ETH_ADDRESS,
      gas: 0x54d30,
      gasPrice: 0x0,
    });
    console.log('txReceipt =>', txReceipt);
    alert(JSON.stringify(txReceipt, null, 2));
  };

  const sendTxUsingEthersContractWithMetamaskSigning = async () => {
    const signer = await createEthersSignerWithMetamask();
    const simpleStorageV2Contract = new ethers.Contract(
      (deployedContractAddress || process.env.REACT_APP_EXAMPLE_CONTRACT_ADDRESS)!,
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

  const [newBlockNumber, setNewBlockNumber] = useState<number | string>();
  const [isStartSubscribeBlockNumber, setIsStartSubscribeBlockNumber] = useState<boolean>(false);
  const subscribeBlocks = () => {
    setIsStartSubscribeBlockNumber(true);
    polyjuiceWebsocketProvider.on("block", (data)=>{
      setNewBlockNumber(data);
    })
  }

  const sendTxUsingEthersContractWithPkWalletSigning = async () => {
    const simpleStorageV2Contract = new ethers.Contract(
      (deployedContractAddress || process.env.REACT_APP_EXAMPLE_CONTRACT_ADDRESS)!,
      SIMPLE_STORAGE_V2_ABI,
      polyjuiceWalletWebsocket
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

  const callUsingEthersContractWithPkWalletSigning = async () => {
    const simpleStorageV2Contract = new ethers.Contract(
      (deployedContractAddress || process.env.REACT_APP_EXAMPLE_CONTRACT_ADDRESS)!,
      SIMPLE_STORAGE_V2_ABI,
      polyjuiceWalletWebsocket
    );
    const txResponse = await simpleStorageV2Contract.get();
    console.log(txResponse);
  };

  const [isWebsocketConnected, setIsWebsocketConnected] = useState(true);
  const [runningTime, setRunningTime] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      if(isWebsocketConnected)
        setRunningTime(prevCount => prevCount + 1);
    }, 1000);
    polyjuiceWebsocketProvider._websocket.onclose = function(){
      setIsWebsocketConnected(false);
      clearInterval(timer);
    };
    return () => {
      clearInterval(timer);
    };
  }, []); 

  return (
    <div className="App">
      <header>
        <a
          className="App-link"
          href="https://github.com/nervosnetwork/polyjuice-provider"
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
        <p>deployed contract address: {deployedContractAddress || "not yet"}</p>
        <p>
          <button onClick={sendTxUsingWeb3ContractWithMetamaskSigning}>
            sendTxUsingWeb3ContractWithMetamaskSigning
          </button>
        </p>
        <p>
          <button onClick={sendTxUsingEthersContractWithMetamaskSigning}>
            sendTxUsingEthersContractWithMetamaskSigning
          </button>
        </p>
        <h4>==== below is websocket session ====</h4>
        <p>websocket status: { isWebsocketConnected ? "connected" : "disconnected" } , running time: {runningTime} s</p>
        <p>
          <button onClick={sendTxUsingEthersContractWithPkWalletSigning}>
            sendTxUsingEthersContractWithPkWalletSigning
          </button>
        </p>
        <p>
          <button onClick={callUsingEthersContractWithPkWalletSigning}>
            callUsingEthersContractWithPkWalletSigning
          </button>
        </p>
        <p>
          <button onClick={subscribeBlocks}>
            subscribeBlocks
          </button>
          <p> subscribe status: {isStartSubscribeBlockNumber && isWebsocketConnected ? "running" : "unsubscribe"} </p>
          <h4>new Block Number: {newBlockNumber}</h4>
        </p>
      </header>
    </div>
  );
}

export default App;

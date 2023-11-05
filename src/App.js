import React, { useState } from "react";
import Web3 from 'web3';
import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar";
import Create from "./components/Create";
import Home from "./components/Home";

import NFTABI from "./abis/NFT.json";
import MarketPlaceABI from "./abis/NFTMarketPlace.json";

const NFTAddress = "0x62631be376094208c4310DcB8ef89cbB793611b6";
const MarketPlaceAddress = "0xbD80456b0D931b14963E0c182b743BD90A5aa298";


function App() {

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nft, setNft] = useState();
  const [marketPlace, setMarketPlace] = useState();

  async function web3Handler() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccount(newAccounts[0]);
        });
  
        window.ethereum.on('chainChanged', (chainId) => {
          window.location.reload();
        });
  
        loadContracts();
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      console.error('MetaMask not found. Please install MetaMask.');
    }
  }
  
  async function loadContracts() {
    const web3 = window.web3;
    const marketplace = new web3.eth.Contract(MarketPlaceABI, MarketPlaceAddress);
    setMarketPlace(marketplace);
  
    const nft = new web3.eth.Contract(NFTABI, NFTAddress);
    setNft(nft);
    setLoading(false);
  }
  

  return (
    <React.Fragment>
      <Navbar web3Handler={web3Handler} account={account} />
      {loading ? (<h1 className="text-center text-2xl mt-48">⌛Please Sign In with metamask to continue...</h1>)
        :
        <Routes>
          <Route path="/" element={<Home marketPlace={marketPlace} nft={nft} account={account} />} />
          <Route path="/create" element={<Create nft={nft} marketPlace={marketPlace} account={account} />} />
        </Routes>
      }
    </React.Fragment>
  );
}

export default App;

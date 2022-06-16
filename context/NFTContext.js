import React,{ useState, useEffect } from "react";
import Web3Modal from 'web3modal';
import { ethers } from "ethers";
import axios from "axios";
import { create as ipfsHttpClient } from 'ipfs-http-client';

import { MarketAddress, MarketAddressABI } from './constants';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const nftCurrency = 'ETH';

  const checkIfWalletIsConnected = async () => {
    //check if metamask is installed
    if (!window.ethereum) return alert('Please install MetaMask to continue.');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No accounts found.')
    }
  }

  useEffect(()=>{
    checkIfWalletIsConnected();
  },[])

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask to continue.');

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    setCurrentAccount(accounts[0]);

    window.location.reload();
  }

  const uploadToIPFS = async (file) => {
    try{
      const added = await client.add({ content: file });

      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      return url;
    } catch (error) {
      console.log('Error uploading file to ipfs.');
    }
  };

  const createNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;

    if(!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image:fileUrl });

    try{
      //upload image to ipfs
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      //create the sale transaction
      await createSale(url,price);

      router.push('/');
    }catch(error){
      console.log(error);
      console.log('Error uploading file to ipfs.');
    }
  }

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    //convert ether to blockchain readable amount, wei/gwei
    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    const contract = fetchContract(signer);
    //get listing price of 0.025 ethers
    const listingPrice = await contract.getListingPrice();

    //form the transaction
    const transaction = await contract.createToken(url, price, { value: listingPrice.toString() });

    await transaction.wait();
  }

  const fetchNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider();  // fetch ALL nft on marketplace, not just the nft that belongs to you
    const contract = fetchContract(provider);

    const data = await contract.fetchMarketItems();
    
    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice})=>{
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: {image, name, description} } =  await axios.get(tokenURI); //get name, desc, price
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI
      };
    }));

    return items;
  }

  const fetchMyNFTsOrListedNFTs = async (type) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const data = type === 'fetchItemsListed' ? 
      await contract.fetchItemsListed() : 
      await contract.fetchMyNFTs();

    //format the data into readable form
    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice})=>{
      const tokenURI = await contract.tokenURI(tokenId);
      const { data: {image, name, description} } =  await axios.get(tokenURI); //get name, desc, price
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI
      };
    })); 
    
    return items;
  }

  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount, uploadToIPFS, createNFT, fetchNFTs,
     fetchMyNFTsOrListedNFTs }}>
      {children}
    </NFTContext.Provider>
  )
};
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Web3 } from 'web3';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const web3 = new Web3(window.ethereum);

const pinataApiKey = process.env.pinataApiKey;
const pinataSecretApiKey = process.env.pinataSecretApiKey;

const Create = ({ account, nft, marketPlace }) => {
  const navigate = useNavigate();
  const [image, setImage] = useState();
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [price, setPrice] = useState();

  const uploadToIPFS = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    if (!file) {
      alert("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        maxContentLength: 'Infinity', // Required to handle large files
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey,
        },
      });

      setImage(`https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
    } catch (error) {
      console.error("Error while uploading image to Pinata", error);
    }
  }

  const createNFT = async (e) => {
    e.preventDefault();
  
    if (!name || !description || !image) {
      console.error("Name, description, and image are required.");
      return;
    }
  
    const data = {
      "name": name,
      "description": description,
      "image": image
    };
  
    // Convert data to JSON format
    const jsonData = JSON.stringify(data);
  
    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });
  
    try {
      // Upload the JSON file to IPFS
      const formData = new FormData();
      formData.append('file', blob, 'metadata.json');
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        maxContentLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey,
        },
      });
  
      const metadataURI = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
     
      mintThenList(metadataURI)
    } catch (error) {
      console.error("Error while uploading metadata to Pinata", error);
    }
  };
  
  async function mintThenList(metadataURI) {

    const uri = metadataURI;
    // mint NFT
    try {
      const mintTransaction = nft.methods.mint(uri).send({ from: account });
      await mintTransaction;
    
    } catch (error) {
      console.error('Error minting NFT:', error);
      return;
    }
  
    // set approval for the marketplace
    try {
      const setApprovalTransaction = nft.methods.setApprovalForAll(marketPlace.options.address, true).send({ from: account });
      await setApprovalTransaction;
    } catch (error) {
      console.error('Error setting approval for marketplace:', error);
      return;
    }
  
  //List NFT
    try {
      const listingPrice = web3.utils.toWei(price.toString(), 'ether');
      const id = await nft.methods.currentTokenCount().call();
     
      const makeItemTransaction = marketPlace.methods.makeItem(nft.options.address, id, listingPrice).send({ from: account });
      await makeItemTransaction;
    } catch (error) {
      console.error('Error listing NFT:', error);
      return;
    }
  
    navigate('/');
  }  

  return (
    <React.Fragment>
      <div className="container mx-auto">
        <div className="max-w-xl p-5 mx-auto my-10 bg-white rounded-md shadow-sm">
          <div className="text-center">
            <h1 className="my-3 text-3xl font-semibold text-gray-700">Create & Mint NFT</h1>
          </div>
          <div>
            <div className="mb-6">
              <input
                type="file"
                name="image"
                required
                className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                onChange={uploadToIPFS}
              />
            </div>
            <div className="mb-6">
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                onChange={(e) => { setName(e.target.value) }}
              />
            </div>
            <div className="mb-6">
              <textarea
                rows="5"
                name="description"
                placeholder="Description"
                required
                className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                onChange={(e) => { setDescription(e.target.value) }}
              ></textarea>
            </div>
            <div className="mb-6">
              <input
                type="number"
                name="price"
                placeholder="Price In ETH"
                required
                className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                onChange={(e) => { setPrice(e.target.value) }}
              />
            </div>
            <div className="mb-6">
              <button
                className="w-full px-2 py-4 text-white bg-indigo-500 rounded-md focus:bg-indigo-600 focus:outline-none"
                onClick={createNFT}
              >
                Create & Mint
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Create;

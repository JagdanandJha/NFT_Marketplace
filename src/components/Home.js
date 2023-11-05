import React, {  useEffect, useState } from 'react';
import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

const Home = ({ marketPlace, nft, account }) => {
    
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  const loadMarketplaceItems = async () => {
 
    const itemCount = await marketPlace.methods.getItemCount().call();
  
    let items = [];
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketPlace.methods.getItems(i).call();
  
      const nftSummary = await nft.methods.nftDetail(item.itemId).call();
  
      if (!item.sold) {
        try {

          const response = await fetch(nftSummary);
          if (response.ok) {
            const metadata = await response.json();
  
            const totalPrice = await marketPlace.methods.getTotalPrice(item.itemId).call();
  
            items.push({
              totalPrice,
              itemId: item.itemId,
              seller: item.seller,
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
            });
          } else {
            console.error('Failed to fetch metadata from IPFS:', response.statusText);
          }
        } catch (error) {
          console.error('An error occurred while fetching metadata:', error);
        }
      }
    }
  
    setLoading(false);
    setItems(items);
  };
  

  const buyMarketItem = async (item) => {
    alert("We are taking only 1% roality of NFT's total price")
    const itemOwner = await nft.methods.ownerOf(item.itemId).call();
    
    if (itemOwner.trim().toLowerCase() === account.trim().toLowerCase()) {
      alert("You are the owner of this NFT. You cannot buy your own NFT.");
    } else {

      const gasPrice = await web3.eth.getGasPrice();
      let dataa = await marketPlace.methods.purchaseItem(item.itemId).encodeABI();
      console.log(item.totalPrice)

      const rawTransaction = {
        from: account,
        gasPrice: gasPrice,
        gas: 6500000,
        to: marketPlace.options.address,
        data: dataa,
        value:item.totalPrice,
        chainId: 11155111
      };
      const signedTx = await web3.eth.sendTransaction(rawTransaction);
      alert("NFT Purchased Successfully");
      loadMarketplaceItems();
    }
  }

  useEffect(() => {
    loadMarketplaceItems()
  },[]);

  return (
      <React.Fragment>
              <div className="flex flex-wrap justify-evenly mt-40">
              {
              loading ? (<h1 className='text-2xl text-center mt-48'>⌛ Loading Items...</h1>)
                  : (
                      (items) ? items.map((item, id) => {
                          return (
                                  <div className="w-100 rounded overflow-hidden shadow-lg ml-6 mb-10 w-72">
                                      <img className="w-full h-52" src={item.image} alt="post-img" />
                                      <div className="px-6 py-4">
                                          <div className="font-bold text-xl text-center">{item.name}</div>
                                          <p className="text-gray-700 text-base mt-6">
                                              {item.description}
                                          </p>
                                      </div>
                                      <div className='w-full p-2 bg-blue-600'>
                                          <button className='w-full font-bold text-center text-white bg-gray' onClick={()=>buyMarketItem(item)}>{`Buy for ${web3.utils.fromWei(item.totalPrice, 'ether')} ETH`}</button>
                                      </div>
                                  </div>
                          )
                      })
                      : (<h1 className='text-2xl text-center mt-48'>There is no item to show.</h1>)
                  )
          }
          </div>
      </React.Fragment>
  )
}

export default Home;



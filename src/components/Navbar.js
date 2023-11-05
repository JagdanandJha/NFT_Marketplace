import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = ({ web3Handler, account }) => {

    return (
        <React.Fragment>

            <nav className="flex items-center justify-between flex-wrap  p-3 mx-10  top-0 left-0 right-0">
                <div className='flex text-3xl'>
                    NFT MARKETPLACE
                </div>
                <div className='flex text-l text-gray-500'>
                    <Link to="/"><h1 className='mr-6'>HOME</h1></Link>
                    <Link to="create"><h1 className='mr-6'>MINT & SELL NFT</h1></Link>
                </div>
              
                {
                    account ?(<button className="h-10 px-5 text-gray-500  border border-black rounded-lg" >{account.slice(0,5) + "..." + account.slice(38,42)} </button>) 
                        : (<button className="h-10 px-5 text-gray-500  border border-black rounded-lg" onClick={web3Handler}>Connect Wallet</button>)
                }
            </nav>
        </React.Fragment>
    )
}

export default Navbar




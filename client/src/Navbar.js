import React, { useState, useEffect } from 'react'
import axios from './axios'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'

import { maticaddress } from './config'
import MaticPrice from './artifacts/src/contracts/MaticPrice.sol/MaticPrice.json'
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { solid, regular, brands } from '@fortawesome/fontawesome-svg-core/import.macro'

let rpcEndpoint = "https://polygon-mumbai.infura.io/v3/0c928750a74b4464bbe01fe61286f7a7"
function Navbar(props) {

    const [revenueEarned, setRevenueEarned] = useState(0.00)
    const [mPrice, setmPrice] = useState()
    const [username, setUsername] = useState()

    useEffect(() => {
        getUserReveune()
    })
    async function getUserReveune() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()
        const result = await axios.get(`/post/userRevenue/${signerAddress}`)
        console.log(result)
        setRevenueEarned(result.data.data.Totalrevenue)
        const provider1 = new ethers.providers.JsonRpcProvider(rpcEndpoint)
        const MaticContract = new ethers.Contract(maticaddress, MaticPrice.abi, provider1)
        const maticPrice = await MaticContract.getLatestPrice()
        console.log(maticPrice.toNumber())
        setmPrice(maticPrice.toNumber()/100000000)
    }
    return (
        <div class="bg-gray-50 sticky w-full top-0 z-10 border-gray-100 border-b-2 dark:bg-gray-900 mb-5">
            <div class="ml-5 flex flex-row">
                <div class="flex-grow">
                    <img className="mt-2 w-16 md:w-32" src="./memeandearn.png"/>
                    <div className="mt-2 mb-4 space-x-3 sm:space-x-5 font-sans">
                        <a class="hover:text-pink-500" href="/">Home</a>
                        <a class="hover:text-pink-500" href="/create-meme">Create meme</a>
                        <a class="hover:text-pink-500" href="/mymemes">My memes</a>
                        <a class="hover:text-pink-500" href="/mycollection">My collection</a>
                        <a class="hover:text-pink-500" href="/faucet">Faucet</a>
                        <a class="hover:text-pink-500" href="/profile">My Profile</a>
                    </div>
                </div>
                <div class="m-2 p-3">
                    <h3 class="mb-2">Your Earnings: {revenueEarned} BRO</h3>
                    <h3 class="mb-2">MATIC PRICE : {mPrice} USD</h3>
                    <div class="flex">

                        {
                            props.theme === "light"? <svg onClick={props.toggleTheme} class="h-8 w-8 text-black"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="8" cy="12" r="2" />  <rect x="2" y="6" width="20" height="12" rx="6" /></svg>:
                            <svg onClick={props.toggleTheme}  class="h-8 w-8 text-white"  width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="16" cy="12" r="2" />  <rect x="2" y="6" width="20" height="12" rx="6" /></svg>
                        }
                        
                            <h3 class="ml-2 mt-1 font-sans">{props.theme === "light"? "Dark": "Light"} theme</h3>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}
export default Navbar
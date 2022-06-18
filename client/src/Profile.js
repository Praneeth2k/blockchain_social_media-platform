import React, {useState, useEffect} from 'react'
import axios from './axios'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'

import {tokenaddress, memeitaddress} from './config'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'

function Profile() {
    const [revenueEarned, setRevenueEarned] = useState(0.00)
    const [username, setUsername] = useState("")
    const [alreadyWithdrawn, setAlreadyWithdrawn] = useState(0)

    useEffect(() => {
        getUserReveune()
    }, [])
    async function getUserReveune() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()

        const result = await axios.get(`/post/userRevenue/${signerAddress}`)
        console.log(result)
        setRevenueEarned(result.data.data.Totalrevenue)

        const userInfo = await axios.get(`/user/walletaddress/${signerAddress}`)
        if(userInfo.data.data){
            let wa = userInfo.data.data.totalWithdrawAmount
            let un = userInfo.data.data.username
            if(!wa){
                wa = 0
            }
            setAlreadyWithdrawn(wa)
            if(!un){
                un = "" 
            }
            setUsername(un)
        }
        console.log(userInfo)
    }

    async function handleSubmit() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()

        //const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
        
        let rev = Math.floor(revenueEarned)
        const memeitContract = new ethers.Contract(memeitaddress, Memeit.abi, signer)
        await memeitContract.withdrawTokens(tokenaddress, signerAddress, rev)
        await axios.patch(`/user/withdrawAmount/`, {accountAddress: signerAddress,withdrawAmount: revenueEarned - alreadyWithdrawn})
        getUserReveune()
    }

    async function saveUsername() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()
        // const update = JSON.stringify({
        //     accountAddress: signerAddress,
        //     username
        // })
        await axios.patch('/user/userProfile', {accountAddress: signerAddress,
            username})
    }

    return (
        <div>
            <div class="bg-slate-700 w-full py-10 px-10">
  <div>
    <div class="sm:flex space-x-7 md:items-start items-center">
      <div class="mb-4">
        <img class="rounded-md md:w-80" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/768px-Circle-icons-profile.svg.png" alt="" />
      </div>
      <div>
        <h1 class="text-slate-100 text-4xl font-bold my-2">{username}</h1>
        
        <input
        placeholder='Username'
        className="mt-2 border rounded p-2 dark:bg-gray-700"
        onChange={e => setUsername(e.target.value)}
        />
        <button className= "bg-blue-500 ml-2 rounded-lg p-1 text-white text-base" onClick={saveUsername}>Save username</button>
      </div>
    </div>
  </div>
  <div class="mt-8 sm:grid grid-cols-3 sm:space-x-4">
    <div class="bg-slate-600 p-6 rounded-md mb-4">
      <span class="text-slate-400 text-md">MEME AND EARN</span>
      <h2 class='mt-3'>BRO Token contract: <a class="text-blue-600" target="_blank" href="https://mumbai.polygonscan.com/address/0x94E723b6fE116E20752D20df549f12f58De45D23">BRO Token</a></h2>
      <h2>Import this token address in your wallet to check if you recieved the tokens: 0x94E723b6fE116E20752D20df549f12f58De45D23</h2>
    </div>
  </div>
  <div class="sm:grid lg:grid-cols-4 grid-cols-2 sm:gap-x-4">
    <div class="flex justify-between items-center bg-slate-600 p-6 rounded-md mb-4">
      <div>
        <span class="text-md text-slate-400">Earned</span>
        <h1 class="text-3l font-bold text-slate-100">{revenueEarned} BRO</h1>
      </div>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    </div>
    <div class="flex justify-between items-center bg-slate-600 p-6 rounded-md mb-4">
      <div>
        <span class="text-md text-slate-400">Withdrawn:</span>
        <h1 class="text-3l font-bold text-slate-100">{alreadyWithdrawn} BRO</h1>
      </div>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
    </div>
    <div class="flex justify-between items-center bg-slate-600 p-6 rounded-md mb-4">
      <div>
        <span class="text-md text-slate-400">Withdrawable:</span>
        <h1 class="text-3l font-bold text-slate-100">{revenueEarned - alreadyWithdrawn} BRO</h1>
      </div>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    </div>
    <div class="flex justify-between items-center bg-slate-600 p-6 rounded-md mb-4">
      <div>
        <span class="text-md text-slate-400 mr-4">Withdraw</span>
        <button onClick = {handleSubmit} className= "bg-red-500 rounded p-1 text-white mt-2 text-base">Withdraw {revenueEarned - alreadyWithdrawn}</button>
      </div>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      </div>
    </div>
    
  </div>
</div>
        </div>
    )
}

export default Profile

import React, {useState, useEffect} from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Web3Modal from 'web3modal'

import { useNavigate } from 'react-router-dom'


import {
    nftaddress, memeitaddress, tokenaddress
} from './config'

import NFT from './artifacts/src/contracts/NFT.sol/NFT.json'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'
import axios from './axios'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

function CreateMeme() {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', title: '', revenueShare: 0})
    const [error, setError] = useState(null)
    const [msg, setMsg] = useState(null)
    const [processing1, setProcessing1] = useState(null)
    const [processing2, setProcessing2] = useState(null)


    let navigate = useNavigate();

    async function onChange(e) {
        const file = e.target.files[0]

        try {
            const added = await client.add(
                file,
                 {
                     progress: (prog) => console.log(`recieved: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createMemeNFT() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const { title, price, revenueShare } = formInput
        

        if(!title || !price || !revenueShare) {
            setError("Enter all fields")
            return
        }
        if(!fileUrl) {
            setError("Upload image")
            return
        }
        if(isNaN(price)){
            setError("Price incorrect, enter a number")
            return
        }
        if(price<0){
            setError("Please set a positive price")
            return
        }

        if(isNaN(revenueShare)){
            setError("Enter an integer between 1 and 100 for reveune share")
            return
        }
        if(revenueShare<0 || revenueShare>100 || !Number.isInteger(Number(revenueShare))){
            setError("Enter an integer between 1 and 100 for reveune share")
            return
        }
        setError(null)

        setProcessing1("true")
        const signerAddress = await signer.getAddress()
        console.log("signerAddress", signerAddress)

        const data = JSON.stringify({
            user: signerAddress, title, price, revenueShare: formInput.revenueShare, image: fileUrl
        })
        


        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`

            createSale(url, signer)
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
        
    }

    async function createSale(url, signer) {
        // const web3Modal = new Web3Modal()
        // const connection = await web3Modal.connect()
        // const provider = new ethers.providers.Web3Provider(connection)
        // const signer = provider.getSigner()

        console.log("nftAdd:", nftaddress)

        let contract= new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()
        console.log(tx)
        
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        setProcessing1("done")
        setProcessing2("true")

        let price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(memeitaddress, Memeit.abi, signer)
        transaction = await contract.createNFT(nftaddress, tokenId, formInput.revenueShare, price)

        

        // Add created meme to mongoDB
        // memeId, originalSeller, currentOwner
        tx = await transaction.wait() 
        
        event = tx.events[0]
        value = event.args.memeId
        const memeId = value.toNumber()
        const signerAddress = await signer.getAddress()

        const post = JSON.stringify({
            memeId,
            likes: 0,
            views: 0,
            totalRevenue: 0,
            originalSeller: signerAddress,
            currentOwner: signerAddress,
            revenueShare: formInput.revenueShare,
            revenueGenerated: {}
        })

        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        console.log(post)
        setProcessing2("done")

        await axios.post('/post', post, config).then(res => console.log(res)).catch(err => console.log(err))

        

        navigate('/')
    }

    return (
        
<div>
  <div class="md:grid md:grid-cols-3 md:gap-6">
    <div class="md:col-span-1">
      <div class="px-4 sm:px-0">
      <h1 class="text-lg ">After clicking post meme you will be asked to approve 2 transactions</h1>
        <h1 class="mt-3">Transaction 1: For minting NFT {processing1? processing1==="true"? <span class="bg-yellow-500 rounded p-1 ml-2">Processing...</span>:<span class="bg-green-400 rounded p-1 ml-2">Done</span>:null}</h1>
        <h1>Transaction 2: For putting your meme on sale {processing2? processing2==="true"? <span class="bg-yellow-500 rounded p-1 ml-2">Processing...</span>:<span class="bg-green-400 rounded p-1 ml-2">Done</span>:null}</h1>

        <h1 class="mt-4">NFT contract for minting: <a href='https://mumbai.polygonscan.com/address/0x1f3c3587d794ab223644b0619d94Db79777d41dB' target="_blank" class="text-blue-600">NFT contract</a></h1>
        <h1>Platform contract for creating sale: <a href='https://mumbai.polygonscan.com/address/0x13eC2C89EcE4e36F45E4b89eCd79182E8E68a11C' target="_blank" class="text-blue-600">Platform contract</a></h1>
      </div>
    </div>
    <div class="mt-5 md:mt-0 md:col-span-2">
    <h1 className="ml-2 mt-3 text-2xl text-pink-500 mb-4">Create a meme</h1>
      <form action="#" method="POST">
        <div class="shadow sm:rounded-md sm:overflow-hidden">
          <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
            <div class="grid grid-cols-3 gap-6">
              <div class="col-span-3 sm:col-span-2">
                <label for="company_website" class="block text-sm font-medium text-gray-700">
                  Title
                </label>
                {error? <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong class="font-bold">{error}</strong>

                            <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                                
                            </span>
                            </div>:
                        null
                }
                <div class="mt-1 flex rounded-md shadow-sm">
                <input 
                placeholder="Title"
                className="mt-4 border rounded p-4 dark:bg-gray-800  w-96"
                onChange={e => updateFormInput({ ...formInput, title: e.target.value })}
                />
                </div>
              </div>
            </div>

            <div>
              <label for="about" class="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                    placeholder="Price in MATIC"
                    className="mt-2 border rounded p-4 dark:bg-gray-800 w-96"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
              <p class="mt-2 text-sm text-gray-500">
                Set a low price so others can buy your meme. Ex: 0.1 or 0.025
              </p>
            </div>

            <div>
              <label for="about" class="block text-sm font-medium text-gray-700">
                Revenue
              </label>
              <input
                    placeholder="Percentage revenue for buyer"
                    className="mt-2 border rounded p-4 dark:bg-gray-800  w-96"
                    onChange={e => updateFormInput({ ...formInput, revenueShare: e.target.value })}
                 />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">
               Choose the file to be uploaded
              </label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="True">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <input
                        type="file"
                        name="Asset"
                        className="my-4"
                        onChange={onChange}
                        /><span></span>
                    </label>
                  </div>
                  <p class="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                {
                fileUrl && (
                    <img className="rounded mt-4" width="350" src={fileUrl} />
                )
                }
              </div>
              
            </div>
          </div>
          <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button onClick={createMemeNFT} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Post meme
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
    )
}

export default CreateMeme

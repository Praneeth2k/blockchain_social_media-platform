import React, {useState, useEffect} from 'react'
import Meme from './Meme'

import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import axiosInstance from './axios'

import {nftaddress, memeitaddress} from './config'

import NFT from './artifacts/src/contracts/NFT.sol/NFT.json'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'


// let rpcEndpoint = null
let rpcEndpoint = "https://polygon-mumbai.infura.io/v3/0c928750a74b4464bbe01fe61286f7a7"


if (process.env.REACT_APP_WORKSPACE_URL) {
    rpcEndpoint = process.env.REACT_APP_WORKSPACE_URL
} 

function Memes() {
    const [memes, setMemes] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [time, setTime] = useState(Date.now());


    useEffect(() => {
        loadMemes() 
        const interval = setInterval(() => setTime(Date.now()), 4000);
        return () => {
            clearInterval(interval);
        };
    }, [time])

    async function loadMemes() {
        console.log(rpcEndpoint)
        
        const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
        const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const memeitContract = new ethers.Contract(memeitaddress, Memeit.abi, provider)
        const data = await memeitContract.fetchAllMemes()
        console.log(data)

        // Get all memes
        const database = await axiosInstance.get('/post')
        console.log(database)
        
        const dataItems = database.data.data.data

        const memeItems = await Promise.all(dataItems.map(async i => {
            let meta
            let price
            let tokenUri
            let sold
            let currentOwner
            let originalSeller
            let percentageRevenue
            for(const post of data) {
                if(post.memeId.toNumber() === i.memeId) {
                    tokenUri = await nftContract.tokenURI(post.tokenId)
                    meta = await axios.get(tokenUri)
                    console.log(meta)
                    price = ethers.utils.formatUnits(post.price.toString(), 'ether')
                    originalSeller = post.originalSeller
                    currentOwner = post.currentOwner
                    percentageRevenue = post.percentageRevenueForCurrentOwner.toNumber()
                    sold = post.sold
                    console.log(tokenUri)
                    let meme = {
                        _id: i._id,
                        user: meta.data.user,
                        price,
                        memeId: i.memeId,
                        originalSeller,
                        currentOwner,
                        image: meta.data.image,
                        title: meta.data.title,
                        percentageRevenue,
                        sold,
                        likes: i.likes,
                        views: i.views,
                        totalRevenue: i.totalRevenue,
                        revenueShare: i.revenueGenerated
                    }
                    console.log(meme)
                    return meme
                    
                }
            }
        }))

        setMemes(memeItems)
        setLoadingState('loaded')
    }

    async function buyNFT(nft) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(memeitaddress, Memeit.abi, signer)

        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const transaction = await contract.buyNFT(nftaddress, nft.memeId, {value:price})
        await transaction.wait()

        const signerAddress = await signer.getAddress()
        console.log(nft._id)

        await axiosInstance.patch(`/post/${nft._id}`, {currentOwner: signerAddress}, {headers: {'Content-Type': 'application/json'}})
        loadMemes()
    }

    if (loadingState === 'loaded' && !memes.length) return (<h1 className="px-20 py-10 text-3xl">No memes</h1>)


    return (
        <div class="grid grid-cols-12 gap-0 dark:bg-black">
            <div class= "ml-2  sticky col-span-3 " >
                <img class="mt-20 max-w-xs" src="./ad1.png" alt="ad1"/>
                <img class="mt-56 max-w-xs" src="./ad2.jpeg" alt="ad2"/>
            </div>
            <div class="m-auto col-span-6">
                <div class=" border-gray-200 border-2 border-t-0 max-w-2xl">
                    {
                        memes.map((meme, i) => (<Meme meme={meme} buyNFT={buyNFT} option="1" key={i}/>))
                    }

                </div>
            </div>
            <div class="col-span-3 ">
                <img class="mt-20 max-w-xs m-auto" src="./ad3.png" alt="ad3"/>
            </div>
        </div>
    )
}

export default Memes

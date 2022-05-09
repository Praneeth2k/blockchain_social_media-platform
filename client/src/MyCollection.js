import React, {useState, useEffect} from 'react'
import Meme from './Meme'

import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import axiosInstance from './axios'

import {nftaddress, memeitaddress} from './config'

import NFT from './artifacts/src/contracts/NFT.sol/NFT.json'
import Memeit from './artifacts/src/contracts/Memeit.sol/Memeit.json'



function MyCollection() {
    const [memes, setMemes] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => {
        loadMemes()
    }, [])

    async function loadMemes() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const signerAddress = await signer.getAddress()

        const memeitContract = new ethers.Contract(memeitaddress, Memeit.abi, signer)
        const nftContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await memeitContract.fetchMyNFTs()

        const database = await axiosInstance.get('/post')
        console.log(database)
        
        let dataItems = database.data.data.data

        
        let myDataItems = []
        for(const d of dataItems){
            if(d.currentOwner == signerAddress){
                myDataItems.push(d)
            }
        }
        
        
        

        const memeItems = await Promise.all(myDataItems.map(async i => {
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
        console.log(memeItems)
        setMemes(memeItems)
        setLoadingState('loaded')
    }
        // const memeItems = await Promise.all(data.map(async i => {
        //     let _id
        //     let likes
        //     let views
        //     let revenueShare

        //     const memeId = i.memeId.toNumber()
        //     dataItems.forEach((post) => {
        //         if(post.memeId === memeId) {
        //             _id = post._id
        //             likes = post.likes
        //             views = post.views
        //             revenueShare = post.revenueGenerated
        //         }
        //     })
        //     console.log("_id is ", _id)
        //     const tokenUri = await nftContract.tokenURI(i.tokenId)
        //     const meta = await axios.get(tokenUri)
        //     let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        //     console.log(meta.data.image)

        //     let meme = {
        //         _id,
        //         user: meta.data.user,
        //         price,
        //         memeId,
        //         originalSeller:  i.originalSeller,
        //         currentOwner: i.currentOwner,
        //         image: meta.data.image,
        //         title: meta.data.title,
        //         percentageRevenue: i.percentageRevenueForCurrentOwner.toNumber(),
        //         sold: i.sold,
        //         likes,
        //         views,
        //         revenueShare
        //     }

        //     return meme
        // }))
        // console.log(memeItems)

        // setMemes(memeItems)
        // setLoadingState('loaded')
    // }

    async function sellNFT(nft, newPrice) {
        console.log(newPrice)
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(memeitaddress, Memeit.abi, signer)

        const price = ethers.utils.parseUnits(newPrice.toString(), 'ether')
        const transaction = await contract.sellNFT(nftaddress, nft.memeId, price)
        await transaction.wait()


        loadMemes()
    }


    if (loadingState === 'loaded' && !memes.length) return (<h1 className="px-20 py-10 text-3xl">No memes</h1>)


    return (
        <div class="m-auto mt-0 max-w-lg border-2 border-t-0">
            <h1 className="ml-2 pt-4">Memes you own</h1>
            {
                memes.map((meme, i) => (<Meme meme={meme} sellNFT={sellNFT} option="3" key={i}/>))
            }
        </div>
    )
}

export default MyCollection

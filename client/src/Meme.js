import React, {useState, useEffect} from 'react'
import axios from './axios'
import axiosInstance from './axios'

function Meme(props) {
    let meme = props.meme
    let buyNFT = props.buyNFT
    let sellNFT = props.sellNFT
    const revenueShare = meme.revenueShare

    const [price, setPrice] = useState(null)
    const [username, setUsername] = useState(null)
    const [revenueDistribution, setRevenueDistribution] = useState([]) 

    useEffect(() => {
        getUsername()
    }, [])

    async function getUsername() {
        const u = await axios.get(`/user/walletaddress/${meme.user}`)
        if(u.data.data){
            setUsername(u.data.data.username)
        }
        let toBeSetRevenueDistributionArray = []
        for (const key in revenueShare){
            console.log(key)
            let username = key
            const userProfile = await axiosInstance.get(`/user/walletaddress/${key}`)
            if(userProfile){
                console.log(userProfile)
                if(userProfile.data.data){
                    if(userProfile.data.data.username){
                        username = userProfile.data.data.username
                    }
    
                }
            }
            toBeSetRevenueDistributionArray.push({username: username, revenueShare: revenueShare[key]})
            
        }
        setRevenueDistribution(toBeSetRevenueDistributionArray)
        
        // await Promise.all(revenueShare.forEach(async (value, key, map) => {
        //     const username = await axiosInstance.get(`/user/walletaddress/${key}`)
        //     setRevenueDistribution([...revenueDistribution, {[username]: value}])
        // }))
    }

    function renderBottom() {
        if(props.option === "1"){
            return buyMeme
        } else if(props.option === "3"){
            return sellMeme
        } else return null
    }

    // async function getRevenue(address){
    //     const u = await axios.get(`/user/${address}`)
    //     if(u.data.data){
    //         return u.data.data.username
    //     } else return address
    // }

    // function revenueDistribution() {
    //     if(!revenueShare){
    //         return null
    //     }
        
    //     return <div class="mt-2 mb-2">
    //         <h2 class="font-semibold">Revenue distribution (Total: {meme.totalRevenue} BRO)</h2>
    //         {
    //             Object.keys(revenueShare).map((key, i) => {
                    
    //                 return(
    //                 <p key={i}>
    //                     <span>{key}: {revenueShare[key]} BRO</span>
    //                 </p>
    //             )})
    //         }
            
    //     </div>
    // }

    const buyMeme = 
        <div class="flex space-x-2 justify-center">
            {meme.sold? <span class="text-xs py-1.5 px-2.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-600 text-white rounded-full m-5">Meme Not for sale</span>:
            <div class="flex space-x-2 justify-center">
            <div>
              <button type="button" class="px-6 pt-2.5 pb-2 bg-blue-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out flex align-center m-5" onClick = {()=>buyNFT(meme)}>
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="download"
                  class="w-3 mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path fill="currentColor"
                    d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z">
                  </path>
                </svg>
                Buy Meme
              </button>
            </div>
          </div>
            
            }
        </div>

    // const  = 
    //     <div>
    //         <button className="bg-red-500" onClick = {()=>buyNFT(meme)}>Buy meme</button>
    //     </div>

    const sellMeme = 
        <div class = "mt-1">
            <input 
                placeholder="Set Price"
                className="mt-2 border rounded p-4 dark:bg-gray-800  w-96 m-1"
                onChange={(e) => setPrice(e.target.value)}
            />
            <button className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 m-1" onClick = {()=>sellNFT(meme, price)}>Sell meme</button>
        </div>
        

    

    return (
        <div class="border-gray-200 border-b-2 hover:bg-gray-50 dark:hover:bg-gray-900 ">
        <h2 class="font-medium leading-tight text-base mt-0 mb-2 text-blue-600 font-sans">/{username? username:meme.user}</h2>
        <h3 class="text-center font-serif">{meme.title}</h3>
        <div class="flex justify-center m-5">
        <div class="rounded-lg shadow-lg bg-white max-w-lg">
            <a href="#!">
            <img class="rounded-t-lg" src={meme.image} alt=""/>
            </a>
        </div>
        </div>
        <div class="flex space-x-5 mt-3 justify-center">
                <div class="flex hover:translate-y-2">
                    <h3 class="text-blue-600">{meme.likes} </h3>
                    <svg class="ml-1 h-5 w-5 text-blue-500"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                </div>

                <div class="flex">
                    <h3 class="text-yellow-500">{meme.views}</h3>
                    <svg class="ml-1 h-5 w-5 text-yellow-500"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />  <circle cx="12" cy="12" r="3" /></svg>
                </div>

                <h3>Price: {meme.price} MATIC</h3>
                <h3>Revenue share: {meme.percentageRevenue}% </h3>
        </div>
            
            {/* {revenueDistribution} */}
            <div class="mt-2 mb-2">
                <h2 class="font-semibold">Revenue distribution (Total: {meme.totalRevenue} BRO)</h2>

                {revenueDistribution.map(ele => {
                    return (
                    <p>
                        <span>{ele.username}: {ele.revenueShare} BRO</span>
                    </p>
                    )
                })}
            </div>
            {
                renderBottom()
            }
        </div>
    )
}

export default Meme

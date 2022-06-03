import catchAsync from "../utils/catchAsync.js"
import User from "./../models/User.js"
import factory from './handlerFactory.js'

const getUser = 
    catchAsync(async(req,res,next) => {
        const accountAddress = req.params.user
        const userProfile = await User.findOne({accountAddress})
        res.status(200).json({
            status: 'success',
            data: userProfile
        })     
    })

const updateUser = 
    catchAsync(async(req,res,next) => {
        const accountAddress = req.params.user

        // If netWithdrawAmount needs to be updated
        // if(req.body.netWithdrawAmount){
        //     const withdrawAmount = req.body.withdrawAmount
        //     const userProfile = await User.findOne({accountAddress})
        //     let newWithdrawAmount
        //     if(userProfile){
        //         newWithdrawAmount = userProfile.totalWithdrawAmount + withdrawAmount 
        //     } else {
        //         newWithdrawAmount = withdrawAmount
        //     }
        //     req.body.withdrawAmount = netWithdrawAmount
        // }
        const resp = await User.findOneAndUpdate({accountAddress}, req.body, {new:true, upsert:true})
        res.status(200).json({
            status: 'success',
            data: {
                resp
            }
        })
    })

export default {getUser, updateUser}
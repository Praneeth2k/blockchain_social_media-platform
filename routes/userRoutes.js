import express from "express"

import userController from "./../controllers/userController.js"


const router = express.Router()

router
    .route('/walletaddress/:user')
    .get(userController.getUser)
    .patch(userController.updateUser)

router
    .route('/userProfile')
    .patch(userController.updateUserProfile)


router
    .route('/withdrawAmount')
    .patch(userController.updateWithdrawAmount)

export default router;




import express from "express"

import userController from "./../controllers/userController.js"


const router = express.Router()

router
    .route('/walletaddress/:user')
    .get(userController.getUser)
    .patch(userController.updateUser)

export default router;




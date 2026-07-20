import { Router } from "express";
import { loginUser, logoutUser, resiterUser,refreshAcessToken, changeCurrentpassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import multer from "multer";

const router = Router();
 
router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage", 
        maxCount:1
    }
]),resiterUser)

 router.route("/login").post(loginUser)


 // secure routes 
 router.route("/logout").post(verifyJWT,logoutUser)

 router.route("/refresh-token").post(refreshAcessToken)


 router.route("/change-password").post(verifyJWT,changeCurrentpassword)

 router.route("/current-user").post(verifyJWT,getCurrentUser)

 router.route("/update-account").patch(verifyJWT,updateAccountDetails)
 router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

 router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUsercoverImage)
   
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)



 


export default router
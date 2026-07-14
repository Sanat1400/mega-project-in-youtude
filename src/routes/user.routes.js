import { Router } from "express";
import { loginUser, logoutUser, resiterUser,refreshAcessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

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


export default router
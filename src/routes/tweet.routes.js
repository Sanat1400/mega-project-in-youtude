import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";

import {deleteTweet, getUserTweet, updateTweet} from "../controllers/tweet.controller.js"


const router = Router();


router.use(verifyJWT);

router.route("/user/:userId").get(getUserTweet)

router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
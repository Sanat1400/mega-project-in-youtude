import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";

import { toggleCommentLike, toggleVideoLike ,toggleTweetLike, getLikedVideo} from "../controllers/likecontroller";

const router = Router();

router.use(verifyJWT);

router.route("/toogle/v/:videoId").post(toggleVideoLike);

router.route("/toogle/c/:commentId").post(toggleCommentLike)

router.route("/toogle/t/:tweetId").post(toggleTweetLike)

router.route("/videos").get(getLikedVideo)


export default router




 
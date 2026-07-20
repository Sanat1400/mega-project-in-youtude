import { Router } from "express";
import {deletVideo, getAllVideo, getVideoById, togglePublishStatus, updateVideo}  from "../controllers/video.controller.js"
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()


router.use(verifyJWT);


router
     .route("/")
     .get(getAllVideos)
     .post(upload.fields([
        {
            name:"videoFile",maxCount:1,
        },
        {
            name:"thumbnail",maxCount:1,
        },]), 
        publishAVideo
    );

router.route("/:videoId").get(getVideoById).delete(deletVideo).patch(upload.single("thumbnail"),updateVideo);


router.route("/toogle/publish/:videoId").patch(togglePublishStatus);



export default router



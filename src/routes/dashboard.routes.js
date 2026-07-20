import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";

import { getChannelstats, getChannelVideo, } from "../controllers/dashboard.controller";

const router = Router();

router.use(verifyJWT);

router.route("/starts").get();

router.route("/stats").get(getChannelstats);
router.route("/videos").get(getChannelVideo);



export default router

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import  {createPlaylist, getplayListbyId, getUserPlaylist, removeVideoFromPlayList, updatePlaylist} from "../controllers/playlistcontroller"
 



const router = Router();
router.use(verifyJWT);

router.route("/").post( createPlaylist)

router.route("/:playlistId").get(getplayListbyId).patch(updatePlaylist);

router.route("/remove/:videoId/:playListId").patch(removeVideoFromPlayList);

router.route("/user/:userId").get(getUserPlaylist)


export default router
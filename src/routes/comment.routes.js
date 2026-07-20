import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { getVideoComments,addComment, deleteComment, updateComment } from "../controllers/comment.controller";



const router = Router();
router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(addComment);

router.route("/c/:coomentId").delete(deleteComment).patch(updateComment);


export default router
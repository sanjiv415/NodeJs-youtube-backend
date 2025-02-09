import { Router } from 'express';
import {
    publishVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    deleteVideo,
    getAllVideos,
} from "../controllers/video.controllers.js"
import verifyJwt from '../middelwere/auth.middelwere.js';
import upload from '../middelwere/multer.middelwere.js';

const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router
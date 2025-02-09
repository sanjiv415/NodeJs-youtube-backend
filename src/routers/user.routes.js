import { Router } from "express";
import upload from "../middelwere/multer.middelwere.js";
import { 
    registerUser,
    login,
    logout,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory } from "../controllers/user.controllers.js";

    import verifyJwt from "../middelwere/auth.middelwere.js";

const router = Router()

router.route("/register").post(
    upload.fields(
        [
            {
                name : "avatar",
                maxCount : 1
                
            },
            {
                name : "coverImage",
                maxCount : 1
            }
        ]
    ),
    registerUser
)



router.route("/login").post(login)
router.route("/logout").post(verifyJwt, logout)
router.route("/change-password").post(verifyJwt, changePassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/update-account").patch(verifyJwt, updateAccountDetails)

router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJwt, getUserChannelProfile)
router.route("/history").get(verifyJwt, getWatchHistory)




export default router

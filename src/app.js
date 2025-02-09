import express, { urlencoded } from "express"
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()

// middlewere for config the application 
app.use(cors())
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb"}))
app.use(cookieParser())


// import router 
import userRouter from "./routers/user.routes.js"
import videoRouter from "./routers/video.routes.js"



// user routes

app.use("/api/v1/user",userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)





export default app;

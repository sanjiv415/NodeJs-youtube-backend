import jwt from "jsonwebtoken"
import { User } from "../models/users.model.js"

async function verifyJwt(req,res,next){

    try {
        const token = req.cookies?.accessToken

        if(!token){
            return res.status(400).json(
                {
                    message : "failed to get token "
                }
            )
        }

        const decodeToken =  jwt.verify(token,ACCESS_TOKEN_SECRET_KEY)

        const user = await User.findById(decodeToken._id).select(
            "-passeord refreshToken"
        )

        if(!user){
            return res.status(400).json(
                {
                    message : "failed to get user in middlewere"
                }
            )
        }
        req.user = user 
        next()

    } catch (error) {
        console.log(error)
        
    }

}

export default verifyJwt
    
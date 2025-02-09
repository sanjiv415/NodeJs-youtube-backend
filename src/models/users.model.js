import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(

    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
        },
        email : {
            type : String,
            required : [true , "email is required "],
            unique : true,
            lowercase : true,
        },
        fullname : {
            type : String,
            required : true,
            trim : true
        },
        avatar : {
            type : String , 
            required : true
        },
        coverImage : {
            type : String
        },
        password : {
            type : String,
            required : [true , "password is required "]
        },
        watchHistory : {
            type : mongoose.Schema.Types.ObjectId,
            ref  : "Video"
        },
        refreshToken : {
            type : String
        }
    },
    {
      timestamps : true
    }
)

userSchema.pre("save", async function (next) {
    if(this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password , 10)
     return next()
})

userSchema.methods.comparePassword = async function (password){
 return await   bcrypt.compare(password,this.password)
}

userSchema.methods.generatorAccessToken = async function (next){

    return jwt.sign(
      {
        _id : this._id,
        email: this.email,
        fullname : this.fullname,
        username : this.username
      },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn : "1d"
      }
    )
}

userSchema.methods.generatorRefreshToken = async function (next){

    return jwt.sign(
      {
        _id : this._id,
      },
      process.env.REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn : "10d"
      }
    )
}
export const User = mongoose.model("User", userSchema)
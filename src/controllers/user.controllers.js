import { User } from "../models/users.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"


async function generatorAccessAndRefreshToken (userId){
  
    try {
        
        const user = await User.findById(userId)
        const accessToken = user.generatorAccessToken()
        const refreshToken = user.generatorRefreshToken()

        user.refreshToken = refreshToken
        user.save({validateBeforeSave : true})

        return (accessToken , refreshToken)

    } catch (error) {
        console.log(error);
        
    }
}


async function registerUser(req, res) {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { username, email, fullname, password } = req.body

   try {
    if (
        [username, email, fullname, password].some((field) => field?.trim() === "")) {
        return res.status(400).json({
            message: "all fields are required "
        })
    }

    const existedUser = await User.findOne(
        {
            $or: [{ email }, { username }]
        }
    )
    if (existedUser) {
        return res.status(400).json(
            {
                message: "user already existed "
            }
        )
    }

    const avatarLocalPath = req.files?.avatar[0]?.path

    if (!avatarLocalPath) {
        return res.status(400).json(
            {
                message: "unable to get avatarlocal path"
            }
        )
    }

    const coverImageLocalPath = req.files?.coverImageLocalP[0]?.path

    if (!coverImageLocalPath) {
        return res.status(400).json(
            {
                message: "unable to get coverImageLocalP "
            }
        )

    }
    const avatarImage = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatarImage) {
        return res.status(400).json(
            {
                message: "unable to get avatarImage"
            }
        )

    }
    if (!coverImage) {
        return res.status(400).json(
            {
                message: "unable to get coverImage "
            }
        )

    }

    const registerUser = await User.create(
        {
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        }
    )

    if (!registerUser) {
        return res.status(400).json(
            {
                message: "user not register "
            }
        )
    }

    const user = await User.findById(user_id).select('-password -refershtoken',)

    return res.status(200).json({
        message: "user register successfully",
        user
    })
   } catch (error) {
    console.log(error);
    
   }

}

async function login(req, res){

    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

  try {
    const { email, username , password} =  req.body
  
  if(!email || !username || !password ){
    return res.status(400).json(
        {
            message : "all field are required   "
        }
    )
  }

  const user = await User.findOne(
    {
        $or : [{email},{username}]
    }
  )

  if(!user){
    return res.status(400).json({
        message : "user does not exit "
     }    
    )
  }

  const checkPassoword = await user.comparePassword(password)
 if(!checkPassoword){
    return res.status(400).json(
        {
            message : "passoword is incorrect"
        }
    )
 }

 const {accessToken , refreshToken} = await generatorAccessAndRefreshToken()
 
 if(!accessToken){
    return res.status(400).json(
        {
            message : "failed to get accessToken"
        }
    )
 }

 if(!refreshToken){
    return res.status(400).json(
        {
            message : "failed to get refreshToken"
        }
    )
 }

 const options = {
    httpOnly: true,
    secure: true
}

 return res
       .status(400)
       .cookie(accessToken,"accessToken",options)
       .cookie(refreshToken,"refeshToken",options)
       .json(
        {
            message : "user login successfully",
            user
        }
       )
  } catch (error) {
    console.log(error );
    
  }
  
}

async function  logout (req, res){
      try {
        await User.findByIdAndUpdate(
            req.user.user_id , 
            {
              $unset : {
                refreshToken : 1
              }
            },
            {
                new : true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
               .status(200)
               .clearCookie(accessToken , options)
               .clearCookie(refreshToken , options)
               .json(
                {
                    message : "user logout ",
                    user : req.user
                }
               )
      } catch (error) {
        console.log(error);
      }
}

async function changePassword (req, res){

    try {

        const { oldPassword , newPassoword } = req.body

        if(!oldPassword || !newPassoword ){
            return res.status(400).json(
                {
                    message : "all password fields are required "
                }
            )
        }

        const user = await User.findById(req.user._id)
        user.password = newPassoword
        User.save({validateBeforeSave:false})

        return res.status(200).json(
            {
                message : "password changed successfully"
            }
        )

    } catch (error) {
        console.log(error);
        
    }

}

async function getCurrentUser(req, res){
    return res.status(400).json(
        {
            message : "user fetched successfully",
            user : req.user
        }
    )
}

async function updateAccountDetails(req, res){
    try {
        const {fullname , email } = req.body

    if( !fullname || !email ){
        return res.status(400).json(
            {
                message : "all fields are required to update the user "
            }
        )
    }

  const user =   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                fullname : fullname ,
                email : email 
            }
        },
        {new : true }
    )

    if(!user ){
        return res.status(400).json(
            {
                message : "failed to update the user detailes "
            }
        )
    }

    return res.status(200).json(
        {
            message : "user details updated ",
            user 
        }
    )
    } catch (error) {
       console.log(error);
        
    }
}

async function updateUserAvatar(req,res){
    try {
        
        const avatarLocalPath = req.file?.path
        if(!avatarLocalPath){
            return res.status(400).json(
                {
                    message : "failed to get avatar local path in updated field "

                }
            )
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)
        if(!avatar){
            return res.status(400).json(
                {
                    message : "failed to get avatar in updated field "

                }
            )
        }

    const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set : {
                    avatar : avatar.url
                }
            },
            {
                new : true 
            }
        ).select("-password  -refreshToken")

        if( !user ){
            return  res.status(400).json(
                {
                    message : "failed to update user avatar "
                }
            )
        }

        return res.status(200).json(
            {
                message : "avatar has been updated ",
                user 
            }
        )
    } catch (error) {
        console.log(error);
        
    }
}

async function updateUserCoverImage(req,res){
    try {
        
        const coverImageLocalPath = req.file?.path
        if(!coverImageLocalPath){
            return res.status(400).json(
                {
                    message : "failed to get coverImageLocalPath local path in updated field "

                }
            )
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if(!coverImage){
            return res.status(400).json(
                {
                    message : "failed to get coverImageLocalPath in updated field "

                }
            )
        }

    const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set : {
                 coverImage : coverImage.url
                }
            },
            {
                new : true 
            }
        ).select("-password  -refreshToken")

        if( !user ){
            return  res.status(400).json(
                {
                    message : "failed to update user coverimage "
                }
            )
        }

        return res.status(200).json(
            {
                message : "coverImage has been updated ",
                user 
            }
        )
    } catch (error) {
        console.log(error);
        
    }
}

async function getUserChannelProfile(req , res ){
    const { username } = req.params

    if(username.trim() === ""){
        return res.status(400).json(
            {message : "username does not exit"}
        )
    }

    const channel = await User.aggregate(
        [
            {
                $match : username
            },
            {
                $lookup : {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
                }
            },
            {
                $lookup : {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriberto"
                }
            },
            {
                $addFields : {
                    subscribersCount : {
                        $size : "$subscribers"
                    },
                    channelsusciberscount : {
                        $size : "$subscriberto"
                    },
                    isSubscribed : {
                        $cond : {
                            $if : {$in : [req.user?._id , "$subscribers.subscriber"]},
                            then : true,
                            else : false
                        }
                    }
                    
                }
            },
            {
                $project : {
                    fullname : 1,
                    email : 1 ,
                    username : 1 , 
                    subscribersCount : 1 ,
                    channelsusciberscount : 1 ,
                    isSubscribed : 1 ,
                    avatar : 1
                }
            }
        ]
    )

    if(!channel){
        return res.status(400).json(
            {
                message : "failed to fetched user detailes "
            }
        )
    }

    return res.status(200).json(
        {
            message : "user detail fetched successfully ",
            channel
        }
    )
}

async function getWatchHistory(req , res){
    try {
         const watchHistory = await User.aggregate(
            {
                $match : {
                    _id : req.user._id
                }
            },
            {
                $lookup : {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline : {
                    $lookup : {
                        from : "users",
                        localField: "owner",
                        foreignField: "_id",
                         as: "owner",
                         pipeline : {
                            $project : {
                                fullname : 1,
                                username : 1,
                                avatar : 1


                            }
                         }
                    }
                }
                }
            },
            {
                $addFields : {
                    owner : {
                        $first : "$owner"
                    }
                }
            }
            
         )
         if(!watchHistory){
            return res.status(400).json(
                {
                    message : "failed to get watch history"
                }
            )
        }

        return res.status(200).json(
            {
                message : "fetched watch history successfully",
                watchHistory

            }
        )
    } catch (error) {
        console.log(error);
        
    }
    
}


export {
    registerUser,
    login,
    logout,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
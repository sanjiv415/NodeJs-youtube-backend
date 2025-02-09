import { Video } from "../models/video.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import User from "../models/users.model.js"
import mongoose from "mongoose";

async function publishVideo(req, res) {
    try {
        const { title, description } = req.body;
        // TODO: get video, upload to cloudinary, create video

        if ([title, description].some((fields) => fields.trim() === "")) {
            return res.status(400).json({
                message: "all fields are required when you are posting the video",
            });
        }

        const videoFileLocalPath = req.files?.videoFile[0].path;
        const thumbnailLocalPath = req.files?.thumbnail[0].path;

        if (!videoFileLocalPath) {
            return res.status(400).json({
                message: "failed to videofilelocalpath ",
            });
        }
        if (!thumbnailLocalPath) {
            return res.status(400).json({
                message: "failed to thumbnailLocalPath ",
            });
        }

        const videoFile = await uploadOnCloudinary(videoFileLocalPath);
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!videoFile) {
            return res.status(400).json({
                message: "failed to upload video on cloudinary",
            });
        }
        if (!thumbnail) {
            return res.status(400).json({
                message: "failed to thumbnail video on cloudinary",
            });
        }

        const uploadedVideo = await Video.create({
            title,
            description,
            duration: videoFile.duration,
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            owner: req.user?._id,
            isPublished: false,
        });
        if (!uploadedVideo) {
            return res.status(400).json({
                message: "failed to create video",
            });
        }
        const video = await Video.findById(uploadedVideo._id);

        return res.status(200).json({
            message: "video uploaded successfully",
            video,
        });
    } catch (error) {
        console.log(error);
    }
}

async function getVideoById(req, res) {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            return res.status(400).json({
                message: "videoId is not valid  ",
            });
        }

        const video = await Video.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                            pipeline: {
                                $addFields: {
                                    subscribersCount: {
                                        $size: "$subscribers",
                                    },
                                    isSubscribed: {
                                        $cond: {
                                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                                            then: true,
                                            else: false,
                                        },
                                    },
                                },
                            },
                            $project: {
                                username :1 ,
                                "avatar.url" : 1,
                                subscribersCount : 1,
                                isSubscribed : 1

                            },
                        },
                    },
                },
            },
            {
                $lookup : {
                    from : "likes",
                    localField : "_id",
                    foreignField : "video",
                    as : "likes"
                }
            },
            {
                $addFields : {
                    likesCount : {
                        $size : "$likes"
                    },
                    isLiked : {
                        $cond : {
                            if : {$in : [req.user?._id , "$likes.likedBy"]},
                            then : true,
                            else : false 
                        }
                    },
                    owner : {
                        $first : "$owner"
                    }
                }
            },
            {
                $project : {
                   "videofile.url": 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                comments: 1,
                owner: 1,
                likesCount: 1,
                isLiked: 1
                }
            }
        ]);

        if(!video){
            return res.status(400).json(
                {
                    message : "failded to fetch video "

                }
            )
        }

        await Video.findByIdAndUpdate(videoId,
            {
                $inc : {
                    views : 1
                }
            },
        ),

        await User.findByIdAndUpdate(req.user?._id ,
            {
                $addToSet : {
                    watchHistory : videoId
                }
            }
        )

        return res.status(200).json(
            {
                message : "video failed successfully",
                video
            }
        )
    } catch (error) {
        console.log(error);
    }
}

async function updateVideo (req , res){
     //TODO: update video details like title, description, thumbnail
    try {
        const { title , description } = req.body
        const { videoId } = req.params


        if(videoId){
            return res.status(400).json(
                {
                    message : "videoId is not valid "
                }
            )
        }

        if(!title || !description){
            return res.status(400).json(
                {
                    message : "all fields are required to fill"
                }
            )
        }

        const video = await Video.findById(videoId)

        
        if(video?.owner.toString() !== req.user?._id.toString()){
            "You can't edit this video as you are not the owner"
    
         }

        
      const thumbnailLocalPath = req.file?.path
      if(!thumbnailLocalPath){
        return res.status(400).json(
            {
                message : "thumbnail local not found "
            }
        )
      }

      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
      if(!thumbnail){
        return res.status(400).json(
            {
                message : "failed to update thumbnail on cloudinary"
            }
        )
      }

      
      const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set : {
                title,
                description,
                thumbnail : thumbnail.url

            }
        },
        {
            new : true 
        }
      )

      if(!updateVideo){
        return res.status(400).json(
            {
                message : "failed to update video "
            }
        )
      }

      return res.status(200).json(
        {
            message : "video updated successfully",
            updateVideo
        }
      )
    
    } catch (error) {
     console.log(error); 
    }
}

async function togglePublishStatus(req , res){
    try {
        const { videoId } = req.params
        
        if(!videoId){
         return res.status(400).json(
            {
                message : "videoId is not valid "
            }
         )
        }

        const video = await Video.findById(videoId)
        if(!video){
            return res.status(400).json(
                {
                    message : "video no found "
                }
            )
        }

        if(video?.owner.toString() !== req.user?._id.toString()){
            return res.status(400).json(
                {
                    message : "You can't toogle publish status as you are not the owner"
                }
            )
        }

        const togglePublished = await Video.findByIdAndUpdate(
            videoId,
            {
                $set : {
                    isPublished : !video?.isPublished
                }
            },
            {
                new : true
            }
        )

        if(!togglePublished){
            return res.status(400).json(
                {
                    message : "failed to toggel video"
                }
            )
        }

        return res.status(200).json(
            {
                message : "Video publish toggled successfully",
                isPublished : togglePublished.isPublished
            }
        )

    } catch (error) {
        console.log(error);
        
    }
}

async function deleteVideo(req , res){
    try {
        const { videoId } = req.params
        
        if(!videoId){
            return res.status(400).json(
                {
                    message : "videoId is not valid "
                }
            )
        }

        const video = await Video.findById(videoId)
        
        if(!video){
            return res.status(400).json(
                {
                    message : "video is not valid "
                }
            )
        }

        if( video?.owner.toString() !== req.user?._id.toString()){
            return res.status(400).json(
                {
                    message : "user does not have permission as user not uploaded video "
                }
            )
        }

        const deleteVideo = await Video.findByIdAndDelete(videoId)

        if(!deleteVideo){
            return res.status(400).json(
                {
                    message : "failed to delete video "
                }
            )
        }

        
    // delete video likes
    await Like.deleteMany({
        video: videoId
    })


    await Comment.deleteMany({
        video: videoId,
    })

    return res.status(200).json(
        {
            message : "video deleted successfully",
            deleteVideo
        }
    )
    } catch (error) {
        console.log(error);
    }
}

async function getAllVideos(req, res){
    try {
        const { page = 1 , limit = 10 , query, sortBy, sortType, userId} = req.query

        const pipeline = []

        if(query){
            pipeline.push(
                {
                    $search : {
                        "text": {
                         query : query,
                         path : ["title", "description"]
                    }
                }
            })
        }
      if(userId){
        pipeline.push(
            {
                $match : {
                    owner : new mongoose.Types.ObjectId(userId)
                }
            }
        )
      }
 
       pipeline.push(
        {
            $match : {
                isPublished : true
            }
        }
       )
      if(sortBy && sortType){
        pipeline.push(
            {
                $sort : {
                    [sortBy] : sortType === "asc" ? 1  : -1
              }
            }
        )
      }else {
        pipeline.push(
            {
                $sort : {
                    createdAt : -1
                }
            }
        )
      }
   
     pipeline.push(
        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "ownerDetails",
                pipeline : {
                    $project : {
                        username : 1,
                        avatar : 1
                    }
                }
            }
           
        },
        {
            $unwind : "$ownerDetails"
        }
     )

     const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    if(!video){
        return res.status(400).json(
            {
                message : "failed to fatch video"

            }
        )
    }

    return res.status(200).json(
        {
            message : "video fetched successfully",
            video
        }
    )
    } catch (error) {
        console.log(error);
        
    }
}


export { 
    publishVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    deleteVideo,
    getAllVideos,
};


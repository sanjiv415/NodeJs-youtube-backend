import mongoose from "mongoose";

async function dbConnect() {
  try {
    
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/youtube-backend`
    )
    
  console.log("database connected successfully !!! ");
  
  } catch (error) {
    console.log("mongodb error :", error);
  }
}

export default dbConnect;

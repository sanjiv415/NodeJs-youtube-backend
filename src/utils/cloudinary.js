import { v2 as cloudinary } from 'cloudinary';


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.cloud_name, 
        api_key: process.env.api_key, 
        api_secret: process.env.api_secret 
    });
    

   async function uploadOnCloudinary(localfilepath){

      try {
         if(!localfilepath) return null

       const response = await cloudinary.uploader.upload(localfilepath , {
        resource_type : 'auto'
       })

        fs.unlinkSync(localfilepath)

        return response;
        
      } catch (error) {
        console.log(error);
        fs.unlinkSync(localfilepath) 
      }
    }

    export default uploadOnCloudinary
   

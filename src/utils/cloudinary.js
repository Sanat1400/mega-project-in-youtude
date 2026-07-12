import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
cloudinary.config({
    cloud_name: "jqjwbaoz",
    api_key: "429226124136153",
    api_secret: "6JhTckODfSIaawNwlgscPGV3D2U"
});
console.log(process.env.CLOUDINARY_API_KEY);

const  uploadOnCloudinary = async (localFilepath)=>{
    try {
        if(!localFilepath) return null 
       const response = await cloudinary.uploader.upload(localFilepath,{
            resource_type:"auto"
        })
        console.log("file is upload  cloudinary ",response.url);
        fs.unlinkSync(localFilepath);
        return response;
    } catch (error) {
          console.log("Cloudinary Error:", error); 
        fs.unlinkSync(localFilepath) // remove the localiy saved tempory file as the kupload opertiron got falod
    }
}

export {uploadOnCloudinary}
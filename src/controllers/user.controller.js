import { asyncHandle } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/APiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from  "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const resiterUser = asyncHandle(async(req,res)=>{
     // get user detail from frontend 
     // vaildation -->> not empty 
     // check  if user alreadly exit :: username ,email 
     // check for images 
     // check for avatar 
     // upload them to cloudianry , avatar 
     // user odject ---> create entry in db 
     // remove password and referse token field from response 
     //  check reponse  user creation
     // retunr res 
    const {fullName , email , username,password} = req.body
      // if(fullName===""){
    //     throw  new ApiError(400,"full name is required")
    // }
    if(
        [fullName,email,password].some((field)=>
        field?.trim()==="")
    ){
          throw new ApiError(400,"All field are required")
    }
      const exiteduser = await User.findOne({
        $or: [{username},{email}]
      })

      if(exiteduser){
        throw new ApiError(409,"User with  email or usrename already exist ")
      }
      console.log("Body:", req.body);
      console.log("Files:", req.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
     if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is required")
     }

    const avatar = await  uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar File is required")
    }

     try {
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    console.log("User Created:", user);

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    console.log("Created User:", createduser);

    if (!createduser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200, createduser, "User registered successfully")
    );

} catch (err) {
    console.log("Create Error:", err);
    throw err;
}
     const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
     )
     if(!createduser){
        throw new ApiError(500,"something went wrrong resiter the user")
     }

     return res.status(201).json(
        new ApiResponse(200,createduser,"user resisted sucessfully ")
     )
      
})
export {resiterUser}



      
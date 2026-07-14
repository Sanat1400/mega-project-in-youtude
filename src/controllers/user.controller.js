import { asyncHandle } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/APiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from  "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefershToken = async(userId)=>
{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken ,refreshToken}

    } catch (error) {
        console.log(error)
        throw error;
        
    }
}

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


const loginUser = asyncHandle(async(req,res)=> {
    // req boby -> data
    // username or email 
    // find the user
    // password check
    // access and referseh token 
    // send cookiee 
    const {email,username,password} = req.body
    if(!(email || username)){
        throw new ApiError(400,"username or  password are required")
    }

    const user = await User.findOne({
        $or : [{username},{email}]
    })

    if(!user){
        throw new ApiError(404 ,"user not find")
    }

    const isPasswordValid =  await user.isPasswordCorrect(password)

     if(!isPasswordValid){
        throw new ApiError(401 ,"invalid user ")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefershToken(user._id)
    const loggedInUser   =  await User.findById(user._id)
    .select("-password -refreshToken")
    const option = {
        httpOnly :true,
        secure :true
    }
    return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
                
            },
            "user logged in succesfully "
        )
    )   
})
const logoutUser = asyncHandle(async (req,res)=>{
    await   User.findByIdAndUpdate(req.user._id,
    {
        $set:{
            refreshToken:undefined
        }

    },
    {
        new :true 
    }
    ) 
     const option = {
        httpOnly :true,
        secure :true
    }
    return res.status(200).clearCookie("accessToken",option)
    .clearCookie("refreshToken",option).json(new ApiResponse(200,{},"user Logged Out"))      
})
const refreshAcessToken = asyncHandle(async(req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
   try {
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     const user =  await User.findById(decodedToken?._id);
      if(!user){
         throw new ApiError(401,"Invail refer token ")
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
          throw new ApiError(401," Refersh Token is exprire ")
     }
       
     const option ={
         httpOnly : true,
         secure : true
     }
     const {accessToken,newrefreshToken} =await generateAccessAndRefershToken(user._id)
 
     return res
     .status(200)
     .cookie("acessToken",accessToken,option)
     .cookie("refershToken",newrefreshToken,option)
     .json(
         new ApiResponse(
             200,
             {accessToken,refreshToken:newrefreshToken},
             "acess Token refresh"
         )
     )
   } catch (error) {
    throw new ApiError(401,"Invalid refersh Token ")
    
   }
})
const changeCurrentpassword = asyncHandle(async(req,res)=>{
        const{oldPassword, newPassword}  = req.body
         const user = await User.findById(req.user?._id)
         const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)
         if(!isPasswordCorrect){
            throw new ApiError(400,"invalid password")
         }

         user.password = newPassword
         await  user.save({validateBeforeSave:false})

         return res.status(200).json(new ApiResponse(200,{},"password change sucessfully "))
})
const getCurrentUser = asyncHandle(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user fetch sucessfully")
})

const updateAccountDetails = asyncHandle(async(req,res)=>{
    const{ fullName, email} = req.body
    if(!(fullName || email)){
        throw new ApiError(400,"fullname and email are required")

    }

   const user =  User.findByIdAndUpdate(req.user?._id , {
       $set :{
        fullName ,
        email:email  
       }
   },{new :true}).select("-password ")


    return res
    .status(200)
    .json(new ApiResponse(200,"Account detail updated"))

})

const updateUserAvatar = asyncHandle(async(req,res)=>
{
    const avatarLocalPath =  req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
     const avatar =  await uploadOnCloudinary(avatarLocalPath);
     if(!avatar.url){
        throw new ApiError(400,"error while uploading")
     }

     const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
     ).select("-password")

     return res
     .status(200)
     .json(
        new ApiResponse(200,user,"avatar is updated sucellfully")
     )

})

 const updateUsercoverImage = asyncHandle(async(req,res)=>{
    const  coverImagelocalpath = req.file?.path
    if(!coverImagelocalpath){
        throw new ApiError(400,"cove Image is not found ")
    }

    const coverImage = uploadOnCloudinary(coverImagelocalpath);
    if(!coverImage.url){
        throw new ApiError(400," invalid in uploding  ")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {new :true}
    ).select("-password ")


     return res
     .status(200)
     .json(
        new ApiResponse(200,user,"coverImage is updated sucellfully")
     )


 })


 const getUserChannelProfile = asyncHandle(async(req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"username is not present")
    }

      const channel =  await User.aggregate([
        {
            $match:{
                username : username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscription",
                localField:"_id",
                foreignField:" subscriber",
                as:"SubscribedTo"

            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelSubscribedCount: {
                    $size:"$SubscribedTo"

                },
                isSubcribed:{
                    $cond:{
                        if: {$in : [req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName :1,
                username:1,
                subscribersCount :1,
                  channelSubscribedCount:1,
                  avatar:1,
                  coverImage:1,
                  email:1,
                  isSubcribed:1
            }
        }

      ])
     console.log(channel)

     if(!channel?.length){
        throw new ApiError(404,"channel does not exit")
     }

     return res 
     .status(200)
     .json(
        new ApiResponse(200,channel[0],"User channel fetched Succesfully")
     )

 })


export {resiterUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    changeCurrentpassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage
}




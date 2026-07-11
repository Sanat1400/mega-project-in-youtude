import { asyncHandle } from "../utils/asyncHandler.js";
const resiterUser = asyncHandle(async(req,res)=>{
     res.status(200).json({
        message:"cai aur code"
    })
  
})
export {resiterUser}



      
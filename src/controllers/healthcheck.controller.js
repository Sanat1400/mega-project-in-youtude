import mongoose from "mongoose";
import { asyncHandle } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";

const healthcheck = asyncHandle(async(req,res)=>{
      return res.status(200).json(new ApiResponse(200,"all are ok health"))


})
export {healthcheck}
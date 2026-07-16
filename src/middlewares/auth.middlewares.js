import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APiError.js";
import { asyncHandle } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandle(async (req, _, next) => {
    try {
        const authHeader = req.header("Authorization");

        const token =
            req.cookies?.accessToken ||
            (authHeader ? authHeader.split(" ")[1] : null);

        console.log("Authorization:", authHeader);  
        console.log("Token:", token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id)
            .select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();

    } catch (error) {
        console.log(error); 
        throw new ApiError(401, error.message || "Invalid access token");
    }
});
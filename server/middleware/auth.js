import User from "../models/user.models.js";
import jwt from "jsonwebtoken"

export const protectRoutes = async(req, res, next) => {
    try{
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.json({
                success: false,
                message: "user not found"
            })
        }
        req.user = user;
        next();
    }catch(err){
        console.log(err.message)
        res.json({
            success: false,
            message: err.message
        })
    }
}
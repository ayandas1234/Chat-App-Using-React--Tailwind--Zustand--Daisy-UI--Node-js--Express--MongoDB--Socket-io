import jwt from "jsonwebtoken"
import user from "../models/user.model.js"

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const currentUser = await user.findById(decoded.userId).select("-password");

        if(!currentUser){
            return res.status(401).json({ message: "User Not Found" });
        }

        req.user = currentUser;

        next();

    } catch (error) {
        console.log("Error In protectRoute Middleware: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
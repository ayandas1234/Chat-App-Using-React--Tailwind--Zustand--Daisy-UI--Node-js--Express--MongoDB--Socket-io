import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
    // res.send("signup route");
    const { fullName, email, password } = req.body; 
    
    try {
        // console.log(req.body);

        // all fields should be filled
        if (!fullName|| !email || !password) {
            return res.status(400).json({ message: "All Fields Required" });
        }

        // password length should't be less than 6
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // checking if same email already exist or not
        const user = await User.findOne({ email })

        if (user){return res.status(400).json({ message: "Email already exists" });}

        //hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // store the hashed password
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if (newUser) {
            // generate jwt token
            generateToken(newUser._id, res);
            await newUser.save(); // save the user into database

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            })
        } else {
            res.status(400).json({ message: "Invalid User Data" })
        }

    } catch (error) {
        console.log("Error in SignUp controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    // res.send("login route");
    const { email, password } = req.body;

    try {
        // checking if user exists or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({ message: "Invalid Credentials"})
        }
        
        // compare b/w hashed password from server and user input password if both matched then true
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid Credentials"})
        }

        // generate token
        generateToken(user._id, res);

        // sending user data
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    // res.send("logout route");

    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out Successfully" });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    // res.send("update profile route");

    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({ message: "Profile Pic is Required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in Update Profile", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
import userModel from "../modals/userModals.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";


//login function

const loginUser = async (req, res) => { 
    const {email, password} = req.body;

    try {
        const user = await userModel.findOne ({email});
        if(!user) {
            return res.status(404).json({message: "User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Invalid credentials"});
        }
        const token = creatToken(user._id);
        res.status(200).json({ success: true, token });
    }
    catch (error) {
        console.log(error);
        res.json({success: false, message: "Login failed"});
        
    }
}
//create token function
const creatToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"});
}

// REGISTER FUNCTION

const registerUser = async (req,res ) => {
    const {username, email, password} = req.body;
    
    try {
        const exists = await userModel.findOne({email});
        if(exists) {
            return res.status(400).json({message: "User already exists"});
        }

        //validation
         if (!validator.isEmail(email)) {
            return res.status(400).json({message: "Invalid email"});
        }
            if(password.length < 8) {
                return res.status(400).json({message: "Password must be at least 8 characters"});
            }

            //if Everything work fine
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);


            //new user created

            const newUser = await userModel.create({
                username,
                email,
                password: hashPassword,
            });

            const user = await newUser.save();

            const token  = creatToken(user._id);
            res.json ({success: true, token});
        
    } catch (error) {
         console.log(error);
         res.json({ success: false, message: "Login failed" });
        
    }
}

export {loginUser, registerUser};

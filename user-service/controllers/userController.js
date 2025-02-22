import validator from 'validator'
import bcrypt from "bcrypt";
import userModel from "../../database-service/models/userModel.js";
import jwt from 'jsonwebtoken'

//API to register User

const registerUser = async (req,res) => {
    try{

        const { name, email, password } = req.body

        // Checking for required fields
    if (
        !name ||
        !email ||
        !password )
        {
        return res.json({ success: false, message: "Missing Details" });
      }

     if (!validator.isEmail(email)) {
        return res.json({
            success: false,
            message: "Please Enter a Valid Email",
              });
            }

    // Validating strong password
    if (password.length < 8) {
        return res.json({
          success: false,
          message: "Please Enter a Strong Password",
        });
      }
    
    // Hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
  
        const userData = {
            name,
            email,
            password : hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET )

        res.json( {success:true,token})


    }

    catch (error){

        console.error("Error registering user:", error);
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

export {registerUser}
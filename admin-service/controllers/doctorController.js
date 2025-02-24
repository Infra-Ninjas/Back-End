import validator from "validator";
import bcrypt from "bcrypt";
//import { v2 as cloudinary } from '../../database-service/config/cloudinary.js';

//import cloudinary from "../../database-service/config/cloudinary.js";
//import doctorModel from "../../database-service/models/doctorModel.js";

//API to get all doctors list for admin panel

/*
const allDoctors = async (req,res) => {
    try{
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})

    }catch (error) {
        console.log(error)=
        res.json({success:false,message:error.message})

    }
    
} 
    */
//export {allDoctors}
export const allDoctors = async (req, res) => {
    try {
        console.log("Fetching doctors..."); // Debugging log
        const doctors = await doctorModel.find(); // Check database connection
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

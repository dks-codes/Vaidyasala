import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

/* REGISTER PATIENT */
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    aadhaar,
    role,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !aadhaar ||
    !role
  ) {
    return next(new ErrorHandler("Please fill full form!", 400));
  }
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exists!"), 400);
  }

  user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    aadhaar,
    role,
  });

  generateToken(user, "User Registered!", 200, res);
  /*res.status(200).json({
        success: true,
        message: "User Registered!"
    });*/
});

/* USER LOGIN */
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;
  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please Provide All Details!", 400));
  }

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password Do Not Match!", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Password or Email!", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password or Email!", 400));
  }

  if (role !== user.role) {
    return next(new ErrorHandler("User with this Role Not Found", 400));
  }

  generateToken(user, "User Logged in successfully!", 200, res);
  /*res.status(200).json({
        success: true,
        message: "User Logged in successfully!"
    })*/
});

/* ADD NEW ADMIN */
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, password, gender, dob, aadhaar } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !aadhaar
  ) {
    return next(new ErrorHandler("Please fill full form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(
        `${isRegistered.role} with this Email Already Exists!`,
        400
      )
    );
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    aadhaar,
    role: "Admin",
  });
  res.status(200).json({
    success: true,
    message: "New Admin Registered Successfully!",
  });
});

/* GET ALL DOCTORS */
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

/* GET USER DETAILS */
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user; //req.user is taken after the user is authenticated (isAdminAuthenticated,isPatientAuthenticated)
  res.status(200).json({
    success: true,
    user,
  });
});


/* TWO DIFFERENT LOGOUT AS WE ARE DEALING WE TWO DIFFERENT COOKIES (ADMIN,USER) */
/*  ADMIN LOGOUT */
export const logoutAdmin = catchAsyncErrors(async (req,res,next) => {
  res.status(200).cookie("adminToken", "", {                          //cookie("cookieName", cookieValue, {expires, httpOnly} )
    expires: new Date(Date.now()),
    httpOnly: true
  }).json({
    success: true,
    message: "Admin Logged Out Successfully!"
  })
});

/* PATIENT LOGOUT */
export const logoutPatient = catchAsyncErrors(async (req,res,next) => {
  res.status(200).cookie("patientToken", "", {                          //cookie("cookieName", cookieValue, {expires, httpOnly} )
    expires: new Date(Date.now()),
    httpOnly: true
  }).json({
    success: true,
    message: "Patient Logged Out Successfully!"
  })
});


/* ADD DOCTOR */
export const addNewDoctor = catchAsyncErrors(async(req,res,next) =>{
  if(!req.files || Object.keys(req.files).length === 0){
    return next( new ErrorHandler("Doctor Avatar Required!", 400));
  }
  const {docAvatar} = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if(!allowedFormats.includes(docAvatar.mimetype)){                                //docAvatar.mimetype gives the extension/type of image - jpeg, png, etc 
    return next( new ErrorHandler("File Format Not Supported!", 400));
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    aadhaar,
    doctorDepartment
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !aadhaar ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Provide All Details!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if(isRegistered){
    return next( new ErrorHandler(`${isRegistered.role} is already registered with this Email!`, 400));
  }

  const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
  if(!cloudinaryResponse || cloudinaryResponse.error){
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary Error");
  }

  console.log(cloudinaryResponse)

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    aadhaar,
    doctorDepartment,
    role: "Doctor",
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url : cloudinaryResponse.secure_url,
    }
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered!",
    doctor
  });

})
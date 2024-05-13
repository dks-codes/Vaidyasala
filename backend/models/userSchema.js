import mongoose, { mongo } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: [3, "First name must contain atleast 3 Characters!"],
  },
  lastName: {
    type: String,
    required: true,
    minLength: [3, "Last name must contain atleast 3 Characters!"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Please Provide A Valid Email!"],
  },
  phone: {
    type: String,
    required: true,
    minLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
    maxLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
  },
  aadhaar: {
    type: String,
    required: true,
    minLength: [12, "Aadhaar Number Must Contain Exact 12 Digits!"],
    maxLength: [12, "Aadhaar Number Must Contain Exact 12 Digits!"],
  },
  dob: {
    type: Date,
    required: [true, "DOB is required!"],
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Others"],
  },
  password: {
    type: String,
    required: true,
    minLength: [8, "Password Must Contain Atleast 8 Characters"],
    select: false, //Means when user is GET, all details of the User is fetched except the password
  },
  role: {
    type: String,
    required: true,
    enum: ["Admin", "Patient", "Doctor"],
  },
  doctorDepartment: {
    type: String,
  },
  docAvatar: {
    public_id: String,
    url: String,
  },
});

/*Password Encryption using Hashing*/
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10); //Salt rounds = 10. Salt = 'random data' being used in hashfunction along with the password
});

/*Password comparision between User Entered Password and Hashed Password*/
userSchema.methods.comparePassword = async function (enteredPassword) {
  //Any other name instead of "comparePassword" can be used.
  return await bcrypt.compare(enteredPassword, this.password);
};

//Token Generation After Login
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign(
    { id: this._id }, // _id is unique for all in MongoDb. That is why it is used in Payload(Data to be encoded in the JWT)
    process.env.JWT_SECRET_KEY, //Secret Key used to sign the JWT
    { expiresIn: process.env.JWT_EXPIRES } // Optional: Expiration time for the JWT
  );
};

export const User = mongoose.model("User", userSchema);

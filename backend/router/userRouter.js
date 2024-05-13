import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
  login,
  logoutAdmin,
  logoutPatient,
  patientRegister,
} from "../controller/userController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/patient/register", patientRegister);
userRouter.post("/login", login);
userRouter.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
userRouter.get("/doctors", getAllDoctors);
userRouter.get("/admin/me", isAdminAuthenticated, getUserDetails);
userRouter.get("/patient/me", isPatientAuthenticated, getUserDetails);
userRouter.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
userRouter.get("/patient/logout", isPatientAuthenticated, logoutPatient);
userRouter.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor)

export default userRouter;

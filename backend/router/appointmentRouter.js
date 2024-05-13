import express from 'express';
import { deleteAppointment, getAllAppointments, postAppointment, updateAppointmentStatus } from '../controller/appointmentController.js';
import { isAdminAuthenticated, isPatientAuthenticated} from "../middlewares/auth.js"

const appointmentRouter = express.Router();

appointmentRouter.post("/post", isPatientAuthenticated,postAppointment);
appointmentRouter.get("/getall", isAdminAuthenticated, getAllAppointments);
appointmentRouter.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
appointmentRouter.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default appointmentRouter;
import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireActiveDoctorMidwife } from "../middlewares/requireActiveDoctorMidwife.js";
import { AppointmentController } from "../controllers/AppointmentController.js";

const router = express.Router();
const appointmentController = new AppointmentController();


router.use(authenticate);

// List appointments for authenticated user (Dashboard access for DOCTOR)
router.get(
  "/",
  authorize("MOTHER", "MIDWIFE", "DOCTOR"),
  requireActiveDoctorMidwife,
  appointmentController.list,
);

// All other routes restricted to MOTHER and MIDWIFE only
router.use(authorize("MOTHER", "MIDWIFE"), requireActiveDoctorMidwife);

// Mother creates appointment for her pregnancy
router.post("/", appointmentController.create);


 // Midwife gets upcoming appointments (must be before /id routes)
 
router.get("/upcoming/mine", appointmentController.getUpcoming);


 //Midwife gets completed appointments
 
router.get("/completed/mine", appointmentController.getCompleted);


 //Get all appointments for a pregnancy
 
router.get("/pregnancy/:pregnancyId", appointmentController.getByPregnancy);

// AI quick-check for one appointment
router.post("/:id/ai-check", appointmentController.aiCheck);


 
  //Get single appointment by ID
 
router.get("/:id", appointmentController.getById);


 // Midwife reviews request
 
router.patch("/:id/respond", appointmentController.respond);


 
 //Mother confirms approved appointment or requests reschedule

 
router.patch("/:id/mother-response", appointmentController.motherResponse);


 //Midwife fills appointment information after visit

router.patch("/:id/fill-info", appointmentController.fillInfo);


 // Cancel appointment (mother or midwife)

 
router.patch("/:id/cancel", appointmentController.cancel);

// Delete appointment (mother who booked it)
router.delete("/:id", appointmentController.deleteByMother);

export default router;

import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { PregnancyController } from "../controllers/PregnancyController.js";

const router = express.Router();
const pregnancyController = new PregnancyController();

// Create pregnancy (only for authenticated mothers)
router.post("/", authenticate, pregnancyController.create);

// List pregnancies for authenticated user
router.get("/", authenticate, pregnancyController.listByUser);

// Get single pregnancy (mother, assigned doctor, or assigned midwife)
router.get("/:id", authenticate, pregnancyController.getById);

// Assign a doctor to a pregnancy (mother only)
router.post(
  "/:id/assign-doctor",
  authenticate,
  pregnancyController.assignDoctor,
);

// Assign a midwife to a pregnancy (assigned doctor only)
router.post(
  "/:id/assign-midwife",
  authenticate,
  pregnancyController.assignMidwife,
);

// Cancel a pregnancy (mother only)
router.patch("/:id/cancel", authenticate, pregnancyController.cancel);

// Update pregnancy details (mother only)
router.patch("/:id", authenticate, pregnancyController.update);

export default router;

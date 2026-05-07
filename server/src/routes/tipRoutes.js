import express from "express";
import { TipController } from "../controllers/TipController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();
const tipController = new TipController();

// GET /api/tips/current-week - Returns tips for the mother's current pregnancy week
router.get("/current-week", authenticate, authorize("MOTHER"), tipController.getTipsForCurrentWeek);

export default router;


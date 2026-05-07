import express from "express";
import { UserController } from "../controllers/UserController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireOwner } from "../middlewares/requireOwner.js";

const router = express.Router();
const userController = new UserController();

// Admin only - Get all users
router.get("/", authenticate, authorize("ADMIN"), userController.getAllUsers);

// Admin only - Get users pending validation (inactive doctors/midwives)
router.get(
  "/pending-validation",
  authenticate,
  authorize("ADMIN"),
  userController.getPendingValidation,
);

// Admin only - Activate user (validate doctor/midwife)
router.patch(
  "/:userId/activate",
  authenticate,
  authorize("ADMIN"),
  userController.activateUser,
);

// Admin only - Deactivate user
router.patch(
  "/:userId/deactivate",
  authenticate,
  authorize("ADMIN"),
  userController.deactivateUser,
);

// Mother/Admin - Search active doctors by name
router.get(
  "/doctors/search",
  authenticate,
  authorize("MOTHER", "ADMIN"),
  userController.searchDoctors,
);

// Doctor/Admin - Search active midwives by name
router.get(
  "/midwives/search",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  userController.searchMidwives,
);

// User can view their own profile
router.get("/:userId", authenticate, requireOwner, userController.getUserById);

// User can update their own details
router.patch("/:userId", authenticate, requireOwner, userController.updateUser);

// User can change their own password
router.patch(
  "/:userId/change-password",
  authenticate,
  requireOwner,
  userController.changePassword,
);

// User can delete their own account
router.delete(
  "/:userId",
  authenticate,
  requireOwner,
  userController.deleteUser,
);

// Admin only - Delete any non-admin user
router.delete(
  "/:userId/admin-delete",
  authenticate,
  authorize("ADMIN"),
  userController.adminDeleteUser,
);

export default router;

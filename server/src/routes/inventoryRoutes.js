import express from 'express';
import { getSmartReorder } from '../controllers/inventoryController.js';
// Note: Assuming you have an authentication middleware, you can import and use it here.
// import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Route: GET /api/inventory/smart-reorder
// You can uncomment authentication if required for the assignment.
// router.get('/smart-reorder', authenticate, getSmartReorder);
router.get('/smart-reorder', getSmartReorder);

export default router;

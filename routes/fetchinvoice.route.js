import express from "express";
import { getUserInvoices } from "../controllers/fetchInvoices.controller.js";
import protectRoute from "../middleware/protectRoute.js";
const router = express.Router();

router.get("/fetchAll", protectRoute, getUserInvoices);

export default router;

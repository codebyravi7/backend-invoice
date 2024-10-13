import express from "express";
import { getUserInvoices } from "../controllers/fetchInvoices.controller.js";

const router = express.Router();

router.get("/fetchAll", getUserInvoices);

export default router;

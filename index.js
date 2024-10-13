import express from "express"; // Use import instead of require
import bodyParser from "body-parser";
import cors from "cors";
import {generateInvoice} from "./controllers/generateInvoice.controller.js"; // Add .js extension
import connectToMongoDB from "./db/connectToMongoDB.js";
import authRoutes from "./routes/auth.routes.js";
import fetchinvoiceRoutes from "./routes/fetchinvoice.route.js";
import dotenv from "dotenv";
import protectRoute from "./middleware/protectRoute.js";

dotenv.config(); // Load environment variables

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/api/generate-invoice",protectRoute, generateInvoice);
app.use("/api/auth", authRoutes);
app.use("/api/invoice", fetchinvoiceRoutes);

const PORT = process.env.PORT || 5000;

connectToMongoDB(); // Connect to MongoDB before starting the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

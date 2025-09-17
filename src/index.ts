import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./configs/database";
import categoryRoutes from "./routes/category.routes";
import modelVerityRoutes from "./routes/modelVerity.routes";
import productRoutes from "./routes/product.routes";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


connectDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/api/v1", (req: Request, res: Response) => {
    res.send("API v1 is working!");
});

// API v1 routes
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/modelVerities", modelVerityRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

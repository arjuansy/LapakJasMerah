import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import chatRoutes from "./routes/chatRoutes";
import { errorHandler, notFound } from "./middlewares/errorMiddleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiting (Maksimal 100 request per 15 menit per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: "Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti." }
});
app.use(limiter);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
  res.send("Marketplace API is running!");
});

// Error Handling Middlewares (Harus di bagian paling bawah)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

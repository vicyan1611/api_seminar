import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware (optional)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- API Routes ---
app.use("/api", apiRoutes);

// Simple Health Check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// --- Error Handling (Basic Example) ---
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: { message: "Something went wrong!" } });
  },
);

app.listen(PORT, () => {
  console.log(`API Server listening on port ${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import { authRouter } from "./routes/authRoutes";
import { fileRouter } from "./routes/fileRoutes";
import { userRouter } from "./routes/userRoutes";
import { folderRouter } from "./routes/folderRoutes";
import { documentRouter } from "./routes/documentRoutes";
import { dashBoardRouter } from "./routes/dashboardRoute";
import rateLimit from "express-rate-limit";
import { setupSocketController } from "./controllers/socketController";
import path from "path";
import compression from "compression";
import { errorHandler } from "./middleware/errorHandler";
import { settingsRouter } from "./routes/settingRoutes";
import { activityRouter } from "./routes/activityRoutes";

dotenv.config();

const app = express();
const isDevelopment = process.env.NODE_ENV !== "production";

const PORT = 5002;

// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5002",
  "http://localhost:5001",
  "http://localhost:5000",
  "https://benhost.net",
];

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* MIDDLEWARE */
app.use(express.json({ limit: "100mb" }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan(isDevelopment ? "dev" : "combined"));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "100mb" }));
app.use(compression());

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:", ...allowedOrigins],
      frameSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/* ROUTES */
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/files", fileRouter);
app.use("/api/folders", folderRouter);
app.use("/api/dashboard", dashBoardRouter);
app.use("/api/documents", documentRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/activities", activityRouter);

// Serve static files in production
if (!isDevelopment) {
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath, { maxAge: "1d" }));

  app.get("*", (req, res) =>
    res.sendFile(path.join(clientBuildPath, "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("Server is running in development mode");
  });
}

// Error handling middleware
app.use(errorHandler);

// Setup Socket.io
setupSocketController(io);

// Start server
const startServer = async () => {
  try {
    await new Promise<void>((resolve, reject) => {
      server.listen(PORT, () => {
        console.log(
          `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
        );
        resolve();
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Received kill signal, shutting down gracefully");
  server.close(() => {
    console.log("Closed out remaining connections");
    process.exit(0);
  });

  // If server hasn't finished in 10 seconds, shut down forcefully
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Uncaught exception handler
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown();
});

// Unhandled rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});

export default app;

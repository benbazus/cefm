"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const authRoutes_1 = require("./routes/authRoutes");
const fileRoutes_1 = require("./routes/fileRoutes");
const userRoutes_1 = require("./routes/userRoutes");
const folderRoutes_1 = require("./routes/folderRoutes");
const documentRoutes_1 = require("./routes/documentRoutes");
const dashboardRoute_1 = require("./routes/dashboardRoute");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const socketController_1 = require("./controllers/socketController");
const path_1 = __importDefault(require("path"));
const compression_1 = __importDefault(require("compression"));
const errorHandler_1 = require("./middleware/errorHandler");
const settingRoutes_1 = require("./routes/settingRoutes");
const activityRoutes_1 = require("./routes/activityRoutes");
dotenv_1.default.config();
const app = (0, express_1.default)();
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
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST"],
        credentials: true,
    },
});
/* MIDDLEWARE */
app.use(express_1.default.json({ limit: "100mb" }));
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)(isDevelopment ? "dev" : "combined"));
app.use(body_parser_1.default.json({ limit: "100mb" }));
app.use(body_parser_1.default.urlencoded({ extended: false, limit: "100mb" }));
app.use((0, compression_1.default)());
// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
// Content Security Policy
app.use(helmet_1.default.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:", ...allowedOrigins],
        frameSrc: ["'self'"],
        upgradeInsecureRequests: [],
    },
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 20 * 60 * 1000, // 20 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
/* ROUTES */
app.use("/api/auth", authRoutes_1.authRouter);
app.use("/api/users", userRoutes_1.userRouter);
app.use("/api/files", fileRoutes_1.fileRouter);
app.use("/api/folders", folderRoutes_1.folderRouter);
app.use("/api/dashboard", dashboardRoute_1.dashBoardRouter);
app.use("/api/documents", documentRoutes_1.documentRouter);
app.use("/api/settings", settingRoutes_1.settingsRouter);
app.use("/api/activities", activityRoutes_1.activityRouter);
// Serve static files in production
if (!isDevelopment) {
    const clientBuildPath = path_1.default.join(__dirname, "../client/dist");
    app.use(express_1.default.static(clientBuildPath, { maxAge: "1d" }));
    app.get("*", (req, res) => res.sendFile(path_1.default.join(clientBuildPath, "index.html")));
}
else {
    app.get("/", (req, res) => {
        res.send("Server is running in development mode");
    });
}
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Setup Socket.io
(0, socketController_1.setupSocketController)(io);
// Start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield new Promise((resolve, reject) => {
            server.listen(PORT, () => {
                console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
                resolve();
            });
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
});
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
        console.error("Could not close connections in time, forcefully shutting down");
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
exports.default = app;

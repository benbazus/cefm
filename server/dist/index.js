"use strict";
// import express from "express";
// import dotenv from "dotenv";
// import bodyParser from "body-parser";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { authRouter } from "./routes/authRoutes";
// import { fileRouter } from "./routes/fileRoutes";
// import { userRouter } from "./routes/userRoutes";
// import { folderRouter } from "./routes/folderRoutes";
// import { documentRouter } from "./routes/documentRoutes";
// import { dashBoardRouter } from "./routes/dashboardRoute";
// import rateLimit from "express-rate-limit";
// import { setupSocketController } from "./controllers/socketController";
// import path from "path";
// import compression from "compression";
// import { errorHandler } from "./middleware/errorHandler";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// /* CONFIGURATIONS */
// dotenv.config();
// const app = express();
// const httpServer = createServer(app);
// const isDevelopment = process.env.NODE_ENV !== "production";
// const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
// const io = new Server(httpServer, {
//     cors: {
//         origin: CLIENT_ORIGIN,
//         methods: ["GET", "POST"],
//         credentials: true,
//     },
// });
// /* MIDDLEWARE */
// app.use(express.json());
// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// app.use(morgan(isDevelopment ? "dev" : "combined"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(compression());
// // CORS configuration
// const corsOptions = {
//     origin: CLIENT_ORIGIN,
//     credentials: true,
//     optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));
// // Content Security Policy
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'self'"],
//             scriptSrc: ["'self'", "'unsafe-inline'"],
//             styleSrc: ["'self'", "'unsafe-inline'"],
//             imgSrc: ["'self'", "data:", "blob:"],
//             connectSrc: ["'self'", CLIENT_ORIGIN],
//             frameSrc: ["'self'"],
//             upgradeInsecureRequests: [],
//         },
//     })
// );
// // Rate limiting
// const limiter = rateLimit({
//     windowMs: 20 * 60 * 1000, // 20 minutes
//     max: 1000, // limit each IP to 1000 requests per windowMs
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use(limiter);
// /* ROUTES */
// app.use('/api/auth', authRouter);
// app.use('/api/users', userRouter);
// app.use('/api/files', fileRouter);
// app.use('/api/folders', folderRouter);
// app.use('/api/dashboard', dashBoardRouter);
// app.use('/api/documents', documentRouter);
// // Serve static files in production
// if (!isDevelopment) {
//     const clientBuildPath = path.join(__dirname, '../client/dist');
//     app.use(express.static(clientBuildPath));
//     app.get('*', (req, res) =>
//         res.sendFile(path.join(clientBuildPath, 'index.html'))
//     );
// } else {
//     app.get('/', (req, res) => {
//         res.send("Server is running in development mode");
//     });
// }
// // Error handling middleware
// app.use(errorHandler);
// // Setup Socket.io
// setupSocketController(io);
// const port = Number(process.env.PORT) || 5000;
// httpServer.listen(port, "0.0.0.0", () => {
//     console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
// });
// // Graceful shutdown
// process.on('SIGTERM', () => {
//     console.log('SIGTERM signal received: closing HTTP server');
//     httpServer.close(() => {
//         console.log('HTTP server closed');
//         process.exit(0);
//     });
// });
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
/* CONFIGURATIONS */
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true, // This is important for cookies/auth headers
    optionsSuccessStatus: 200
};
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, '../client/dist')));
//     app.get('*', (req, res) =>
//         res.sendFile(
//             path.resolve(__dirname, '../', 'cefm', 'client', 'dist', 'index.html')
//         )
//     );
// } else {
//     app.get('/', (req, res) => res.send('Please set to production'));
// }
app.use((0, cors_1.default)(corsOptions));
// Middleware to set Content Security Policy
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' http://localhost:5173;");
    next();
});
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'ALLOW-FROM http://localhost:5173'); // Allow specific domain
    // or
    // res.removeHeader('X-Frame-Options'); // Remove it entirely (not recommended for production)
    next();
});
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 20 * 60 * 1000, // 20 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);
/* ROUTES */
app.get("/", (req, res) => {
    res.send("This is home route for test purposes.");
});
app.use('/api/auth', authRoutes_1.authRouter);
app.use('/api/users', userRoutes_1.userRouter);
app.use('/api/files', fileRoutes_1.fileRouter);
app.use('/api/folders', folderRoutes_1.folderRouter);
app.use('/api/dashboard', dashboardRoute_1.dashBoardRouter);
app.use('/api/documents', documentRoutes_1.documentRouter);
// Setup Socket.io
(0, socketController_1.setupSocketController)(io);
const port = Number(process.env.PORT) || 5001;
httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});

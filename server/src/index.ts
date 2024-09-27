
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

/* CONFIGURATIONS */
dotenv.config();

const app = express();
const httpServer = createServer(app);

const isDevelopment = process.env.NODE_ENV !== "production";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

/* MIDDLEWARE */
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan(isDevelopment ? "dev" : "combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

// CORS configuration
const corsOptions = {
    origin: CLIENT_ORIGIN,
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
            connectSrc: ["'self'", CLIENT_ORIGIN],
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
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/files', fileRouter);
app.use('/api/folders', folderRouter);
app.use('/api/dashboard', dashBoardRouter);
app.use('/api/documents', documentRouter);

// Serve static files in production
if (!isDevelopment) {
    const clientBuildPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientBuildPath));

    app.get('*', (req, res) =>
        res.sendFile(path.join(clientBuildPath, 'index.html'))
    );
} else {
    app.get('/', (req, res) => {
        res.send("Server is running in development mode");
    });
}

// Error handling middleware
app.use(errorHandler);

// Setup Socket.io
setupSocketController(io);

const port = Number(process.env.PORT) || 5000;
httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});


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

// /* CONFIGURATIONS */
// dotenv.config();
// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"],
//     },
// });

// app.use(express.json());
// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// app.use(morgan("common"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// // CORS configuration
// const corsOptions = {
//     origin: 'http://localhost:5173',
//     credentials: true, // This is important for cookies/auth headers
//     optionsSuccessStatus: 200
// };

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

// app.use(cors(corsOptions));


// // Middleware to set Content Security Policy
// app.use((req, res, next) => {
//     res.setHeader("Content-Security-Policy", "frame-ancestors 'self' http://localhost:5173;");
//     next();
// });

// app.use((req, res, next) => {
//     res.setHeader('X-Frame-Options', 'ALLOW-FROM http://localhost:5173'); // Allow specific domain
//     // or
//     // res.removeHeader('X-Frame-Options'); // Remove it entirely (not recommended for production)
//     next();
// });

// // Rate limiting
// const limiter = rateLimit({
//     windowMs: 20 * 60 * 1000, // 20 minutes
//     max: 1000 // limit each IP to 1000 requests per windowMs
// });
// app.use(limiter);

// /* ROUTES */
// app.get("/", (req, res) => {
//     res.send("This is home route");
// });

// app.use('/api/auth', authRouter);
// app.use('/api/users', userRouter);
// app.use('/api/files', fileRouter);
// app.use('/api/folders', folderRouter);
// app.use('/api/dashboard', dashBoardRouter);
// app.use('/api/documents', documentRouter);

// // Setup Socket.io
// setupSocketController(io);

// const port = Number(process.env.PORT) || 5000;
// httpServer.listen(port, "0.0.0.0", () => {
//     console.log(`Server running on port ${port}`);
// });


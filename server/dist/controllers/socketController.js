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
exports.setupSocketController = setupSocketController;
const database_1 = __importDefault(require("../config/database"));
const defaultTitle = 'Untitled Document';
function setupSocketController(io) {
    io.on("connection", (socket) => {
        socket.on("get-document", (_a, req_1) => __awaiter(this, [_a, req_1], void 0, function* ({ documentId, userId }, req) {
            let document;
            try {
                console.log('Received documentId:', documentId);
                document = yield database_1.default.document.findUnique({
                    where: { id: documentId },
                });
                if (!document) {
                    document = yield database_1.default.document.create({
                        data: {
                            id: documentId,
                            data: "",
                            title: defaultTitle,
                            size: 0,
                            mimeType: "application/doc",
                            userId: userId,
                        },
                    });
                }
                const permission = yield database_1.default.userPermission.findFirst({
                    where: {
                        documentId: documentId,
                    },
                });
                console.log(' ++++++++permission+++++++++++++++++ ');
                console.log(permission);
                console.log(' +++++++++permission++++++++++++++++ ');
                socket.join(documentId);
                socket.emit("load-document", { data: document.data, title: document.title, permission: permission === null || permission === void 0 ? void 0 : permission.permission });
                socket.on("send-changes", (delta) => {
                    socket.broadcast.to(documentId).emit("receive-changes", delta);
                });
                socket.on("save-document", (_a) => __awaiter(this, [_a], void 0, function* ({ data, title }) {
                    yield database_1.default.document.update({
                        where: { id: documentId },
                        data: { data, title },
                    });
                }));
            }
            catch (error) {
                console.error("Error handling document:", error);
                socket.emit("error", "An error occurred while processing the document");
            }
        }));
    });
}
// import { Server } from "socket.io";
// import prisma from "../config/database";
// const defaultTitle = 'Untitled Document"'
// export function setupSocketController(io: Server) {
//     io.on("connection", (socket) => {
//         socket.on("get-document", async ({ documentId, userId }) => {
//             let document;
//             try {
//                 console.log('Received documentId:', documentId);
//                 document = await prisma.document.findUnique({
//                     where: { id: documentId },
//                 });
//                 if (!document) {
//                     document = await prisma.document.create({
//                         data: {
//                             id: documentId,
//                             data: "",
//                             title: "Untitled Document", // Default title
//                             userId: '', // Save the userId
//                         },
//                     });
//                 }
//                 socket.join(documentId);
//                 socket.emit("load-document", { data: document.data, title: document.title });
//                 socket.on("send-changes", (delta) => {
//                     socket.broadcast.to(documentId).emit("receive-changes", delta);
//                 });
//                 socket.on("save-document", async ({ data, title }) => {
//                     await prisma.document.update({
//                         where: { id: documentId },
//                         data: { data, title }, // Save both data and title
//                     });
//                 });
//             } catch (error) {
//                 console.error("Error handling document:", error);
//                 socket.emit("error", "An error occurred while processing the document");
//             }
//         });
//     });
// }
// import { Server } from "socket.io";
// import prisma from "../config/database";
// export function setupSocketController(io: Server) {
//     io.on("connection", (socket) => {
//         socket.on("get-document", async (documentId) => {
//             let document;
//             try {
//                 console.log(' +++++++++setupSocketController+++++++++++++++ ')
//                 console.log(documentId)
//                 console.log(' +++++++++setupSocketController+++++++++++++++ ')
//                 document = await prisma.document.findUnique({
//                     where: { id: documentId },
//                 });
//                 if (!document) {
//                     document = await prisma.document.create({
//                         data: {
//                             id: documentId,
//                             data: "",
//                         },
//                     });
//                 }
//                 socket.join(documentId);
//                 socket.emit("load-document", document.data);
//                 socket.on("send-changes", (delta) => {
//                     socket.broadcast.to(documentId).emit("receive-changes", delta);
//                 });
//                 socket.on("save-document", async (data) => {
//                     await prisma.document.update({
//                         where: { id: documentId },
//                         data: { data },
//                     });
//                 });
//             } catch (error) {
//                 console.error("Error handling document:", error);
//                 socket.emit("error", "An error occurred while processing the document");
//             }
//         });
//     });
// }

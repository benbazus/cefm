import { Server } from "socket.io";
import prisma from "../config/database";
import { Request } from 'express';

const defaultTitle = 'Untitled Document';

export function setupSocketController(io: Server) {
    io.on("connection", (socket) => {
        socket.on("get-document", async ({ documentId, userId }, req: Request) => {
            let document;
            try {
                console.log('Received documentId:', documentId);

                document = await prisma.document.findUnique({
                    where: { id: documentId },
                });

                if (!document) {
                    document = await prisma.document.create({
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

                const permission = await prisma.userPermission.findFirst({
                    where: {
                        documentId: documentId,
                    },
                })


                console.log(' ++++++++permission+++++++++++++++++ ')
                console.log(permission)
                console.log(' +++++++++permission++++++++++++++++ ')

                socket.join(documentId);
                socket.emit("load-document", { data: document.data, title: document.title, permission: permission?.permission });

                socket.on("send-changes", (delta) => {
                    socket.broadcast.to(documentId).emit("receive-changes", delta);
                });

                socket.on("save-document", async ({ data, title }) => {
                    await prisma.document.update({
                        where: { id: documentId },
                        data: { data, title },
                    });
                });
            } catch (error) {
                console.error("Error handling document:", error);
                socket.emit("error", "An error occurred while processing the document");
            }
        });
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
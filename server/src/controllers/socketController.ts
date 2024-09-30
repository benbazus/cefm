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

import express from "express";
import * as documentController from "../controllers/documentController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/share-document", auth, documentController.shareDocument);
router.get(
  "/fetch-users/:documentId",
  auth,
  documentController.fetchDocumentUsers
);
router.post("/:documentId/share", auth, documentController.shareDocumentToUser);
router.post(
  "/:documentId/change-fileShare-permission",
  auth,
  documentController.changeFileSharePermissionToUser
);

export { router as documentRouter };

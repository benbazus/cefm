import express from "express";
import * as fileController from "../controllers/fileController";
import { auth } from "../middleware/auth";
import multer from "multer";

const router = express.Router();

const upload = multer();

router.post("/:fileId/move", auth, fileController.moveFileItem);

router.post("/:id/unlock", auth, fileController.unlockFile);
router.post("/:id/lock", auth, fileController.lockFile);

router.post(
  "/:id/versions/:versionId/restore",
  auth,
  fileController.versionRestoreFile
);
router.get("/:versionId/versions", auth, fileController.versionsFile);
router.post("/:id/copy", auth, fileController.copyFile);
router.put("/:id/move", auth, fileController.moveFile);
router.post("/file-upload-v1", auth, fileController.uploadFile);

router.post(
  "/file-upload",
  auth,
  upload.single("file"),
  fileController.fileUpload
);

router.post(
  "/fileUpload",
  upload.array("files"),
  auth,
  fileController.handleFileUpload
);

router.post("/upload", auth, upload.array("files"), fileController.uploadFiles);

router.post(
  "/upload-folder",
  auth,
  upload.fields([{ name: "files", maxCount: 100 }]),
  fileController.uploadFolder
);

router.post("/download-files", auth, fileController.downloadFiles);

router.post("/upload", upload.single("file"), auth, fileController.uploadFile);

router.get("/shared-link/:fileId", auth, fileController.shareLink);

router.post("/create-documents", auth, fileController.createDocument);

router.post("/check-password", fileController.checkPassword);

router.post(
  "/upload-file",
  auth,
  upload.single("file"),
  fileController.uploadFile
);

router.post("/rename/:fileId", auth, fileController.renameFile);

router.get("/get-document", auth, fileController.getDocuments);

router.get("/get-custom-document", auth, fileController.getCustomDocuments);

router.get("/get-excel", auth, fileController.getExcelFiles);

router.get("/get-video", auth, fileController.getVideo);

router.get("/get-pdf", auth, fileController.getPdf);

router.get("/get-audio", auth, fileController.getAudio);

router.get("/get-word", auth, fileController.getWord);

router.get("/get-photo", auth, fileController.getPhotos);

router.get("/get-trash", auth, fileController.getTrashed);

router.get("/get-share", auth, fileController.getShared);

router.get("/get-sharedwithme", auth, fileController.getSharedWithMe);

router.get("/details/:fileId", auth, fileController.getFileDetails);

router.post("/trash/:fileId", auth, fileController.moveToTrash);

router.post("/share-file", auth, fileController.shareFile);

router.get("/shared-file/:fileId", fileController.sharedFile);

router.get("/copy-link/:itemId", auth, fileController.copyLink);

router.get("/preview/:fileId", fileController.previewFile);

router.get(
  "/deletePermanently/:fileType/:fileId",
  auth,
  fileController.deletePermanently
);

router.get("/restore-file/:fileId", auth, fileController.restoreFile);

router.get("/download-file/:itemId", fileController.downloadFile);

router.get("/download-folder/:itemId", fileController.downloadFolder);

export { router as fileRouter };

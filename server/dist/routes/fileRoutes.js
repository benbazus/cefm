"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRouter = void 0;
const express_1 = __importDefault(require("express"));
const fileController = __importStar(require("../controllers/fileController"));
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
exports.fileRouter = router;
const upload = (0, multer_1.default)();
router.post("/:fileId/move", auth_1.auth, fileController.moveFileItem);
router.post("/:id/unlock", auth_1.auth, fileController.unlockFile);
router.post("/:id/lock", auth_1.auth, fileController.lockFile);
router.post("/:id/versions/:versionId/restore", auth_1.auth, fileController.versionRestoreFile);
router.get("/:versionId/versions", auth_1.auth, fileController.versionsFile);
router.post("/:id/copy", auth_1.auth, fileController.copyFile);
router.put("/:id/move", auth_1.auth, fileController.moveFile);
router.post("/file-upload-v1", auth_1.auth, fileController.uploadFile);
router.post("/file-upload", auth_1.auth, upload.single("file"), fileController.fileUpload);
router.post("/fileUpload", upload.array("files"), auth_1.auth, fileController.handleFileUpload);
router.post("/upload", auth_1.auth, upload.array("files"), fileController.uploadFiles);
router.post("/upload-folder", auth_1.auth, upload.fields([{ name: "files", maxCount: 100 }]), fileController.uploadFolder);
router.post("/download-files", auth_1.auth, fileController.downloadFiles);
router.post("/upload", upload.single("file"), auth_1.auth, fileController.uploadFile);
router.get("/shared-link/:fileId", auth_1.auth, fileController.shareLink);
router.post("/create-documents", auth_1.auth, fileController.createDocument);
router.post("/check-password", fileController.checkPassword);
router.post("/upload-file", auth_1.auth, upload.single("file"), fileController.uploadFile);
router.post("/rename/:fileId", auth_1.auth, fileController.renameFile);
router.get("/get-document", auth_1.auth, fileController.getDocuments);
router.get("/get-custom-document", auth_1.auth, fileController.getCustomDocuments);
router.get("/get-excel", auth_1.auth, fileController.getExcelFiles);
router.get("/get-video", auth_1.auth, fileController.getVideo);
router.get("/get-pdf", auth_1.auth, fileController.getPdf);
router.get("/get-audio", auth_1.auth, fileController.getAudio);
router.get("/get-word", auth_1.auth, fileController.getWord);
router.get("/get-photo", auth_1.auth, fileController.getPhotos);
router.get("/get-trash", auth_1.auth, fileController.getTrashed);
router.get("/get-share", auth_1.auth, fileController.getShared);
router.get("/get-sharedwithme", auth_1.auth, fileController.getSharedWithMe);
router.get("/details/:fileId", auth_1.auth, fileController.getFileDetails);
router.post("/trash/:fileId", auth_1.auth, fileController.moveToTrash);
router.post("/share-file", auth_1.auth, fileController.shareFile);
router.get("/shared-file/:fileId", fileController.sharedFile);
router.get("/copy-link/:itemId", auth_1.auth, fileController.copyLink);
router.get("/preview/:fileId", fileController.previewFile);
router.get("/deletePermanently/:fileType/:fileId", auth_1.auth, fileController.deletePermanently);
router.get("/restore-file/:fileId", auth_1.auth, fileController.restoreFile);
router.get("/download-file/:itemId", fileController.downloadFile);
router.get("/download-folder/:itemId", fileController.downloadFolder);

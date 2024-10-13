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
exports.folderRouter = void 0;
const express_1 = __importDefault(require("express"));
const folderController = __importStar(require("../controllers/folderController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
exports.folderRouter = router;
router.post("/:id/unlock", auth_1.auth, folderController.unlockFolder);
router.post("/:id/lock", auth_1.auth, folderController.lockFolder);
router.post("/:id/copy", auth_1.auth, folderController.copyFolder);
router.put("/:id/move", auth_1.auth, folderController.moveFolder);
router.get("/file-count/:folderId", auth_1.auth, folderController.getFileCount);
router.get("/get-root-folder", auth_1.auth, folderController.getRootFolder);
router.get("/get-root-children", auth_1.auth, folderController.getRootChildren);
router.get("/get-children-folders-folderId/:folderId", auth_1.auth, folderController.getChildrenFoldersByParentFolderId);
router.post("/create-folder", auth_1.auth, folderController.createNewFolder);
router.post("/download-folder", auth_1.auth, folderController.downloadFolder);
router.get("/details/:folderId", auth_1.auth, folderController.getFolderDetails);

import express from "express";
import * as folderController from "../controllers/folderController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/:id/unlock", auth, folderController.unlockFolder);

router.post("/:id/lock", auth, folderController.lockFolder);

router.post("/:id/copy", auth, folderController.copyFolder);

router.put("/:id/move", auth, folderController.moveFolder);

router.get("/file-count/:folderId", auth, folderController.getFileCount);

router.get("/get-root-folder", auth, folderController.getRootFolder);

router.get("/get-root-children", auth, folderController.getRootChildren);

router.get(
  "/get-children-folders-folderId/:folderId",
  auth,
  folderController.getChildrenFoldersByParentFolderId
);

router.post("/create-folder", auth, folderController.createNewFolder);

router.post("/download-folder", auth, folderController.downloadFolder);

router.get("/details/:folderId", auth, folderController.getFolderDetails);

export { router as folderRouter };

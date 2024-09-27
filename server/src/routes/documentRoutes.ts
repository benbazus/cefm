
import express from 'express';
import * as documentController from '../controllers/documentController';
import { auth } from '../middleware/auth';

const router = express.Router();

//const response = await fetch(`/api/documents/${documentId}/users`)
//const response = await fetch(`/api/documents/${documentId}/share`, {

//  url: `/documents/${documentId}/change-fileShare-permission`,

//router.post('/share-document', auth, documentController.shareDocument)
router.post('/share-document', auth, documentController.shareDocument)
router.get('/fetch-users/:documentId', auth, documentController.fetchDocumentUsers);
router.post('/:documentId/share', auth, documentController.shareDocumentToUser);
router.post('/:documentId/change-fileShare-permission', auth, documentController.changeFileSharePermissionToUser);
// router.get('/type-distribution', auth, documentController.getFileTypeDistribution);
// router.get('/history', auth, documentController.getStorageUsageHistory);
// router.get('/uploads-per-day', auth, documentController.getFileUploadsPerDay);

export { router as documentRouter };
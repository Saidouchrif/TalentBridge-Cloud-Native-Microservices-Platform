const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const DocumentController = require('../Controllers/DocumentController');

router.post('/', upload.single('file'), DocumentController.uploadDocument);
router.get('/', DocumentController.getDocuments);
router.get('/:id', DocumentController.getDocumentById);
router.patch('/:id/status', DocumentController.updateDocumentStatus);
router.get('/:id/history', DocumentController.getDocumentHistory);

module.exports = router;

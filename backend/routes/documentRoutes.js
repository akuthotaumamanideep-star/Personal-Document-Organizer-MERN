const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  renewDocument,
  downloadFile,
  previewFile,
} = require('../controllers/documentController');

// Public preview/download or token-optional (so links and iframes can render easily)
router.get('/preview/:filename', previewFile);
router.get('/download/:filename', downloadFile);

// Protected routes
router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(upload.single('file'), createDocument);

router.route('/:id')
  .get(getDocumentById)
  .put(upload.single('file'), updateDocument)
  .delete(deleteDocument);

router.patch('/:id/renew', renewDocument);

module.exports = router;

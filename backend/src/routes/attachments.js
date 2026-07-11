const express = require('express');
const { param } = require('express-validator');
const { upload: uploadController, listByTask, download } = require('../controllers/attachmentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const { validate } = require('../middleware/validate');

const router = express.Router();

const taskIdParam = param('taskId').isInt({ min: 1 }).withMessage('taskId must be a positive integer').toInt();
const idParam = param('id').isInt({ min: 1 }).withMessage('id must be a positive integer').toInt();

// upload.single('file') runs between authMiddleware and the controller —
// same three-stage chain as every other route (auth -> shape validation ->
// controller), just with multer doing multipart parsing instead of
// express-validator doing JSON body parsing. No roleGuard: attachments
// aren't a row in the Section 6 table, so (like "add team member") this is
// membership-gated only, not role-gated.
router.post(
  '/tasks/:taskId/attachments',
  authMiddleware,
  taskIdParam,
  validate,
  upload.single('file'),
  uploadController
);
router.get('/tasks/:taskId/attachments', authMiddleware, taskIdParam, validate, listByTask);
router.get('/attachments/:id/download', authMiddleware, idParam, validate, download);

module.exports = router;

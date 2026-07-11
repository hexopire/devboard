const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// diskStorage (vs multer's default memoryStorage) writes each file straight
// to disk as it streams in, instead of buffering the whole thing in RAM —
// the right choice once uploads aren't tiny and won't all fit in memory at
// once under concurrent requests.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Relative to wherever `node` was invoked from (project root when run
    // via `npm run dev`), matching the existing uploads/ folder from Task 1.1.
    cb(null, 'uploads/');
  },
  // The client's original filename can't be trusted as-is: two uploads
  // named "report.pdf" would silently overwrite each other on disk, and a
  // crafted filename (e.g. "../../etc/passwd") could try to escape the
  // uploads/ folder entirely. Generating our own random name sidesteps both
  // problems — the original name is preserved separately as metadata
  // (Task 10.2 stores it in the attachments table), not used as the path.
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${extension}`);
  },
});

// Caps a single file at 10MB and only accepts one file per request for now
// — matches "attachments," not "bulk file upload," per the PRD's scope.
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { upload };

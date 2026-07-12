const path = require('path');
const { createAttachment, findAttachmentById, listAttachmentsByTask } = require('../db/attachmentQueries');
const { resolveTaskAndCheckMembership } = require('../utils/membership');
const { asyncHandler } = require('../utils/asyncHandler');

// Turns a stored file_path (e.g. "uploads/171...-abc.pdf") into a URL the
// client can actually fetch, matching the PRD acceptance criteria
// ("retrieve its metadata + download link"). The metadata row never stores
// a full URL — hosts/ports change across environments, but the relative
// path on disk doesn't, so the URL is computed fresh on every response.
function toAttachmentResponse(attachment) {
  return {
    ...attachment,
    download_url: `/api/v1/attachments/${attachment.id}/download`,
  };
}

// multer's upload.single('file') middleware (routes/attachments.js) runs
// BEFORE this handler and already wrote the file to disk — by the time
// this function runs, req.file.path already exists on disk whether or not
// the membership check below passes. Task 10.2 doesn't add cleanup for the
// rejected-membership case (an orphaned file with no DB row); flagging that
// as a known gap rather than silently accepting a small disk leak.
async function upload(req, res) {
  const { taskId } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'file is required' });
  }

  const { error } = await resolveTaskAndCheckMembership(taskId, req.user.id);
  if (error) {
    return res.status(error.status).json({ success: false, error: error.message });
  }

  const attachment = await createAttachment({
    taskId,
    filePath: req.file.path,
    uploadedBy: req.user.id,
  });
  return res.status(201).json({ success: true, data: { attachment: toAttachmentResponse(attachment) } });
}

async function listByTask(req, res) {
  const { taskId } = req.params;

  const { error } = await resolveTaskAndCheckMembership(taskId, req.user.id);
  if (error) {
    return res.status(error.status).json({ success: false, error: error.message });
  }

  const attachments = await listAttachmentsByTask(taskId);
  return res.status(200).json({ success: true, data: { attachments: attachments.map(toAttachmentResponse) } });
}

// Membership-gated download — the same team check as everything else in
// this app, not an unauthenticated static file server. __dirname here is
// backend/src/controllers, so resolving against '../../' anchors the
// stored relative path ("uploads/...") back to the backend/ project root
// regardless of the process's current working directory.
async function download(req, res) {
  const { id } = req.params;

  const attachment = await findAttachmentById(id);
  if (!attachment) {
    return res.status(404).json({ success: false, error: 'Attachment not found' });
  }

  const { error } = await resolveTaskAndCheckMembership(attachment.task_id, req.user.id);
  if (error) {
    return res.status(error.status).json({ success: false, error: error.message });
  }

  const absolutePath = path.join(__dirname, '../../', attachment.file_path);
  return res.download(absolutePath);
}

module.exports = {
  upload: asyncHandler(upload),
  listByTask: asyncHandler(listByTask),
  download: asyncHandler(download),
};

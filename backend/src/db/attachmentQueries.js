// Raw SQL queries for the attachments table. Deliberately stores only
// file_path (metadata) — the actual file bytes already live on disk,
// written there by multer before this INSERT ever runs. This is the
// "metadata vs bytes" split: the DB row is a pointer, not a copy.
const pool = require('./pool');

async function createAttachment({ taskId, filePath, uploadedBy }) {
  const result = await pool.query(
    `INSERT INTO attachments (task_id, file_path, uploaded_by)
     VALUES ($1, $2, $3)
     RETURNING id, task_id, file_path, uploaded_by, uploaded_at`,
    [taskId, filePath, uploadedBy]
  );
  return result.rows[0];
}

async function findAttachmentById(id) {
  const result = await pool.query(
    `SELECT id, task_id, file_path, uploaded_by, uploaded_at FROM attachments WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function listAttachmentsByTask(taskId) {
  const result = await pool.query(
    `SELECT id, task_id, file_path, uploaded_by, uploaded_at
     FROM attachments
     WHERE task_id = $1
     ORDER BY uploaded_at DESC`,
    [taskId]
  );
  return result.rows;
}

module.exports = { createAttachment, findAttachmentById, listAttachmentsByTask };

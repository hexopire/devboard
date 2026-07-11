// Raw SQL queries for the comments table.
const pool = require('./pool');

async function createComment({ taskId, userId, body }) {
  const result = await pool.query(
    `INSERT INTO comments (task_id, user_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, task_id, user_id, body, created_at`,
    [taskId, userId, body]
  );
  return result.rows[0];
}

// ASC (oldest first), unlike teams/projects/tasks listings (DESC, newest
// first) — a comment thread reads top-to-bottom in the order it was
// written, not as a "what's most recent" feed.
async function listCommentsByTask(taskId) {
  const result = await pool.query(
    `SELECT id, task_id, user_id, body, created_at
     FROM comments
     WHERE task_id = $1
     ORDER BY created_at ASC`,
    [taskId]
  );
  return result.rows;
}

module.exports = { createComment, listCommentsByTask };

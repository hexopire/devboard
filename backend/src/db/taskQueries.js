// Raw SQL queries for the tasks table.
const pool = require('./pool');

async function createTask({ projectId, title, description, status, assigneeId, createdBy, dueDate }) {
  const result = await pool.query(
    `INSERT INTO tasks (project_id, title, description, status, assignee_id, created_by, due_date)
     VALUES ($1, $2, $3, COALESCE($4::task_status, 'todo'), $5, $6, $7)
     RETURNING id, project_id, title, description, status, assignee_id, created_by, due_date, created_at`,
    [projectId, title, description || null, status, assigneeId || null, createdBy, dueDate || null]
  );
  return result.rows[0];
}

async function findTaskById(id) {
  const result = await pool.query(
    `SELECT id, project_id, title, description, status, assignee_id, created_by, due_date, created_at
     FROM tasks WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function listTasksByProject(projectId) {
  const result = await pool.query(
    `SELECT id, project_id, title, description, status, assignee_id, created_by, due_date, created_at
     FROM tasks
     WHERE project_id = $1
     ORDER BY created_at DESC`,
    [projectId]
  );
  return result.rows;
}

// Same dynamic-SET-clause approach as updateProject (projectQueries.js) —
// only overwrite columns the caller actually passed, so a PATCH with just
// { status } doesn't null out title/assignee/etc.
async function updateTask(id, { title, description, status, assigneeId, dueDate }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(title);
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (assigneeId !== undefined) {
    fields.push(`assignee_id = $${paramIndex++}`);
    values.push(assigneeId);
  }
  if (dueDate !== undefined) {
    fields.push(`due_date = $${paramIndex++}`);
    values.push(dueDate);
  }

  if (fields.length === 0) {
    return findTaskById(id);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex}
     RETURNING id, project_id, title, description, status, assignee_id, created_by, due_date, created_at`,
    values
  );
  return result.rows[0] || null;
}

async function deleteTask(id) {
  const result = await pool.query(`DELETE FROM tasks WHERE id = $1 RETURNING id`, [id]);
  return result.rowCount > 0;
}

module.exports = { createTask, findTaskById, listTasksByProject, updateTask, deleteTask };

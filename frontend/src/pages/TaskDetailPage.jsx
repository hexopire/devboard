import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getTaskById } from '../api/tasks.js';
import { getProjectById } from '../api/projects.js';
import { listTeamMembers } from '../api/teams.js';
import { listComments, createComment } from '../api/comments.js';

// Same nested-fetch chain as ProjectPage's team-members lookup (Task
// 15.2), one hop further: comments only have user_id (Task 9.1's schema),
// not a name — resolving task -> project -> team lets the thread show
// "Task33 Test" instead of a bare id. Each hop only starts once its
// dependency has loaded, hence three separate effects instead of one.
function TaskDetailPage() {
  const { taskId } = useParams();
  const { token } = useAuth();

  const [task, setTask] = useState(null);
  const [taskError, setTaskError] = useState(null);

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);

  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState(null);

  const [newCommentBody, setNewCommentBody] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  useEffect(() => {
    setTaskError(null);
    getTaskById(token, taskId)
      .then(({ task: fetchedTask }) => setTask(fetchedTask))
      .catch((err) => setTaskError(err.message));
  }, [token, taskId]);

  useEffect(() => {
    if (!task) {
      return;
    }
    getProjectById(token, task.project_id)
      .then(({ project: fetchedProject }) => setProject(fetchedProject))
      .catch(() => {
        // Non-fatal — see the members effect below for why.
      });
  }, [token, task]);

  useEffect(() => {
    if (!project) {
      return;
    }
    listTeamMembers(token, project.team_id)
      .then(({ members: fetchedMembers }) => setMembers(fetchedMembers))
      .catch(() => {
        // Non-fatal: comments still render with a raw user id fallback
        // (see authorName below) if this fails — not worth blocking the
        // whole page over a display-only nicety.
      });
  }, [token, project]);

  useEffect(() => {
    setIsLoadingComments(true);
    setCommentsError(null);

    listComments(token, taskId)
      .then(({ comments: fetchedComments }) => setComments(fetchedComments))
      .catch((err) => setCommentsError(err.message))
      .finally(() => setIsLoadingComments(false));
  }, [token, taskId]);

  function authorName(userId) {
    const member = members.find((m) => m.id === userId);
    return member ? member.name : `User #${userId}`;
  }

  async function handlePostComment(event) {
    event.preventDefault();
    setIsPosting(true);
    setPostError(null);

    try {
      const { comment } = await createComment(token, taskId, newCommentBody);
      // APPEND, not prepend — comments list oldest-first (Task 9.1's
      // ORDER BY created_at ASC, matching how a thread reads top-to-
      // bottom), so a new comment belongs at the end, unlike the
      // newest-first prepends on Dashboard/Team/Project pages.
      setComments((currentComments) => [...currentComments, comment]);
      setNewCommentBody('');
    } catch (err) {
      setPostError(err.message);
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <div>
      <h1>Task {task ? task.title : taskId}</h1>
      {taskError && <p role="alert">{taskError}</p>}
      {task && (
        <p>
          Status: {task.status} — Description: {task.description || '(none)'}
        </p>
      )}

      <h2>Comments</h2>
      {isLoadingComments && <p>Loading comments...</p>}
      {commentsError && <p role="alert">{commentsError}</p>}
      {!isLoadingComments && !commentsError && comments.length === 0 && <p>No comments yet.</p>}
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <strong>{authorName(comment.user_id)}</strong>: {comment.body}
          </li>
        ))}
      </ul>

      <form onSubmit={handlePostComment}>
        <label htmlFor="commentBody">Add a comment</label>
        <input
          id="commentBody"
          type="text"
          value={newCommentBody}
          onChange={(event) => setNewCommentBody(event.target.value)}
          required
        />
        {postError && <p role="alert">{postError}</p>}
        <button type="submit" disabled={isPosting}>
          {isPosting ? 'Posting...' : 'Post comment'}
        </button>
      </form>

      <p>
        <Link to={task ? `/projects/${task.project_id}` : '/'}>Back to project</Link>
      </p>
    </div>
  );
}

export default TaskDetailPage;

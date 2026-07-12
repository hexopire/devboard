import { Link, useParams } from 'react-router-dom';

// Placeholder only — Task 16.1 builds the real comment thread + file upload.
function TaskDetailPage() {
  const { taskId } = useParams();

  return (
    <div>
      <h1>Task {taskId}</h1>
      <p>Comment thread and attachments will be here (Task 16.1).</p>
      <p>
        <Link to="/projects/1">Back to project</Link>
      </p>
    </div>
  );
}

export default TaskDetailPage;

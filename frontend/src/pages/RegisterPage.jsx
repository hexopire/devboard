import { Link } from 'react-router-dom';

// Placeholder only — Task 13.1 builds the real register form.
function RegisterPage() {
  return (
    <div>
      <h1>Register</h1>
      <p>Register form goes here (Task 13.1).</p>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default RegisterPage;

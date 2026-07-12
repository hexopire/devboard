import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { listTeams, createTeam } from '../api/teams.js';

// No "not logged in" branch needed here — ProtectedRoute (Task 12.3)
// guarantees this only ever renders when a token exists, so `user`/`token`
// are always populated by the time this runs.
function DashboardPage() {
  const { user, token, logout } = useAuth();

  // The "list" half of the fetch -> state -> render loop: three pieces of
  // state (data, loading, error) for one request, same shape as the
  // login/register forms' loading/error state from Task 13.1 — just
  // triggered by useEffect on mount instead of a form submit.
  const [teams, setTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [teamsError, setTeamsError] = useState(null);

  // The "create" half — separate state because creating and listing are
  // independent requests that can fail independently (e.g. list succeeds,
  // then a create attempt 403s because this user isn't an admin).
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Runs once on mount (and again if the token ever changes, e.g. a
  // future re-login) — an empty-looking dependency array would be wrong
  // here since `token` genuinely is a dependency of this fetch.
  useEffect(() => {
    setIsLoadingTeams(true);
    setTeamsError(null);

    listTeams(token)
      .then(({ teams: fetchedTeams }) => setTeams(fetchedTeams))
      .catch((err) => setTeamsError(err.message))
      .finally(() => setIsLoadingTeams(false));
  }, [token]);

  async function handleCreateTeam(event) {
    event.preventDefault();
    setIsCreatingTeam(true);
    setCreateError(null);

    try {
      const { team } = await createTeam(token, newTeamName);
      // Prepend locally instead of re-fetching the whole list — the
      // backend already handed back the exact row it inserted, so a
      // second round trip just to see it in the UI would be wasted.
      // POST /teams's response has no role_in_team (that field only comes
      // from listTeams's JOIN) — but the backend always makes the creator
      // a 'lead' (Task 4.3), so it's safe to set explicitly here rather
      // than rendering "undefined" until the next refresh.
      setTeams((currentTeams) => [{ ...team, role_in_team: 'lead' }, ...currentTeams]);
      setNewTeamName('');
    } catch (err) {
      // Team creation is admin-only (Section 6 table) — a member/viewer
      // submitting this form sees the backend's real 403 message here,
      // not a hidden failure.
      setCreateError(err.message);
    } finally {
      setIsCreatingTeam(false);
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Logged in as <strong>{user.name}</strong> ({user.role}) —{' '}
        <button type="button" onClick={logout}>
          Logout
        </button>
      </p>

      <h2>Your teams</h2>
      {isLoadingTeams && <p>Loading teams...</p>}
      {teamsError && <p role="alert">{teamsError}</p>}
      {!isLoadingTeams && !teamsError && teams.length === 0 && <p>You're not on any teams yet.</p>}
      <ul>
        {teams.map((team) => (
          <li key={team.id}>
            <Link to={`/teams/${team.id}`}>{team.name}</Link> ({team.role_in_team})
          </li>
        ))}
      </ul>

      <h2>Create a team</h2>
      <form onSubmit={handleCreateTeam}>
        <label htmlFor="teamName">Team name</label>
        <input
          id="teamName"
          type="text"
          value={newTeamName}
          onChange={(event) => setNewTeamName(event.target.value)}
          required
        />
        {createError && <p role="alert">{createError}</p>}
        <button type="submit" disabled={isCreatingTeam}>
          {isCreatingTeam ? 'Creating...' : 'Create team'}
        </button>
      </form>
    </div>
  );
}

export default DashboardPage;

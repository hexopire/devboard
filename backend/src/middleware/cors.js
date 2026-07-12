// Browsers block cross-origin fetch() responses by default unless the
// server explicitly opts in via these headers — this has nothing to do
// with the backend itself working (curl/Postman never triggered it, since
// CORS is enforced by the BROWSER, not the server or any HTTP client).
// The frontend (localhost:5173) and backend (localhost:4000) are different
// origins (different port = different origin), so every fetch() call from
// Task 13.1 onward needs this or the browser silently blocks the response
// before JS ever sees it.
//
// For a non-GET/simple request (anything with a JSON body or an
// Authorization header — i.e. almost everything this API does), the
// browser first sends an OPTIONS "preflight" request asking permission,
// THEN sends the real request only if the preflight response allows it.
// That's what the `if (req.method === 'OPTIONS')` branch below answers.
function cors(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
}

module.exports = { cors };

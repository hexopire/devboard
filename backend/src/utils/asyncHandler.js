// Express 4 does NOT catch a rejected Promise from an async route handler
// automatically — only a SYNCHRONOUS throw gets forwarded to error
// middleware on its own (proven in Task 11.1's errorHandler.js test). An
// `await somethingThatRejects()` inside an async function that has no
// try/catch produces an unhandled promise rejection instead: Express never
// sees it, the response never gets sent, and the request just hangs until
// the client times out. In newer Node this also prints an
// UnhandledPromiseRejection warning and can crash the whole process.
//
// asyncHandler wraps a controller so its returned promise is always
// observed: Promise.resolve(fn(...)) normalizes the call (works whether fn
// throws synchronously or returns a rejected promise), and .catch(next)
// forwards any failure into Express's error-handling chain — the
// errorHandler middleware from Task 11.1 — instead of leaving it unhandled.
// This is what lets every controller below drop its manual try/catch.
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };

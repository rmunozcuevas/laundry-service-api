// Express 4 doesn't automatically forward rejected promises from async handlers.
// Wrap async controllers to ensure errors reach the global error middleware.
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

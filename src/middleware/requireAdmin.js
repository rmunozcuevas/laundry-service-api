export function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();

  const err = new Error('Forbidden: Admin access required');
  err.status = 403;
  return next(err);
}

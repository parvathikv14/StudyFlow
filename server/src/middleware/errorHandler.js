export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error.status === 403 && error.message === 'This origin is not allowed by the CORS policy.') {
    return res.status(403).json({ message: 'This origin is not allowed.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Please check the submitted fields.', errors: Object.values(error.errors).map((item) => item.message) });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'An account with that email already exists.' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'The requested resource identifier is invalid.' });
  }

  console.error(error);
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
}

const getMe = (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    res.status(200).json(req.user);
  } catch (err) {
    next(err);
  }
};

const logout = (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return next(destroyErr);
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out' });
      });
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, logout };

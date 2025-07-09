// middlewares/auth.js

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    return res.status(401).json({ message: "Non authentifié" });
  }
};

module.exports = {
  isAuthenticated
};

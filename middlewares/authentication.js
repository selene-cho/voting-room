const ERRORS = require("../controllers/messages");
const { renderError } = require("./error/renderError");

exports.authentication = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;

    return renderError(
      "auth/login",
      303,
      "message",
      ERRORS.AUTH.NOT_AUTHENTICATED
    )(req, res, next);
  }
  return next();
};

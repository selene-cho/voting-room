const passport = require("passport");
const User = require("../models/user");
const HttpError = require("../middlewares/error/httpError");
const ERRORS = require("./messages");
const { renderError } = require("../middlewares/error/renderError");

exports.renderLoginPage = async (req, res, next) => {
  try {
    res.render("auth/login", {
      title: "로그인 - Voting Room",
      error: req.flash("error"),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = (req, res, next) => {
  passport.authenticate(
    "local",
    { badRequestMessage: ERRORS.AUTH.NEED_ALL_INFO },
    (err, user, info) => {
      if (err) {
        return next(new HttpError(500, ERRORS.AUTH.LOGIN_PROCESS));
      }

      if (!user) {
        req.flash("error", info.message);

        return res.status(303).redirect("/login");
      }

      req.login(user, (err) => {
        if (err) {
          return next(new HttpError(500, ERRORS.AUTH.LOGIN_PROCESS));
        }

        return res.status(303).redirect("/");
      });
    }
  )(req, res, next);
};

exports.logout = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(400).render("error", { message: ERRORS.AUTH.NOT_AUTHENTICATED });
  }

  req.logout((err) => {
    if (err) {
      return next(new HttpError(500, ERRORS.AUTH.LOGOUT));
    }

    res.status(303).redirect("/login");
  });
};

exports.renderSignupPage = async (req, res, next) => {
  try {
    res.render("auth/signup", {
      title: "회원가입 - Voting Room",
      error: req.flash("error"),
    });
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  const { email, username, password, passwordConfirm } = req.body;

  try {
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return renderError(
        "auth/signup",
        400,
        "email",
        ERRORS.AUTH.EXISTING_EMAIL
      )(req, res, next);
    }

    const isUsernameExist = await User.findOne({ username });

    if (isUsernameExist) {
      return renderError(
        "auth/signup",
        400,
        "username",
        ERRORS.AUTH.EXISTING_USERNAME
      )(req, res, next);
    }

    if (password !== passwordConfirm) {
      return renderError(
        "auth/signup",
        400,
        "passwordConfirm",
        ERRORS.AUTH.UNMATCHED_PW
      )(req, res, next);
    }

    const user = new User({ email, username, password });

    await validateUserAsync(user);

    await user.save();

    return res.status(303).redirect("/login");
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = {};

      for (const field in err.errors) {
        messages[field] = err.errors[field].message;
      }

      return res.status(400).render("auth/signup", { error: messages });
    }
    return next(new HttpError(500, ERRORS.AUTH.SIGNUP_PROCESS));
  }
};

async function validateUserAsync(user) {
  try {
    await user.validateAsync();
  } catch (validationError) {
    const errorMessages = {};

    for (const filed in validationError.errors) {
      errorMessages[filed] = validationError.errors[filed].message;
    }

    throw errorMessages;
  }
}

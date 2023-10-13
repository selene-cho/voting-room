const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const ERRORS = require("./controllers/messages");

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    session: true,
    passReqToCallback : false,
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return done(null, false, {
          message: ERRORS.AUTH.WRONG_EMAIL_PW
        });
      }

      const isMatched = await user.comparePassword(password);

      if (!isMatched) {
        return done(null, false, {
          message: ERRORS.AUTH.WRONG_EMAIL_PW
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, false, {
        message: ERRORS.AUTH.LOGIN_PROCESS
      })
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.email);
  });

  passport.deserializeUser(async (email, done) => {
    try {
      const user = await User.findOne({ email });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

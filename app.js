require("dotenv").config();
const express = require("express");
const path = require("path");
const connectMongoDB = require("./db");
const nunjucks = require("nunjucks");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport");
const flash = require("connect-flash");
const morgan = require("morgan");
const ERRORS = require("./controllers/messages");

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const votingRouter = require("./routes/voting");

const app = express();

connectMongoDB();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

nunjucks.configure("views", {
  express: app,
  watch: true,
});

const isDevelopment = process.env.NODE_ENV;

if (isDevelopment) {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 259200,
    },
  })
);

passportConfig();

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/votings", votingRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} ${ERRORS.NOT_FOUND}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = isDevelopment ? err : {};

  const status = err.status || 500;

  if (!isDevelopment && status === 500 && err.message === "Internal Server Error") {
    res.render("error", {
      message: ERRORS.INTERNAL_SERVER_ERROR,
      error: err,
    });
  } else {
    res.render("error", {
      message: err.message || ERRORS.UNKNOWN_ERROR,
      error: { status: err.status },
    });
  }
});

app.listen(3000, () => {
  console.log("Server listening on port http://localhost:3000");
});

module.exports = app;

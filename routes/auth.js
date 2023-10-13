const express = require("express");
const router = express.Router();
const {
  renderLoginPage,
  login,
  logout,
  renderSignupPage,
  signup,
} = require("../controllers/auth.controller");

router.get("/login", renderLoginPage);
router.post("/login", login);

router.post("/logout", logout);

router.get("/signup", renderSignupPage);
router.post("/signup", signup);

module.exports = router;

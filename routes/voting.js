const express = require("express");
const router = express.Router();
const {
  getNewVotingForm,
  postNewVoting,
  getVotingPage,
  postVoting,
  deleteVoting,
} = require("../controllers/voting.controller");
const { authentication } = require("../middlewares/authentication");

router.get("/new", authentication, getNewVotingForm);
router.post("/new", authentication, postNewVoting);

router.get("/:id", getVotingPage);
router.post("/:id", postVoting);
router.delete("/:id", deleteVoting);

module.exports = router;

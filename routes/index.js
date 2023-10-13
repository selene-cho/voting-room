const express = require("express");
const router = express.Router();
const Voting = require("../models/voting");
const ERRORS = require("../controllers/messages");

const updateExpiredVotings = async () => {
  const currentTime = new Date();

  return await Voting.updateMany(
    { expiredAt: { $lt: currentTime } },
    { $set: { isActive: false } }
  );
};

router.get("/", async (req, res, next) => {
  try {
    await updateExpiredVotings();

    const isAuthenticated = req.isAuthenticated();
    const votings = await Voting.find().lean();

    const formattedVotings = votings.map((voting) => {
      const expiredAt = new Date(voting.expiredAt);
      const krExpiredAt = expiredAt.toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      return { ...voting, expiredAt: krExpiredAt };
    });

    if (votings.length === 0) {
      req.flash("error", ERRORS.VOTE.NO_VOTING_LIST);

      return res.render("index", {
        title: "Voting Room",
        votings: [],
        isAuthenticated,
        error: req.flash("error"),
      });
    }

    const filterStatus = req.query.status;
    let filteredVotings;

    if (filterStatus === "isActive") {
      filteredVotings = formattedVotings.filter(
        (voting) => voting.isActive === true
      );
    } else if (filterStatus === "isActiveFalse") {
      filteredVotings = formattedVotings.filter(
        (voting) => voting.isActive === false
      );
    } else {
      filteredVotings = formattedVotings;
    }

    res.render("index", {
      title: "Voting Room",
      votings: filteredVotings,
      isAuthenticated,
      error: req.flash("error"),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

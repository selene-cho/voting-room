const Voting = require("../models/voting");
const HttpError = require("../middlewares/error/httpError");
const ERRORS = require("../controllers/messages");

exports.getNewVotingForm = async (req, res, next) => {
  try {
    const isAuthenticated = req.isAuthenticated();

    if (!isAuthenticated) {
      req.session.returnTo = req.originalUrl;
      req.flash("error", ERRORS.AUTH.NOT_AUTHENTICATED);

      return res.redirect("/login");
    }

    res.render("votings/votingForm", {
      title: "투표 생성 - Voting Room",
      isAuthenticated,
      error: req.flash("error"),
    });
  } catch (err) {
    next(err);
  }
};

exports.postNewVoting = async (req, res, next) => {
  const { title, expiredAt, options } = req.body;
  const creator = req.user.username;

  try {
    const optionLists = options.map((option) => ({ content: option }));
    const newVoting = new Voting({
      title,
      options: optionLists,
      expiredAt,
      creator,
    });

    await newVoting.validate();

    await newVoting.save();

    return res.status(303).redirect("/");
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = {};

      for (const field in err.errors) {
        if (field.startsWith("options.")) {
          messages.options = err.errors[field].message;
        } else {
          messages[field] = err.errors[field].message;
        }
      }

      return res.status(400).render("votings/votingForm",
        { error: messages }
      );
    }
    return next(new HttpError(500, ERRORS.VOTE.FAILED_POST));
  }
};

const updateExpiredVotings = async () => {
  const currentTime = new Date();

  return await Voting.updateMany(
    { expiredAt: { $lt: currentTime } },
    { $set: { isActive: false } }
  );
};

exports.getVotingPage = async (req, res, next) => {
  try {
    await updateExpiredVotings();

    const isAuthenticated = req.isAuthenticated();
    const voting = await Voting.findById(req.params.id).lean();

    if (!voting) {
      return res.status(404)
        .render(
          "error",
          { message: ERRORS.NOT_FOUND },
        );
    }

    const expiredAt = new Date(voting.expiredAt);
    const krExpiredAt = expiredAt.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const formattedVoting = { ...voting, expiredAt: krExpiredAt };

    let hasVoted = false;
    let isCreator = false;

    if (req.user) {
      hasVoted = voting.options.some((option) =>
        option.votedUsers.some((user) => user === req.user.username)
      );
      isCreator = voting.creator === req.user.username;
    }

    res.render("votings/voting", {
      title: "Voting Room",
      voting: formattedVoting,
      isAuthenticated,
      hasVoted,
      isCreator,
      error: req.flash("error"),
    });
  } catch (err) {
    return next(new HttpError(500, ERRORS.PROCESS_ERROR));
  }
};

exports.postVoting = async (req, res, next) => {
  const votingId = req.params.id;
  const selectedOption = req.body.option;

  try {
    if (!req.isAuthenticated()) {
      req.flash("error", ERRORS.AUTH.NOT_AUTHENTICATED);

      return res.redirect("/login");
    }

    const voting = await Voting.findById(votingId);

    if (!voting) {
      return next(new HttpError(404, ERRORS.VOTE.NOT_FOUND));
    }

    const username = req?.user.username;

    if (req.user) {
      let hasVoted = false;

      hasVoted = voting.options.some((option) =>
        option.votedUsers.some((user) => user === username)
      );

      if (hasVoted) {
        req.flash("error", ERRORS.VOTE.ALREADY_VOTED);

        return res.redirect(`/votings/${votingId}`);
      }
    }

    const optionIndex = voting.options.findIndex((option) =>
      option._id.equals(selectedOption)
    );

    if (optionIndex === -1) {
      req.flash("error", ERRORS.VOTE.INVALID_OPTION);
      return res.redirect(`/votings/${votingId}`);
    }

    await Voting.updateOne(
      { _id: votingId, "options._id": selectedOption },
      { $addToSet: { "options.$.votedUsers": username } }
    );

    return res.redirect(`/votings/${votingId}`);
  } catch (err) {
    return next(new HttpError(500, ERRORS.VOTE.PROCESS_ERROR));
  }
};

exports.deleteVoting = async (req, res, next) => {
  try {
    const votingId = req.params.id;

    await Voting.findByIdAndDelete(votingId);

    res.status(200).json({ message: ERRORS.VOTE.SUCCESS_DELETE });
  } catch (err) {
    return next(new HttpError(500, ERRORS.VOTE.FAILED_DELETE));
  }
};

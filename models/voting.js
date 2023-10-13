const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "투표 항목은 최소 2개 이상이어야 합니다."],
  },
  votedUsers: [
    {
      type: String,
      ref: "User",
    },
  ],
});

const votingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "투표 제목을 입력해주세요."],
  },
  creator: {
    type: String,
    ref: "User",
    required: true,
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: (options) => options.length >= 2,
      message: "투표 항목은 최소 2개 이상이어야 합니다.",
    },
  },
  expiredAt: {
    type: Date,
    required: [true, "투표 종료일을 지정해주세요"],
    validate: {
      validator: (v) => v > Date.now(),
      message: "종료 날짜는 현재 날짜 이후여야 합니다.",
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Voting", votingSchema);

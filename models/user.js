const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const usernamePattern = /^[\wㄱ-ㅎ가-힣].+$/;
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordPattern =
  /^(?=.*[a-zA-Z])(?=.*[\d])(?=.*[!@#$%^&*()-_=+₩~\{\}\[\]\|\:\;\"\'\<\>\,.\?\/]).+$/;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "이메일 주소를 입력해주세요."],
    unique: true,
    validate: {
      validator: (v) => emailPattern.test(v),
      message: "올바르지 않은 이메일 형식입니다.",
    },
  },
  username: {
    type: String,
    required: [true, "닉네임을 입력해주세요."],
    unique: true,
    min: 2,
    validate: {
      validator: (v) => usernamePattern.test(v),
      message: "최소 2자이어야 하고, 특수문자를 포함해서는 안됩니다.",
    },
  },
  password: {
    type: String,
    required: [true, "비밀번호를 입력해주세요."],
    min: 8,
    max: 32,
    validate: {
      validator: (v) => passwordPattern.test(v),
      message: "8~32자이고 영어 대소문자, 숫자, 특수문자를 하나 이상 포함해야 합니다.",
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.validateAsync = async function () {
  try {
    await this.validateSync();
  } catch (error) {
    throw error;
  }
};

userSchema.methods.comparePassword = async function (inputPassword) {
  if (!inputPassword) return false;

  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

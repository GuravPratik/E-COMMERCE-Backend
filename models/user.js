const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxLength: [40, "Please should be more than 40 character"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    validate: [validator.isEmail, "Please enter email in correct format"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "Password should be 8 or more character"],
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordMatch = async (userPassword) => {
  return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

userSchema.methods.getForgotPasswordToken = function () {
  const forgotToken = crypto.randomBytes(20).toString("hex");

  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);

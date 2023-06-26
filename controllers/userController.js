const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");
exports.SignUp = BigPromise(async (req, res, next) => {
  let result;

  if (req.files) {
    let file = req.files.displayPhoto;
    result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "Ecommerce_Backend",
      width: 150,
      crop: "scale",
    });
  }

  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return next(new Error("Please enter all the required fields"));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter email and password",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User is not exist! Please first Sign up",
    });
  }

  const matchPassword = await user.isPasswordMatch(password);
  if (!matchPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Password does not match" });
  }

  cookieToken(user, res);
};

exports.logout = async (req, res) => {
  res
    .cookie("Token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "Logout successfully",
    });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: `You don't have an account Please first create a account`,
    });
  }

  // generating token
  const forgotToken = user.getForgotPasswordToken();
  // saving token in database
  await user.save({ validateBeforeSave: false });

  // creating a url and message
  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `Copy paste this link in your URL and hit enter \n\n ${url}`;

  try {
    // sending email
    await mailHelper({
      toEmail: user.email,
      subject: "Password Reset email",
      message,
    });
    return res.status(200).json({
      success: true,
      message: "Email is successfully send",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error while sending a mail",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // getting token from params
    const token = req.params.token;

    const encryptToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // checking if token is valid or not
    const user = await User.findOne({
      forgotPasswordToken: encryptToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password does not match",
      });
    }

    user.password = req.body.password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password is successfully reset",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getLoggedInUserDetails = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  res.status(200).json({
    success: true,
    user,
  });
};

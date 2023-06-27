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

exports.passwordUpdate = async (req, res) => {
  // get user from the token
  try {
    const user = await User.findById(req.user.id);

    // check if the oldPassword is match or not
    const isOldPasswordMatch = await user.isPasswordMatch(req.body.oldPassword);

    if (!isOldPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Please enter correct old Password",
      });
    }

    // update password with new password
    user.password = req.body.confirmPassword;

    await user.save();

    // sending new updated token and user
    cookieToken(user, res);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.name) {
      updateData.name = req.body.name;
    }

    if (req.body.email) {
      updateData.email = req.body.email;
    }

    if (req.files) {
      const previousDP = await User.findById(req.user.id);

      // delete the previous image
      await cloudinary.v2.uploader.destroy(previousDP.photo.id);
      const file = req.files.displayPhoto;
      // update the new image
      const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "Ecommerce_Backend",
        width: 150,
        crop: "scale",
      });
      // get public_id and secure url of the new image
      updateData.photo = {
        id: result.public_id,
        secure_url: result.secure_url,
      };
    }

    // update the user info
    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "User info is updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// admin controllers

exports.adminGetAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.adminGetSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.adminUpdateUserRole = async (req, res) => {
  try {
    const updateData = { role: req.body.role };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "User role change to Admin",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.adminDeleteSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await cloudinary.v2.uploader.destroy(user.photo.id);

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "user is deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

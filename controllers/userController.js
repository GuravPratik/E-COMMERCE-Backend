const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");
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

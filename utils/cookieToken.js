const cookieToken = (user, res) => {
  const token = user.getJwtToken();

  const option = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
  };
  user.password = undefined;
  res.status(201).cookie("Token", token, option).json({
    success: true,
    token,
    user,
  });
};

module.exports = cookieToken;

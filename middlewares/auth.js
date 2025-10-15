const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

async function restrictToLoggedInUser(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found." });
      }

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "Not authorized, invalid token." });
      }
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Not authorized, token has expired." });
      }
      return res.status(401).json({ message: "Not authorized, token failed." });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided." });
  }
}

function restrictTo(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. User role '${req.user.role}' is not allowed to perform this action.`,
      });
    }
    next();
  };
}

module.exports = {
  restrictToLoggedInUser,
  restrictTo,
};

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

async function handleUserSignup(req, res) {
  const { username, email, password, role } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and Password are required." });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    const user = await User.create({ username, email, password, role });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,

        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error during signup.", error: error.message });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and Password are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        _id: user._id,
        email: user.email,
        role: user.role,

        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: "Invalid Email or Password." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error during login." });
  }
}

async function handleFetchUserProfile(req, res) {
  return res.status(200).json(req.user);
}

async function handleUpdateUserProfile(req, res) {
  const userId = req.user._id;
  const { bio, profilePicture, username } = req.body;

  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (profilePicture !== undefined) updates.profilePicture = profilePicture;
  if (username !== undefined) updates.username = username;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Server error during profile update.",
        error: error.message,
      });
  }
}

async function handleUserLogout(req, res) {
  return res
    .status(200)
    .json({
      message: "Logout successful. Please clear the token from client storage.",
    });
}
module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleFetchUserProfile,
  handleUpdateUserProfile,
  handleUserLogout,
};

const { body } = require("express-validator");

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const registerValidation = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["student", "admin"])
    .withMessage("Role must be student or admin"),
];

const loginValidation = [
  body("email").trim().notEmpty().withMessage("Email or username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "User with this email already exists" });
  }

  const user = await User.create({ name, email, password, role: role || "student" });

  const token = generateToken({ id: user._id, role: user.role });

  return res.status(201).json({
    message: "Registration successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedIdentifier = email.trim();
  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier.toLowerCase() }, { name: normalizedIdentifier }],
  }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken({ id: user._id, role: user.role });

  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const profile = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = {
  registerValidation,
  loginValidation,
  register,
  login,
  profile,
};

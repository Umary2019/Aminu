const express = require("express");

const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const {
  registerValidation,
  loginValidation,
  register,
  login,
  profile,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.get("/profile", protect, profile);

module.exports = router;

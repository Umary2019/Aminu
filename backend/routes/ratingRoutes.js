const express = require("express");

const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const {
  ratePaperValidation,
  paperRatingsValidation,
  ratePaper,
  getPaperRatingSummary,
} = require("../controllers/ratingController");

const router = express.Router();

router.post("/", protect, ratePaperValidation, validateRequest, ratePaper);
router.get("/paper/:paperId", paperRatingsValidation, validateRequest, getPaperRatingSummary);

module.exports = router;

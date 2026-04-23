const express = require("express");

const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const {
  createCommentValidation,
  paperCommentsValidation,
  createComment,
  getPaperComments,
} = require("../controllers/commentController");

const router = express.Router();

router.post("/", protect, createCommentValidation, validateRequest, createComment);
router.get("/paper/:paperId", paperCommentsValidation, validateRequest, getPaperComments);

module.exports = router;

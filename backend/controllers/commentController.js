const { body, param } = require("express-validator");

const Comment = require("../models/Comment");
const Paper = require("../models/Paper");
const asyncHandler = require("../utils/asyncHandler");

const createCommentValidation = [
  body("paperId").isMongoId().withMessage("Valid paperId is required"),
  body("comment")
    .trim()
    .isLength({ min: 2, max: 1000 })
    .withMessage("Comment must be between 2 and 1000 characters"),
];

const paperCommentsValidation = [
  param("paperId").isMongoId().withMessage("Valid paperId is required"),
];

const createComment = asyncHandler(async (req, res) => {
  const { paperId, comment } = req.body;

  const paper = await Paper.findById(paperId);
  if (!paper || paper.status !== "approved") {
    return res.status(404).json({ message: "Paper not found" });
  }

  const newComment = await Comment.create({
    userId: req.user._id,
    paperId,
    comment,
  });

  const populatedComment = await Comment.findById(newComment._id).populate("userId", "name");

  return res.status(201).json({ message: "Comment created", comment: populatedComment });
});

const getPaperComments = asyncHandler(async (req, res) => {
  const { paperId } = req.params;

  const comments = await Comment.find({ paperId })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  return res.status(200).json({ comments });
});

module.exports = {
  createCommentValidation,
  paperCommentsValidation,
  createComment,
  getPaperComments,
};

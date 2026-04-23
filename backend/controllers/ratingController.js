const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const Rating = require("../models/Rating");
const Paper = require("../models/Paper");
const asyncHandler = require("../utils/asyncHandler");

const ratePaperValidation = [
  body("paperId").isMongoId().withMessage("Valid paperId is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
];

const paperRatingsValidation = [
  param("paperId").isMongoId().withMessage("Valid paperId is required"),
];

const ratePaper = asyncHandler(async (req, res) => {
  const { paperId, rating } = req.body;

  const paper = await Paper.findById(paperId);
  if (!paper || paper.status !== "approved") {
    return res.status(404).json({ message: "Paper not found" });
  }

  const savedRating = await Rating.findOneAndUpdate(
    { userId: req.user._id, paperId },
    { userId: req.user._id, paperId, rating },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(200).json({ message: "Rating saved", rating: savedRating });
});

const getPaperRatingSummary = asyncHandler(async (req, res) => {
  const { paperId } = req.params;

  const [summary] = await Rating.aggregate([
    { $match: { paperId: new mongoose.Types.ObjectId(paperId) } },
    {
      $group: {
        _id: "$paperId",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  return res.status(200).json({
    averageRating: summary ? Number(summary.averageRating.toFixed(1)) : 0,
    totalRatings: summary ? summary.totalRatings : 0,
  });
});

module.exports = {
  ratePaperValidation,
  paperRatingsValidation,
  ratePaper,
  getPaperRatingSummary,
};

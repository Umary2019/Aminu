const { body, param } = require("express-validator");
const cloudinary = require("../config/cloudinary");

const User = require("../models/User");
const Paper = require("../models/Paper");
const asyncHandler = require("../utils/asyncHandler");

const paperDecisionValidation = [
  param("id").isMongoId().withMessage("Valid paper id is required"),
  body("status").isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
];

const deletePaperValidation = [
  param("id").isMongoId().withMessage("Valid paper id is required"),
];

const getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalPapers, approvedPapers, pendingPapers, rejectedPapers, uploadsByMonth] =
    await Promise.all([
      User.countDocuments(),
      Paper.countDocuments(),
      Paper.countDocuments({ status: "approved" }),
      Paper.countDocuments({ status: "pending" }),
      Paper.countDocuments({ status: "rejected" }),
      Paper.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  return res.status(200).json({
    totalUsers,
    totalPapers,
    approvedPapers,
    pendingPapers,
    rejectedPapers,
    uploadsByMonth,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
  return res.status(200).json({ users });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.role === "admin") {
    return res.status(403).json({ message: "Admin accounts cannot be deleted from the dashboard" });
  }

  await user.deleteOne();

  return res.status(200).json({ message: "User deleted successfully" });
});

const getAllPapers = asyncHandler(async (req, res) => {
  const papers = await Paper.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "uploadedBy",
        foreignField: "_id",
        as: "uploader",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "paperId",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "ratings",
        localField: "_id",
        foreignField: "paperId",
        as: "ratings",
      },
    },
    {
      $addFields: {
        commentCount: { $size: "$comments" },
        totalRatings: { $size: "$ratings" },
        averageRating: {
          $cond: [
            { $gt: [{ $size: "$ratings" }, 0] },
            { $round: [{ $avg: "$ratings.rating" }, 1] },
            0,
          ],
        },
        uploadedBy: {
          $let: {
            vars: { firstUploader: { $arrayElemAt: ["$uploader", 0] } },
            in: {
              _id: "$$firstUploader._id",
              name: "$$firstUploader.name",
              email: "$$firstUploader.email",
              role: "$$firstUploader.role",
            },
          },
        },
      },
    },
    {
      $project: {
        uploader: 0,
        comments: 0,
        ratings: 0,
      },
    },
  ]);

  return res.status(200).json({ papers });
});

const reviewPaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  paper.status = req.body.status;
  await paper.save();

  return res.status(200).json({ message: "Paper status updated", paper });
});

const deletePaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  if (cloudinary.isConfigured) {
    await cloudinary.uploader.destroy(paper.filePublicId, { resource_type: "raw" });
  }
  await paper.deleteOne();

  return res.status(200).json({ message: "Paper deleted successfully" });
});

module.exports = {
  paperDecisionValidation,
  deletePaperValidation,
  getAnalytics,
  getAllUsers,
  deleteUser,
  getAllPapers,
  reviewPaper,
  deletePaper,
};

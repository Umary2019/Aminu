const { body } = require("express-validator");

const Favorite = require("../models/Favorite");
const Activity = require("../models/Activity");
const Paper = require("../models/Paper");
const PaperReport = require("../models/PaperReport");
const Notification = require("../models/Notification");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const favoriteValidation = [body("paperId").isMongoId().withMessage("Valid paperId is required")];
const reportValidation = [
  body("paperId").isMongoId().withMessage("Valid paperId is required"),
  body("reason")
    .isIn(["wrong-paper", "bad-scan", "wrong-course", "duplicate", "other"])
    .withMessage("Invalid report reason"),
  body("details").optional().isLength({ max: 1000 }).withMessage("Details too long"),
];
const preferencesValidation = [
  body("departments").isArray({ max: 20 }).withMessage("Departments must be an array with max 20 items"),
  body("departments.*").isString().withMessage("Department items must be strings"),
];

const addFavorite = asyncHandler(async (req, res) => {
  const { paperId } = req.body;

  const paper = await Paper.findById(paperId);
  if (!paper || paper.status !== "approved" || paper.isDeleted) {
    return res.status(404).json({ message: "Paper not found" });
  }

  await Favorite.findOneAndUpdate(
    { userId: req.user._id, paperId },
    { userId: req.user._id, paperId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Activity.create({ userId: req.user._id, paperId, action: "favorite" });

  return res.status(200).json({ message: "Added to favorites" });
});

const removeFavorite = asyncHandler(async (req, res) => {
  const { paperId } = req.params;

  await Favorite.deleteOne({ userId: req.user._id, paperId });
  return res.status(200).json({ message: "Removed from favorites" });
});

const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id })
    .populate({
      path: "paperId",
      match: { status: "approved", isDeleted: false },
      populate: { path: "uploadedBy", select: "name role" },
    })
    .sort({ createdAt: -1 });

  const papers = favorites.filter((item) => item.paperId).map((item) => item.paperId);
  return res.status(200).json({ papers });
});

const getActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);

  const activities = await Activity.find({ userId: req.user._id })
    .populate("paperId", "title courseCode faculty department year semester")
    .sort({ createdAt: -1 })
    .limit(limit);

  return res.status(200).json({ activities });
});

const reportPaper = asyncHandler(async (req, res) => {
  const { paperId, reason, details = "" } = req.body;

  const paper = await Paper.findById(paperId);
  if (!paper || paper.status !== "approved" || paper.isDeleted) {
    return res.status(404).json({ message: "Paper not found" });
  }

  const report = await PaperReport.create({
    paperId,
    reportedBy: req.user._id,
    reason,
    details,
  });

  return res.status(201).json({ message: "Report submitted", report });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const departments = (req.body.departments || []).slice(0, 20);

  const user = await User.findById(req.user._id);
  user.preferences = user.preferences || {};
  user.preferences.departments = departments;
  await user.save();

  return res.status(200).json({ message: "Preferences updated", preferences: user.preferences });
});

const getRecommendations = asyncHandler(async (req, res) => {
  const recentActivities = await Activity.find({ userId: req.user._id, paperId: { $ne: null } })
    .populate("paperId", "faculty department level")
    .sort({ createdAt: -1 })
    .limit(50);

  const user = await User.findById(req.user._id).select("preferences");
  const preferredDepartments = user?.preferences?.departments || [];

  const departmentsFromActivity = recentActivities
    .map((entry) => entry.paperId?.department)
    .filter(Boolean);

  const facultiesFromActivity = recentActivities
    .map((entry) => entry.paperId?.faculty)
    .filter(Boolean);

  const matchDepartments = [...new Set([...preferredDepartments, ...departmentsFromActivity])];
  const matchFaculties = [...new Set(facultiesFromActivity)];

  const query = {
    status: "approved",
    isDeleted: false,
    ...(matchDepartments.length > 0 || matchFaculties.length > 0
      ? {
          $or: [
            ...(matchDepartments.length > 0 ? [{ department: { $in: matchDepartments } }] : []),
            ...(matchFaculties.length > 0 ? [{ faculty: { $in: matchFaculties } }] : []),
          ],
        }
      : {}),
  };

  const recommendations = await Paper.find(query)
    .sort({ createdAt: -1, downloadCount: -1 })
    .limit(12)
    .populate("uploadedBy", "name role");

  return res.status(200).json({ recommendations });
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return res.status(200).json({ notifications });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Notification.updateOne({ _id: id, userId: req.user._id }, { read: true });
  return res.status(200).json({ message: "Notification updated" });
});

module.exports = {
  favoriteValidation,
  reportValidation,
  preferencesValidation,
  addFavorite,
  removeFavorite,
  getFavorites,
  getActivity,
  reportPaper,
  updatePreferences,
  getRecommendations,
  getNotifications,
  markNotificationRead,
};

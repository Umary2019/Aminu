const { body, param, query } = require("express-validator");
const cloudinary = require("../config/cloudinary");

const User = require("../models/User");
const Paper = require("../models/Paper");
const Comment = require("../models/Comment");
const PaperReport = require("../models/PaperReport");
const Activity = require("../models/Activity");
const asyncHandler = require("../utils/asyncHandler");
const { logAudit } = require("../utils/auditLog");

const paperDecisionValidation = [
  param("id").isMongoId().withMessage("Valid paper id is required"),
  body("status").isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
];

const deletePaperValidation = [
  param("id").isMongoId().withMessage("Valid paper id is required"),
];

const restorePaperValidation = [param("id").isMongoId().withMessage("Valid paper id is required")];
const commentModerationValidation = [param("id").isMongoId().withMessage("Valid comment id is required")];
const reportStatusValidation = [
  param("id").isMongoId().withMessage("Valid report id is required"),
  body("status").isIn(["open", "reviewed", "resolved"]).withMessage("Invalid report status"),
];
const bulkCreateValidation = [
  body("papers").isArray({ min: 1 }).withMessage("papers must be a non-empty array"),
  body("papers.*.title").isString().notEmpty().withMessage("title required"),
  body("papers.*.courseCode").isString().notEmpty().withMessage("courseCode required"),
  body("papers.*.faculty").isString().notEmpty().withMessage("faculty required"),
  body("papers.*.department").isString().notEmpty().withMessage("department required"),
  body("papers.*.level").isString().notEmpty().withMessage("level required"),
  body("papers.*.year").isInt({ min: 2000 }).withMessage("year required"),
  body("papers.*.semester").isIn(["First", "Second"]).withMessage("semester required"),
  body("papers.*.fileUrl").isURL().withMessage("fileUrl must be valid"),
  body("papers.*.filePublicId").isString().notEmpty().withMessage("filePublicId required"),
];
const listQueryValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().isString(),
  query("status").optional().isString(),
  query("role").optional().isIn(["student", "admin"]),
  query("includeDeleted").optional().isBoolean(),
  query("hidden").optional().isBoolean(),
];

const toBoolean = (value) => String(value).toLowerCase() === "true";

const csvEscape = (value) => {
  const normalized = String(value ?? "").replace(/"/g, '""');
  return `"${normalized}"`;
};

const getAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalPapers, approvedPapers, pendingPapers, rejectedPapers, deletedPapers, uploadsByMonth] =
    await Promise.all([
      User.countDocuments(),
      Paper.countDocuments({ isDeleted: false }),
      Paper.countDocuments({ status: "approved", isDeleted: false }),
      Paper.countDocuments({ status: "pending", isDeleted: false }),
      Paper.countDocuments({ status: "rejected", isDeleted: false }),
      Paper.countDocuments({ isDeleted: true }),
      Paper.aggregate([
        { $match: { isDeleted: false } },
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
    deletedPapers,
    uploadsByMonth,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  const search = req.query.search?.trim();
  const role = req.query.role;

  const filters = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    User.find(filters).select("name email role createdAt").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filters),
  ]);

  return res.status(200).json({
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
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

  await logAudit({
    actorId: req.user._id,
    action: "delete-user",
    entityType: "user",
    entityId: user._id,
    details: { email: user.email, role: user.role },
  });

  return res.status(200).json({ message: "User deleted successfully" });
});

const getAllPapers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  const includeDeleted = toBoolean(req.query.includeDeleted || "false");
  const search = req.query.search?.trim();
  const status = req.query.status;

  const matchStage = {
    ...(includeDeleted ? {} : { isDeleted: false }),
    ...(status ? { status } : {}),
    ...(search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { courseCode: { $regex: search, $options: "i" } },
            { faculty: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
          ],
        }
      : {}),
  };

  const papers = await Paper.aggregate([
    { $match: matchStage },
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
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await Paper.countDocuments(matchStage);

  return res.status(200).json({
    papers,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

const reviewPaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  paper.status = req.body.status;
  await paper.save();

  await logAudit({
    actorId: req.user._id,
    action: "review-paper",
    entityType: "paper",
    entityId: paper._id,
    details: { status: req.body.status },
  });

  return res.status(200).json({ message: "Paper status updated", paper });
});

const deletePaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  paper.isDeleted = true;
  paper.deletedAt = new Date();
  paper.deletedBy = req.user._id;
  paper.status = "deleted";
  await paper.save();

  await logAudit({
    actorId: req.user._id,
    action: "soft-delete-paper",
    entityType: "paper",
    entityId: paper._id,
    details: { title: paper.title, courseCode: paper.courseCode },
  });

  return res.status(200).json({ message: "Paper moved to recycle bin" });
});

const restorePaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  paper.isDeleted = false;
  paper.deletedAt = null;
  paper.deletedBy = null;
  if (paper.status === "deleted") {
    paper.status = "approved";
  }
  await paper.save();

  await logAudit({
    actorId: req.user._id,
    action: "restore-paper",
    entityType: "paper",
    entityId: paper._id,
    details: { title: paper.title },
  });

  return res.status(200).json({ message: "Paper restored", paper });
});

const permanentlyDeletePaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper) {
    return res.status(404).json({ message: "Paper not found" });
  }

  if (cloudinary.isConfigured && paper.filePublicId) {
    await cloudinary.uploader.destroy(paper.filePublicId, { resource_type: "raw" });
  }
  await paper.deleteOne();

  await logAudit({
    actorId: req.user._id,
    action: "hard-delete-paper",
    entityType: "paper",
    entityId: paper._id,
    details: { title: paper.title },
  });

  return res.status(200).json({ message: "Paper permanently deleted" });
});

const getCommentModeration = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  const hidden = req.query.hidden;

  const filters = {
    ...(hidden === undefined ? {} : { isHidden: toBoolean(hidden) }),
  };

  const [comments, total] = await Promise.all([
    Comment.find(filters)
      .populate("userId", "name email")
      .populate("paperId", "title courseCode")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(filters),
  ]);

  return res.status(200).json({
    comments,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

const hideComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  comment.isHidden = true;
  comment.hiddenBy = req.user._id;
  comment.hiddenAt = new Date();
  await comment.save();

  await logAudit({
    actorId: req.user._id,
    action: "hide-comment",
    entityType: "comment",
    entityId: comment._id,
    details: { paperId: comment.paperId },
  });

  return res.status(200).json({ message: "Comment hidden" });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  await comment.deleteOne();

  await logAudit({
    actorId: req.user._id,
    action: "delete-comment",
    entityType: "comment",
    entityId: comment._id,
    details: { paperId: comment.paperId },
  });

  return res.status(200).json({ message: "Comment deleted" });
});

const getReports = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;
  const status = req.query.status;

  const filters = {
    ...(status ? { status } : {}),
  };

  const [reports, total] = await Promise.all([
    PaperReport.find(filters)
      .populate("paperId", "title courseCode")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PaperReport.countDocuments(filters),
  ]);

  return res.status(200).json({
    reports,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

const updateReportStatus = asyncHandler(async (req, res) => {
  const report = await PaperReport.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  report.status = req.body.status;
  await report.save();

  await logAudit({
    actorId: req.user._id,
    action: "update-report-status",
    entityType: "report",
    entityId: report._id,
    details: { status: report.status },
  });

  return res.status(200).json({ message: "Report status updated", report });
});

const getAuditTrail = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);
  const skip = (page - 1) * limit;

  const AuditLog = require("../models/AuditLog");
  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate("actorId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(),
  ]);

  return res.status(200).json({
    logs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});

const exportCsv = asyncHandler(async (req, res) => {
  const { type = "papers" } = req.query;

  if (type === "users") {
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
    const csv = [
      "name,email,role,createdAt",
      ...users.map((u) => [csvEscape(u.name), csvEscape(u.email), csvEscape(u.role), csvEscape(u.createdAt.toISOString())].join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="users-report.csv"');
    return res.status(200).send(csv);
  }

  if (type === "analytics") {
    const [totalUsers, totalPapers, approvedPapers, pendingPapers, rejectedPapers, deletedPapers, totalDownloads] = await Promise.all([
      User.countDocuments(),
      Paper.countDocuments({ isDeleted: false }),
      Paper.countDocuments({ status: "approved", isDeleted: false }),
      Paper.countDocuments({ status: "pending", isDeleted: false }),
      Paper.countDocuments({ status: "rejected", isDeleted: false }),
      Paper.countDocuments({ isDeleted: true }),
      Paper.aggregate([{ $group: { _id: null, value: { $sum: "$downloadCount" } } }]),
    ]);

    const csv = [
      "metric,value",
      `totalUsers,${totalUsers}`,
      `totalPapers,${totalPapers}`,
      `approvedPapers,${approvedPapers}`,
      `pendingPapers,${pendingPapers}`,
      `rejectedPapers,${rejectedPapers}`,
      `deletedPapers,${deletedPapers}`,
      `totalDownloads,${totalDownloads[0]?.value || 0}`,
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="analytics-report.csv"');
    return res.status(200).send(csv);
  }

  const papers = await Paper.find().select("title courseCode faculty department level year semester status isDeleted downloadCount createdAt");
  const csv = [
    "title,courseCode,faculty,department,level,year,semester,status,isDeleted,downloadCount,createdAt",
    ...papers.map((p) =>
      [
        csvEscape(p.title),
        csvEscape(p.courseCode),
        csvEscape(p.faculty),
        csvEscape(p.department),
        csvEscape(p.level),
        csvEscape(p.year),
        csvEscape(p.semester),
        csvEscape(p.status),
        csvEscape(p.isDeleted),
        csvEscape(p.downloadCount),
        csvEscape(p.createdAt.toISOString()),
      ].join(",")
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="papers-report.csv"');
  return res.status(200).send(csv);
});

const bulkCreatePapers = asyncHandler(async (req, res) => {
  const payload = req.body.papers || [];

  const papers = await Paper.insertMany(
    payload.map((item) => ({
      ...item,
      uploadedBy: req.user._id,
      status: "approved",
      isDeleted: false,
    }))
  );

  await logAudit({
    actorId: req.user._id,
    action: "bulk-create-papers",
    entityType: "paper",
    details: { count: papers.length },
  });

  return res.status(201).json({ message: `Bulk import complete (${papers.length} papers)`, papers });
});

const getDownloadActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 100), 1), 200);
  const activities = await Activity.find({ action: { $in: ["download", "view"] } })
    .populate("userId", "name email")
    .populate("paperId", "title courseCode")
    .sort({ createdAt: -1 })
    .limit(limit);

  return res.status(200).json({ activities });
});

module.exports = {
  paperDecisionValidation,
  deletePaperValidation,
  restorePaperValidation,
  commentModerationValidation,
  reportStatusValidation,
  bulkCreateValidation,
  listQueryValidation,
  getAnalytics,
  getAllUsers,
  deleteUser,
  getAllPapers,
  reviewPaper,
  deletePaper,
  restorePaper,
  permanentlyDeletePaper,
  getCommentModeration,
  hideComment,
  deleteComment,
  getReports,
  updateReportStatus,
  getAuditTrail,
  exportCsv,
  bulkCreatePapers,
  getDownloadActivity,
};

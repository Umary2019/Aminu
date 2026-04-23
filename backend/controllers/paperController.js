const { body, query, param } = require("express-validator");
const streamifier = require("streamifier");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const cloudinary = require("../config/cloudinary");
const Paper = require("../models/Paper");
const Rating = require("../models/Rating");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const uploadPaperValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("courseCode").trim().notEmpty().withMessage("Course code is required"),
  body("faculty").trim().notEmpty().withMessage("Faculty is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("level").trim().notEmpty().withMessage("Level is required"),
  body("year").isInt({ min: 2000 }).withMessage("Valid year is required"),
  body("semester").isIn(["First", "Second"]).withMessage("Semester must be First or Second"),
];

const searchPapersValidation = [
  query("faculty").optional().isString(),
  query("department").optional().isString(),
  query("level").optional().isString(),
  query("semester").optional().isIn(["First", "Second"]),
  query("courseCode").optional().isString(),
  query("q").optional().isString(),
  query("year").optional().isInt({ min: 2000 }),
  query("minYear").optional().isInt({ min: 2000 }),
  query("maxYear").optional().isInt({ min: 2000 }),
  query("sort").optional().isIn(["newest", "oldest", "highest-rated", "most-downloaded", "relevance"]),
];

const paperByIdValidation = [param("id").isMongoId().withMessage("Valid paper id is required")];

const transientCloudinaryErrors = new Set(["TimeoutError", "ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT"]);

const sanitizeFilename = (originalname) => {
  const base = path.basename(originalname || "paper", path.extname(originalname || ""));
  const cleaned = base
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return cleaned || "paper";
};

const saveFileLocally = async (req, buffer, originalname) => {
  const uploadsDir = path.join(__dirname, "..", "uploads", "papers");
  const filename = `${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(originalname)}.pdf`;
  const filePath = path.join(uploadsDir, filename);

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(filePath, buffer);

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/papers/${filename}`;
  return {
    secure_url: fileUrl,
    public_id: `local/papers/${filename}`,
    storage: "local",
  };
};

const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "past-question-papers",
        use_filename: true,
        unique_filename: true,
        filename_override: originalname.replace(/\.pdf$/i, ""),
        timeout: Number(process.env.CLOUDINARY_TIMEOUT || 120000),
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message || "Cloudinary upload failed"));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.on("error", (error) => {
      reject(new Error(error.message || "Cloudinary upload stream failed"));
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const uploadPaper = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF file is required" });
  }

  const { title, courseCode, faculty, department, level, year, semester } = req.body;
  let uploadResult;

  if (cloudinary.isConfigured) {
    try {
      uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    } catch (error) {
      const isTransient =
        transientCloudinaryErrors.has(error?.name) ||
        transientCloudinaryErrors.has(error?.code) ||
        /request timeout|eai_again|enotfound|etimedout/i.test(error?.message || "");

      if (!isTransient) {
        return res.status(502).json({
          message: error.message || "Could not upload PDF to Cloudinary",
        });
      }

      uploadResult = await saveFileLocally(req, req.file.buffer, req.file.originalname);
    }
  } else {
    uploadResult = await saveFileLocally(req, req.file.buffer, req.file.originalname);
  }

  const paper = await Paper.create({
    title,
    courseCode,
    faculty,
    department,
    level,
    year,
    semester,
    fileUrl: uploadResult.secure_url,
    filePublicId: uploadResult.public_id,
    uploadedBy: req.user._id,
    status: req.user.role === "admin" ? "approved" : "pending",
  });

  const subscribedUsers = await User.find({
    role: "student",
    "preferences.departments": { $in: [department] },
  }).select("_id");

  if (subscribedUsers.length > 0) {
    await Notification.insertMany(
      subscribedUsers.map((subscriber) => ({
        userId: subscriber._id,
        type: "new-paper",
        title: `New ${courseCode} paper available`,
        message: `${title} was uploaded in ${department}.`,
        paperId: paper._id,
      }))
    );
  }

  const wasLocalFallback = uploadResult.storage === "local";
  return res.status(201).json({
    message: wasLocalFallback
      ? "Paper uploaded successfully (saved locally because Cloudinary is currently unavailable)"
      : "Paper uploaded successfully",
    paper,
    storage: wasLocalFallback ? "local" : "cloudinary",
  });
});

const searchPapers = asyncHandler(async (req, res) => {
  const {
    faculty,
    department,
    level,
    semester,
    courseCode,
    year,
    minYear,
    maxYear,
    q,
    sort = "newest",
    page = 1,
    limit = 12,
  } = req.query;

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const safeTrim = (value) => (typeof value === "string" ? value.trim() : "");
  const facultyValue = safeTrim(faculty);
  const departmentValue = safeTrim(department);
  const levelValue = safeTrim(level);
  const courseCodeValue = safeTrim(courseCode);

  const filters = { status: "approved", isDeleted: false };
  if (facultyValue) filters.faculty = { $regex: `^${escapeRegex(facultyValue)}$`, $options: "i" };
  if (departmentValue) filters.department = { $regex: `^${escapeRegex(departmentValue)}$`, $options: "i" };
  if (levelValue) filters.level = { $regex: `^${escapeRegex(levelValue)}$`, $options: "i" };
  if (semester) filters.semester = semester;
  if (courseCodeValue) filters.courseCode = { $regex: courseCodeValue, $options: "i" };
  if (year) filters.year = Number(year);
  if (minYear || maxYear) {
    filters.year = {
      ...(minYear ? { $gte: Number(minYear) } : {}),
      ...(maxYear ? { $lte: Number(maxYear) } : {}),
    };
  }
  if (q) {
    filters.$or = [
      { title: { $regex: q, $options: "i" } },
      { courseCode: { $regex: q, $options: "i" } },
      { department: { $regex: q, $options: "i" } },
      { faculty: { $regex: q, $options: "i" } },
    ];
  }

  const pageNumber = Math.max(Number(page), 1);
  const pageLimit = Math.min(Math.max(Number(limit), 1), 50);
  const skip = (pageNumber - 1) * pageLimit;

  const sortStage = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "highest-rated": { averageRating: -1, totalRatings: -1, createdAt: -1 },
    "most-downloaded": { downloadCount: -1, createdAt: -1 },
    relevance: q ? { textScore: { $meta: "textScore" } } : { createdAt: -1 },
  }[sort] || { createdAt: -1 };

  const aggregatePipeline = [
    { $match: filters },
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
        totalRatings: { $size: "$ratings" },
        averageRating: {
          $cond: [{ $gt: [{ $size: "$ratings" }, 0] }, { $round: [{ $avg: "$ratings.rating" }, 1] }, 0],
        },
      },
    },
    { $project: { ratings: 0 } },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: pageLimit },
  ];

  const [papers, total] = await Promise.all([Paper.aggregate(aggregatePipeline), Paper.countDocuments(filters)]);

  const paperIds = papers.map((paper) => paper._id);
  const paperUploaders = await Paper.find({ _id: { $in: paperIds } }).populate("uploadedBy", "name role").select("_id uploadedBy");
  const uploaderMap = new Map(paperUploaders.map((item) => [String(item._id), item.uploadedBy]));

  const hydratedPapers = papers.map((paper) => ({
    ...paper,
    uploadedBy: uploaderMap.get(String(paper._id)) || null,
  }));

  if (req.user?._id) {
    await Activity.create({ userId: req.user._id, action: "search", metadata: { filters: req.query } });
  }

  return res.status(200).json({
    papers: hydratedPapers,
    pagination: {
      total,
      page: pageNumber,
      limit: pageLimit,
      pages: Math.ceil(total / pageLimit),
    },
  });
});

const getPaperById = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id).populate("uploadedBy", "name role");

  if (!paper || paper.status !== "approved" || paper.isDeleted) {
    return res.status(404).json({ message: "Paper not found" });
  }

  const [ratingSummary] = await Rating.aggregate([
    { $match: { paperId: paper._id } },
    {
      $group: {
        _id: "$paperId",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  return res.status(200).json({
    paper,
    ratingSummary: {
      averageRating: ratingSummary ? Number(ratingSummary.averageRating.toFixed(1)) : 0,
      totalRatings: ratingSummary ? ratingSummary.totalRatings : 0,
    },
  });
});

const trackView = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper || paper.status !== "approved" || paper.isDeleted) {
    return res.status(404).json({ message: "Paper not found" });
  }

  if (req.user?._id) {
    await Activity.create({ userId: req.user._id, paperId: paper._id, action: "view" });
  }

  return res.status(200).json({ message: "View tracked" });
});

const trackDownload = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper || paper.status !== "approved" || paper.isDeleted) {
    return res.status(404).json({ message: "Paper not found" });
  }

  paper.downloadCount = (paper.downloadCount || 0) + 1;
  await paper.save();

  if (req.user?._id) {
    await Activity.create({ userId: req.user._id, paperId: paper._id, action: "download" });
  }

  return res.status(200).json({ message: "Download tracked", fileUrl: paper.fileUrl });
});

const previewPaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper || paper.status !== "approved" || paper.isDeleted) {
    return res.status(404).json({ message: "Paper not found" });
  }

  const upstream = await fetch(paper.fileUrl);
  if (!upstream.ok) {
    return res.status(502).json({ message: "Could not load paper preview" });
  }

  const arrayBuffer = await upstream.arrayBuffer();
  const filename = `${paper.courseCode || "paper"}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=\"${filename}\"`);
  return res.send(Buffer.from(arrayBuffer));
});

module.exports = {
  uploadPaperValidation,
  searchPapersValidation,
  paperByIdValidation,
  uploadPaper,
  searchPapers,
  getPaperById,
  trackView,
  trackDownload,
  previewPaper,
};
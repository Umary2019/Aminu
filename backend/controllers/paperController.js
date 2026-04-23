const { body, query, param } = require("express-validator");
const streamifier = require("streamifier");

const cloudinary = require("../config/cloudinary");
const Paper = require("../models/Paper");
const Rating = require("../models/Rating");
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
];

const paperByIdValidation = [param("id").isMongoId().withMessage("Valid paper id is required")];

const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "past-question-papers",
        use_filename: true,
        unique_filename: true,
        filename_override: originalname.replace(/\.pdf$/i, ""),
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const uploadPaper = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF file is required" });
  }

  if (!cloudinary.isConfigured) {
    return res.status(500).json({
      message:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.",
    });
  }

  const { title, courseCode, faculty, department, level, year, semester } = req.body;
  const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

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

  return res.status(201).json({ message: "Paper uploaded successfully", paper });
});

const searchPapers = asyncHandler(async (req, res) => {
  const { faculty, department, level, semester, courseCode, year, q, page = 1, limit = 12 } = req.query;

  const filters = { status: "approved" };
  if (faculty) filters.faculty = faculty;
  if (department) filters.department = department;
  if (level) filters.level = level;
  if (semester) filters.semester = semester;
  if (courseCode) filters.courseCode = { $regex: courseCode, $options: "i" };
  if (year) filters.year = Number(year);
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

  const [papers, total] = await Promise.all([
    Paper.find(filters).populate("uploadedBy", "name role").sort({ createdAt: -1 }).skip(skip).limit(pageLimit),
    Paper.countDocuments(filters),
  ]);

  return res.status(200).json({
    papers,
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

  if (!paper || paper.status !== "approved") {
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

const previewPaper = asyncHandler(async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper || paper.status !== "approved") {
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
  previewPaper,
};

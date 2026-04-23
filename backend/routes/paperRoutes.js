const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  uploadPaperValidation,
  searchPapersValidation,
  paperByIdValidation,
  uploadPaper,
  searchPapers,
  getPaperById,
  trackView,
  trackDownload,
  previewPaper,
} = require("../controllers/paperController");

const router = express.Router();

router.get("/", searchPapersValidation, validateRequest, searchPapers);
router.post("/:id/view", protect, paperByIdValidation, validateRequest, trackView);
router.post("/:id/download", protect, paperByIdValidation, validateRequest, trackDownload);
router.get("/:id/preview", paperByIdValidation, validateRequest, previewPaper);
router.get("/:id", paperByIdValidation, validateRequest, getPaperById);
router.post(
  "/upload",
  protect,
  authorize("admin"),
  upload.single("paper"),
  uploadPaperValidation,
  validateRequest,
  uploadPaper
);

module.exports = router;

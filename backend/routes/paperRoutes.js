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
  previewPaper,
} = require("../controllers/paperController");

const router = express.Router();

router.get("/", searchPapersValidation, validateRequest, searchPapers);
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

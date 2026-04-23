const express = require("express");

const validateRequest = require("../middleware/validateRequest");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/analytics", getAnalytics);
router.get("/users", listQueryValidation, validateRequest, getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/papers", listQueryValidation, validateRequest, getAllPapers);
router.patch("/papers/:id/review", paperDecisionValidation, validateRequest, reviewPaper);
router.delete("/papers/:id", deletePaperValidation, validateRequest, deletePaper);
router.patch("/papers/:id/restore", restorePaperValidation, validateRequest, restorePaper);
router.delete("/papers/:id/permanent", deletePaperValidation, validateRequest, permanentlyDeletePaper);
router.post("/papers/bulk", bulkCreateValidation, validateRequest, bulkCreatePapers);

router.get("/comments", listQueryValidation, validateRequest, getCommentModeration);
router.patch("/comments/:id/hide", commentModerationValidation, validateRequest, hideComment);
router.delete("/comments/:id", commentModerationValidation, validateRequest, deleteComment);

router.get("/reports", listQueryValidation, validateRequest, getReports);
router.patch("/reports/:id/status", reportStatusValidation, validateRequest, updateReportStatus);

router.get("/audit", listQueryValidation, validateRequest, getAuditTrail);
router.get("/activity", getDownloadActivity);
router.get("/export", exportCsv);

module.exports = router;

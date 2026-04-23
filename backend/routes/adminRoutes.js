const express = require("express");

const validateRequest = require("../middleware/validateRequest");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  paperDecisionValidation,
  deletePaperValidation,
  getAnalytics,
  getAllUsers,
  deleteUser,
  getAllPapers,
  reviewPaper,
  deletePaper,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/analytics", getAnalytics);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/papers", getAllPapers);
router.patch("/papers/:id/review", paperDecisionValidation, validateRequest, reviewPaper);
router.delete("/papers/:id", deletePaperValidation, validateRequest, deletePaper);

module.exports = router;

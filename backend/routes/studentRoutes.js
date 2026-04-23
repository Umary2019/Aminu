const express = require("express");

const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/authMiddleware");
const {
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
} = require("../controllers/studentController");

const router = express.Router();

router.use(protect);

router.get("/favorites", getFavorites);
router.post("/favorites", favoriteValidation, validateRequest, addFavorite);
router.delete("/favorites/:paperId", removeFavorite);

router.get("/activity", getActivity);

router.post("/reports", reportValidation, validateRequest, reportPaper);

router.patch("/preferences", preferencesValidation, validateRequest, updatePreferences);
router.get("/recommendations", getRecommendations);

router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationRead);

module.exports = router;

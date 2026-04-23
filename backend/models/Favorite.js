const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, paperId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);

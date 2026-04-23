const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    courseCode: { type: String, required: true, trim: true, uppercase: true },
    faculty: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 2000 },
    semester: { type: String, required: true, enum: ["First", "Second"] },
    fileUrl: { type: String, required: true },
    filePublicId: { type: String, required: true },
    downloadCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "deleted"],
      default: "pending",
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

paperSchema.index({ title: "text", courseCode: "text", department: "text", faculty: "text" });
paperSchema.index({ faculty: 1, department: 1, level: 1, semester: 1, courseCode: 1, status: 1, isDeleted: 1 });

module.exports = mongoose.model("Paper", paperSchema);

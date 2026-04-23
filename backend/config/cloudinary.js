const cloudinary = require("cloudinary").v2;

const hasRealCredentials =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET) &&
  !["demo", "your_cloud_name"].includes(process.env.CLOUDINARY_CLOUD_NAME) &&
  !["demo", "your_api_key"].includes(process.env.CLOUDINARY_API_KEY) &&
  !["demo", "your_api_secret"].includes(process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.isConfigured = hasRealCredentials;

module.exports = cloudinary;
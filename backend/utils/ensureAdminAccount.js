const User = require("../models/User");

const normalizeLocalPart = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");

const ensureAdminAccount = async () => {
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return;
  }

  const fallbackLocalPart = normalizeLocalPart(adminUsername) || "admin";
  const adminEmail = (process.env.ADMIN_EMAIL?.trim() || `${fallbackLocalPart}@admin.local`).toLowerCase();

  let admin = await User.findOne({
    $or: [{ email: adminEmail }, { role: "admin", name: adminUsername }],
  }).select("+password");

  if (!admin) {
    await User.create({
      name: adminUsername,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    return;
  }

  admin.name = adminUsername;
  admin.email = adminEmail;
  admin.role = "admin";
  admin.password = adminPassword;
  await admin.save();
};

module.exports = ensureAdminAccount;
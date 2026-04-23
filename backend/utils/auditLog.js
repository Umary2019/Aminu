const AuditLog = require("../models/AuditLog");

const logAudit = async ({ actorId, action, entityType, entityId, details = {} }) => {
  if (!actorId || !action || !entityType) return;

  try {
    await AuditLog.create({
      actorId,
      action,
      entityType,
      entityId,
      details,
    });
  } catch (error) {
    // Audit logging should never break primary user actions.
    // eslint-disable-next-line no-console
    console.warn("Audit log failed:", error.message);
  }
};

module.exports = { logAudit };

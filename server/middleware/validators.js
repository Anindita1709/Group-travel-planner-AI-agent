// ─── Group Validator ──────────────────────────────────────────────────────────
function validateGroup(req, res, next) {
  const { name, creator } = req.body;

  const errors = [];
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Group name must be at least 2 characters");
  }
  if (!creator || typeof creator !== "string" || creator.trim().length < 2) {
    errors.push("Creator name is required");
  }
  if (name && name.length > 100) {
    errors.push("Group name must be under 100 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  req.body.name = name.trim();
  req.body.creator = creator.trim();
  next();
}

// ─── Member Validator ─────────────────────────────────────────────────────────
function validateMember(req, res, next) {
  const { name, email } = req.body;

  const errors = [];
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Member name must be at least 2 characters");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Valid email address is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  req.body.name = name.trim();
  req.body.email = email.toLowerCase().trim();
  next();
}

module.exports = { validateGroup, validateMember };

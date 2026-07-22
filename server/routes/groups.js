const express = require("express");
const router = express.Router();
const { groupStore, voteStore } = require("../data/store");
const { validateGroup, validateMember } = require("../middleware/validators");

// ─── GET /api/groups ────────────────────────────────────────────────────────
// Get all groups (in production, scope to authenticated user)
router.get("/", (req, res) => {
  const allGroups = groupStore.findAll();
  res.json({ success: true, data: allGroups, count: allGroups.length });
});

// ─── POST /api/groups ───────────────────────────────────────────────────────
// Create a new travel group
router.post("/", validateGroup, (req, res) => {
  try {
    const group = groupStore.create(req.body);

    // Auto-initialize a voting poll if destinations are provided
    if (req.body.destinations?.length > 1) {
      voteStore.initPoll(group.id, req.body.destinations);
    }

    res.status(201).json({
      success: true,
      message: "Travel group created successfully!",
      data: group,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /api/groups/:id ────────────────────────────────────────────────────
// Get a single group by ID
router.get("/:id", (req, res) => {
  const group = groupStore.findById(req.params.id);
  if (!group) {
    return res.status(404).json({ success: false, error: "Group not found" });
  }
  res.json({ success: true, data: group });
});

// ─── PUT /api/groups/:id ────────────────────────────────────────────────────
// Update group details
router.put("/:id", (req, res) => {
  const group = groupStore.findById(req.params.id);
  if (!group) {
    return res.status(404).json({ success: false, error: "Group not found" });
  }

  const allowedFields = ["name", "description", "startDate", "endDate", "budget", "status", "destinations"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updated = groupStore.update(req.params.id, updates);
  res.json({ success: true, message: "Group updated", data: updated });
});

// ─── DELETE /api/groups/:id ─────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const group = groupStore.findById(req.params.id);
  if (!group) {
    return res.status(404).json({ success: false, error: "Group not found" });
  }
  groupStore.delete(req.params.id);
  res.json({ success: true, message: "Group deleted" });
});

// ─── POST /api/groups/join/:code ────────────────────────────────────────────
// Join a group via invite code
router.post("/join/:code", validateMember, (req, res) => {
  const group = groupStore.findByInviteCode(req.params.code);
  if (!group) {
    return res.status(404).json({ success: false, error: "Invalid invite code" });
  }
  const updated = groupStore.addMember(group.id, req.body);
  res.json({ success: true, message: `Welcome to ${group.name}!`, data: updated });
});

// ─── POST /api/groups/:id/members ───────────────────────────────────────────
// Add a member to a group
router.post("/:id/members", validateMember, (req, res) => {
  const group = groupStore.findById(req.params.id);
  if (!group) {
    return res.status(404).json({ success: false, error: "Group not found" });
  }
  const updated = groupStore.addMember(req.params.id, req.body);
  res.status(201).json({ success: true, message: "Member added", data: updated });
});

// ─── DELETE /api/groups/:id/members/:memberId ───────────────────────────────
// Remove a member from a group
router.delete("/:id/members/:memberId", (req, res) => {
  const group = groupStore.findById(req.params.id);
  if (!group) {
    return res.status(404).json({ success: false, error: "Group not found" });
  }
  const updated = groupStore.removeMember(req.params.id, req.params.memberId);
  res.json({ success: true, message: "Member removed", data: updated });
});

// ─── GET /api/groups/:id/votes ──────────────────────────────────────────────
// Get voting poll for a group
router.get("/:id/votes", (req, res) => {
  const poll = voteStore.findByGroupId(req.params.id);
  if (!poll) {
    return res.status(404).json({ success: false, error: "No poll found for this group" });
  }
  res.json({ success: true, data: poll });
});

// ─── POST /api/groups/:id/votes ─────────────────────────────────────────────
// Cast a vote for a destination
router.post("/:id/votes", (req, res) => {
  const { destination, voterId } = req.body;
  if (!destination || !voterId) {
    return res.status(400).json({ success: false, error: "destination and voterId are required" });
  }
  const poll = voteStore.castVote(req.params.id, destination, voterId);
  if (!poll) {
    return res.status(404).json({ success: false, error: "Poll or destination not found" });
  }
  res.json({ success: true, message: "Vote cast!", data: poll });
});

module.exports = router;

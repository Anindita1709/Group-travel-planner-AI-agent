const express = require("express");
const router = express.Router();
const { itineraryStore, groupStore } = require("../data/store");

// ─── GET /api/itinerary/:groupId ────────────────────────────────────────────
router.get("/:groupId", (req, res) => {
  const itinerary = itineraryStore.findByGroupId(req.params.groupId);
  if (!itinerary) {
    return res.status(404).json({ success: false, error: "No itinerary found for this group" });
  }
  res.json({ success: true, data: itinerary });
});

// ─── POST /api/itinerary/:groupId ───────────────────────────────────────────
router.post("/:groupId", (req, res) => {
  const group = groupStore.findById(req.params.groupId);
  if (!group) {
    return res.status(404).json({ success: false, error: "Group not found" });
  }

  const itinerary = itineraryStore.save(req.params.groupId, req.body);
  res.status(201).json({ success: true, message: "Itinerary saved!", data: itinerary });
});

// ─── DELETE /api/itinerary/:groupId ─────────────────────────────────────────
router.delete("/:groupId", (req, res) => {
  itineraryStore.delete(req.params.groupId);
  res.json({ success: true, message: "Itinerary deleted" });
});

module.exports = router;


const express = require("express");
const router = express.Router();
const { generateItinerary } = require("../services/aiService");

router.post("/generate", async (req, res) => {
  try {
    const { destination, budget, days } = req.body;

    const result = await generateItinerary(destination, budget, days);

    res.json({
      success: true,
      itinerary: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

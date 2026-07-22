const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");
const { groupStore } = require("../data/store");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helper: Stream SSE to client ─────────────────────────────────────────────
function setupSSE(res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();
}

function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ─── POST /api/ai/suggest-destinations ────────────────────────────────────────
// AI suggests destinations based on group preferences
router.post("/suggest-destinations", async (req, res) => {
  const { preferences, budget, duration, groupSize, interests } = req.body;

  if (!preferences && !interests) {
    return res.status(400).json({ success: false, error: "Preferences or interests required" });
  }

  try {
    const prompt = `You are an expert travel consultant. Based on the following group travel preferences, suggest 5 ideal travel destinations.

Group Details:
- Budget: ${budget || "moderate"}
- Trip Duration: ${duration || "7 days"}
- Group Size: ${groupSize || "4-6 people"}
- Interests: ${interests?.join(", ") || "general sightseeing"}
- Special Preferences: ${preferences || "none"}

Respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:
{
  "destinations": [
    {
      "name": "City, Country",
      "emoji": "🏝️",
      "tagline": "One sentence hook",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "estimatedBudget": "per person range",
      "bestFor": "type of group this suits",
      "weather": "typical weather",
      "difficulty": "easy|moderate|adventurous"
    }
  ],
  "recommendation": "Which destination you recommend most and why (2-3 sentences)"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("AI suggest-destinations error:", error);
    res.status(500).json({ success: false, error: "Failed to generate suggestions. Check API key." });
  }
});

// ─── POST /api/ai/generate-itinerary ──────────────────────────────────────────
// Stream a full day-by-day itinerary via SSE
router.post("/generate-itinerary", async (req, res) => {
  const { groupId, destination, days, groupSize, budget, interests, startDate } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ success: false, error: "destination and days are required" });
  }

  setupSSE(res);

  try {
    const prompt = `You are a professional travel planner creating a detailed group itinerary.

Trip Details:
- Destination: ${destination}
- Duration: ${days} days
- Group Size: ${groupSize || 4} people
- Budget Level: ${budget || "moderate"}
- Interests: ${interests?.join(", ") || "culture, food, sightseeing"}
- Start Date: ${startDate || "flexible"}

Create a detailed day-by-day itinerary. Respond ONLY with a valid JSON object (no markdown):
{
  "destination": "${destination}",
  "summary": "2-3 sentence trip overview",
  "highlights": ["top experience 1", "top experience 2", "top experience 3", "top experience 4"],
  "tips": ["practical tip 1", "practical tip 2", "practical tip 3"],
  "estimatedCosts": {
    "accommodation": "per night estimate",
    "food": "per day per person",
    "activities": "per day per person",
    "transport": "total estimate",
    "total": "total per person estimate"
  },
  "days": [
    {
      "day": 1,
      "title": "Arrival & First Impressions",
      "theme": "exploration",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "What to do and why it's great for groups",
          "duration": "2 hours",
          "cost": "cost estimate",
          "type": "sightseeing|food|adventure|culture|relaxation|transport",
          "tip": "insider tip"
        }
      ],
      "accommodation": {
        "name": "Hotel/Hostel name",
        "type": "hotel|hostel|airbnb|resort",
        "note": "why this works for groups"
      },
      "meals": {
        "breakfast": "Recommendation",
        "lunch": "Recommendation",
        "dinner": "Restaurant with note"
      }
    }
  ]
}

Generate all ${days} days with at least 4-5 activities each.`;

    sendSSE(res, "start", { message: "Generating your itinerary..." });

    let fullText = "";

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        fullText += chunk.delta.text;
        sendSSE(res, "chunk", { text: chunk.delta.text });
      }
    }

    // Parse and validate the complete JSON
    const cleaned = fullText.replace(/```json\n?|\n?```/g, "").trim();
    const itinerary = JSON.parse(cleaned);

    sendSSE(res, "complete", { itinerary });
    res.end();
  } catch (error) {
    console.error("AI generate-itinerary error:", error);
    sendSSE(res, "error", { message: error.message });
    res.end();
  }
});

// ─── POST /api/ai/packing-list ────────────────────────────────────────────────
// Generate smart packing list based on trip details
router.post("/packing-list", async (req, res) => {
  const { destination, days, activities, weather, groupSize } = req.body;

  if (!destination) {
    return res.status(400).json({ success: false, error: "Destination required" });
  }

  try {
    const prompt = `Create a comprehensive packing list for a group trip.

Trip: ${destination}, ${days || 7} days
Weather: ${weather || "mixed"}
Planned activities: ${activities?.join(", ") || "general tourism"}
Group size: ${groupSize || 4}

Respond ONLY with valid JSON (no markdown):
{
  "categories": [
    {
      "name": "Category Name",
      "emoji": "🎒",
      "items": [
        { "item": "Item name", "essential": true, "notes": "optional tip", "quantity": "1 per person or shared" }
      ]
    }
  ],
  "groupItems": ["Item that only one person needs to pack for the whole group"],
  "tips": ["packing tip 1", "packing tip 2"]
}

Include categories: Clothing, Toiletries, Documents & Money, Electronics, Health & Safety, Activities, Snacks & Entertainment.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const packingList = JSON.parse(cleaned);

    res.json({ success: true, data: packingList });
  } catch (error) {
    console.error("AI packing-list error:", error);
    res.status(500).json({ success: false, error: "Failed to generate packing list" });
  }
});

// ─── POST /api/ai/budget-breakdown ────────────────────────────────────────────
// AI-powered budget analysis and splitting
router.post("/budget-breakdown", async (req, res) => {
  const { destination, days, groupSize, totalBudget, currency, lifestyle } = req.body;

  try {
    const prompt = `Create a detailed travel budget breakdown.

Trip: ${destination}, ${days} days
Group: ${groupSize} people
Total budget: ${totalBudget} ${currency || "USD"}
Lifestyle: ${lifestyle || "moderate"}

Respond ONLY with valid JSON:
{
  "perPerson": ${Math.round(totalBudget / groupSize)},
  "currency": "${currency || "USD"}",
  "breakdown": {
    "accommodation": { "total": 0, "perPerson": 0, "perNight": 0, "percentage": 0, "suggestion": "" },
    "food": { "total": 0, "perPerson": 0, "perDay": 0, "percentage": 0, "suggestion": "" },
    "activities": { "total": 0, "perPerson": 0, "percentage": 0, "suggestion": "" },
    "transport": { "total": 0, "perPerson": 0, "percentage": 0, "suggestion": "" },
    "shopping": { "total": 0, "perPerson": 0, "percentage": 0, "suggestion": "" },
    "emergency": { "total": 0, "perPerson": 0, "percentage": 0, "suggestion": "" }
  },
  "savingTips": ["tip 1", "tip 2", "tip 3"],
  "splendurgeOptions": ["one upgrade worth spending more on"],
  "budgetRating": "tight|comfortable|generous"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const budget = JSON.parse(cleaned);

    res.json({ success: true, data: budget });
  } catch (error) {
    console.error("AI budget-breakdown error:", error);
    res.status(500).json({ success: false, error: "Failed to analyze budget" });
  }
});

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
// General travel assistant chat
router.post("/chat", async (req, res) => {
  const { message, groupId, context } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Message required" });
  }

  let groupContext = "";
  if (groupId) {
    const group = groupStore.findById(groupId);
    if (group) {
      groupContext = `\nGroup Context: Planning a trip for "${group.name}" with ${group.members.length} members to ${group.destinations?.join(", ") || "TBD"}. Dates: ${group.startDate || "TBD"} to ${group.endDate || "TBD"}.`;
    }
  }

  try {
    const systemPrompt = `You are an expert AI travel assistant helping a group plan their perfect trip. You give concise, practical, and enthusiastic travel advice. You know about local cultures, hidden gems, safety tips, and budget hacks.${groupContext}`;

    const messages = [
      ...(context || []),
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    });

    res.json({
      success: true,
      data: {
        reply: response.content[0].text,
        usage: response.usage,
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ success: false, error: "Failed to get AI response" });
  }
});

module.exports = router;

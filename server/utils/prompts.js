/**
 * Centralised prompt-building utilities for all Claude API calls.
 * Keeps AI routes clean and makes prompts easy to tune.
 */

/**
 * Build a destination-suggestion prompt.
 */
function destinationPrompt({ interests = [], budget, duration, groupSize, preferences }) {
  return `You are an expert travel consultant. Suggest 5 ideal group travel destinations.

Group Details:
- Budget level: ${budget || "moderate"}
- Duration: ${duration || "7 days"}
- Group size: ${groupSize || 4} people
- Interests: ${interests.join(", ") || "general sightseeing"}
- Special requirements: ${preferences || "none"}

Respond ONLY with valid JSON (no markdown, no preamble):
{
  "destinations": [
    {
      "name": "City, Country",
      "emoji": "🏝️",
      "tagline": "One compelling sentence",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "estimatedBudget": "per-person range",
      "bestFor": "group type",
      "weather": "typical weather note",
      "difficulty": "easy|moderate|adventurous"
    }
  ],
  "recommendation": "Top pick with 2–3 sentence explanation"
}`;
}

/**
 * Build an itinerary-generation prompt.
 */
function itineraryPrompt({ destination, days, groupSize, budget, interests, startDate }) {
  return `You are a professional travel planner. Create a detailed group itinerary.

Trip:
- Destination: ${destination}
- Duration: ${days} days
- Group size: ${groupSize || 4} people
- Budget: ${budget || "moderate"}
- Interests: ${interests?.join(", ") || "culture, food, sightseeing"}
- Start: ${startDate || "flexible"}

Respond ONLY with valid JSON:
{
  "destination": "${destination}",
  "summary": "2–3 sentence overview",
  "highlights": ["top experience 1","top experience 2","top experience 3","top experience 4"],
  "tips": ["practical tip 1","practical tip 2","practical tip 3"],
  "estimatedCosts": {
    "accommodation": "per-night estimate",
    "food": "per person per day",
    "activities": "per person per day",
    "transport": "total estimate",
    "total": "total per person"
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
          "description": "What to do and why it suits a group",
          "duration": "2 hours",
          "cost": "cost estimate",
          "type": "sightseeing|food|adventure|culture|relaxation|transport",
          "tip": "insider tip"
        }
      ],
      "accommodation": { "name": "Hotel name", "type": "hotel|hostel|airbnb|resort", "note": "why it works for groups" },
      "meals": { "breakfast": "Suggestion", "lunch": "Suggestion", "dinner": "Restaurant + note" }
    }
  ]
}
Generate all ${days} days with 4–5 activities each.`;
}

/**
 * Build a packing-list prompt.
 */
function packingPrompt({ destination, days, activities, weather, groupSize }) {
  return `Create a smart packing list for a group trip.

Trip: ${destination}, ${days || 7} days
Weather: ${weather || "mixed"}
Activities: ${activities?.join(", ") || "general tourism"}
Group size: ${groupSize || 4}

Respond ONLY with valid JSON:
{
  "categories": [
    {
      "name": "Category Name",
      "emoji": "🎒",
      "items": [
        { "item": "Item name", "essential": true, "notes": "optional tip", "quantity": "1 per person" }
      ]
    }
  ],
  "groupItems": ["shared item only one person needs"],
  "tips": ["packing tip 1","packing tip 2"]
}
Include: Clothing, Toiletries, Documents & Money, Electronics, Health & Safety, Activities, Snacks & Entertainment.`;
}

/**
 * Build a budget-breakdown prompt.
 */
function budgetPrompt({ destination, days, groupSize, totalBudget, currency, lifestyle }) {
  return `Create a travel budget breakdown.

Trip: ${destination}, ${days} days
Group: ${groupSize} people
Total: ${totalBudget} ${currency || "USD"}
Lifestyle: ${lifestyle || "moderate"}

Respond ONLY with valid JSON:
{
  "perPerson": ${Math.round(totalBudget / groupSize)},
  "currency": "${currency || "USD"}",
  "breakdown": {
    "accommodation": { "total": 0, "perPerson": 0, "perNight": 0, "percentage": 0, "suggestion": "" },
    "food":          { "total": 0, "perPerson": 0, "perDay": 0,   "percentage": 0, "suggestion": "" },
    "activities":    { "total": 0, "perPerson": 0,                "percentage": 0, "suggestion": "" },
    "transport":     { "total": 0, "perPerson": 0,                "percentage": 0, "suggestion": "" },
    "shopping":      { "total": 0, "perPerson": 0,                "percentage": 0, "suggestion": "" },
    "emergency":     { "total": 0, "perPerson": 0,                "percentage": 0, "suggestion": "" }
  },
  "savingTips": ["tip 1","tip 2","tip 3"],
  "splendurgeOptions": ["one worthy splurge"],
  "budgetRating": "tight|comfortable|generous"
}`;
}

module.exports = { destinationPrompt, itineraryPrompt, packingPrompt, budgetPrompt };

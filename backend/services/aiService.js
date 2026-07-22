
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateItinerary(destination, budget, days) {
  const prompt = `
  Create a detailed ${days}-day travel itinerary for ${destination}.
  Budget: ${budget}.
  Include:
  - Daily activities
  - Food recommendations
  - Transportation tips
  - Budget suggestions
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.choices[0].message.content;
}

module.exports = { generateItinerary };

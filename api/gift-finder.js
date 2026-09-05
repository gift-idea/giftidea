import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ALLOWED_ORIGIN = "https://gift-idea.github.io";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { answers = [] } = req.body || {};

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: "Please provide answers."
      });
    }

    const conversation = answers
      .map((item) => `${item.question}: ${item.answer}`)
      .join("\n");

    // -----------------------------
    // 1. AI chooses the gifts
    // -----------------------------

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: `
You are the AI gift finder for a beautiful website called "little something".

Based on the user's answers, recommend exactly 3 thoughtful gifts.

User answers:
${conversation}

Rules:
- Understand the recipient, personality, interests, budget and occasion.
- Keep prices in USD.
- Stay reasonably close to the user's budget.
- Gifts should feel thoughtful, realistic and specific.
- Do not recommend weapons.
- Do not recommend drugs, alcohol or nicotine.
- Do not recommend gambling or sexual products.
- No emojis.
- Return ONLY valid JSON.

Use exactly this structure:

{
  "summary": "A short personalized sentence.",
  "gifts": [
    {
      "name": "Gift name",
      "category": "Gift category",
      "price": "$30",
      "reason": "Why this gift fits this person.",
      "image_prompt": "Detailed description of the gift for an editorial product photo."
    }
  ]
}
`
    });

    let text = response.output_text?.trim();

    if (!text) {
      throw new Error("AI returned an empty response.");
    }

    // Remove markdown fences if AI accidentally adds them
    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result = JSON.parse(text);

    if (!Array.isArray(result.gifts)) {
      throw new Error("Invalid gift response.");
    }

    const gifts = result.gifts.slice(0, 3);

    // -----------------------------
    // 2. AI generates gift images
    // -----------------------------

    const giftsWithImages = await Promise.all(
      gifts.map(async (gift) => {
        try {
          const imageResponse = await client.images.generate({
            model: "gpt-image-2",

            prompt: `
Create a realistic editorial product photograph for a
premium modern gift recommendation website.

Gift:
${gift.name}

Category:
${gift.category}

Description:
${gift.image_prompt}

Visual style:
- elegant boutique photography
- warm cream background
- soft natural light
- cozy and sophisticated
- minimal composition
- realistic product photography
- no people
- no hands
- no logos
- no brand names
- no text
- no watermark

The gift itself should be the clear focus of the image.
`,
            size: "1024x1024",
            quality: "low",
            background: "opaque",
            output_format: "jpeg",
            n: 1
          });

          const base64 = imageResponse.data?.[0]?.b64_json;

          return {
            ...gift,
            image: base64
              ? `data:image/jpeg;base64,${base64}`
              : null
          };

        } catch (error) {
          console.error("Image generation failed:", error);

          return {
            ...gift,
            image: null
          };
        }
      })
    );

    // -----------------------------
    // 3. Send everything to website
    // -----------------------------

    return res.status(200).json({
      summary: result.summary || "",
      gifts: giftsWithImages
    });

  } catch (error) {
    console.error("Gift finder error:", error);

    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
}

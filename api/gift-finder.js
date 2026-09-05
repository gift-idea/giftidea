import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  try {

    const { answers = [] } = req.body || {};


    if (!Array.isArray(answers)) {

      return res.status(400).json({
        error: "Invalid answers"
      });

    }


    /*
      STEP 1
      Ask the text model for personalized gifts.
    */

    const conversation = answers
      .map(item =>
        `${item.question}: ${item.answer}`
      )
      .join("\n");


    const giftResponse =
      await client.responses.create({

        model: "gpt-5.6-luna",

        input: [
          {
            role: "system",

            content: `
You are the gift assistant for a website called "little something".

Your job is to recommend thoughtful, realistic gifts.

Use the user's answers to understand:
- who the recipient is
- personality
- interests
- budget
- occasion

Return exactly 3 gift ideas.

Important:
- prices must be in USD
- stay close to the user's budget
- do not recommend dangerous or age-restricted products
- do not recommend weapons, drugs, alcohol, nicotine, gambling, or sexual products
- make the recommendations appropriate for a general audience
- explain briefly why each gift fits
- do not use emojis
- return ONLY valid JSON

JSON format:

{
  "summary": "short summary",
  "gifts": [
    {
      "name": "gift name",
      "category": "category",
      "price": "$30",
      "reason": "why this gift fits",
      "image_prompt": "detailed prompt for a beautiful product photograph"
    }
  ]
}
            `
          },

          {
            role: "user",

            content:
              `Here are the user's answers:\n\n${conversation}`
          }

        ]

      });


    const text =
      giftResponse.output_text;


    let result;


    try {

      result = JSON.parse(text);

    } catch {

      return res.status(500).json({
        error: "The AI returned invalid JSON."
      });

    }


    /*
      STEP 2
      Generate an individual image for each gift.
    */

    const giftsWithImages = [];


    for (const gift of result.gifts.slice(0, 3)) {

      try {

        const imageResponse =
          await client.images.generate({

            model: "gpt-image-2",

            prompt: `
Create a beautiful editorial product photograph for a
modern gift recommendation website.

Gift:
${gift.name}

Visual direction:
${gift.image_prompt}

Style:
- cozy boutique photography
- soft natural lighting
- warm cream background
- elegant composition
- realistic product photography
- tasteful
- minimal
- no people
- no logos
- no brand names
- no text
- no watermark

The image should clearly show the gift itself.
`,

            size: "1024x1024",

            quality: "low",

            background: "opaque",

            output_format: "jpeg",

            n: 1

          });


        const base64 =
          imageResponse.data?.[0]?.b64_json;


        if (base64) {

          giftsWithImages.push({

            ...gift,

            image:
              `data:image/jpeg;base64,${base64}`

          });

        } else {

          giftsWithImages.push({
            ...gift,
            image: null
          });

        }

      } catch (imageError) {

        console.error(
          "Image generation error:",
          imageError
        );


        giftsWithImages.push({

          ...gift,

          image: null

        });

      }

    }


    return res.status(200).json({

      summary:
        result.summary || "",

      gifts:
        giftsWithImages

    });


  } catch (error) {

    console.error(error);


    return res.status(500).json({

      error:
        "Something went wrong while finding your gifts."

    });

  }

}

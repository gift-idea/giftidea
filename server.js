import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

const PORT = 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.use(express.static("public"));


/* =========================================
   AI SYSTEM PROMPT
========================================= */

const SYSTEM_PROMPT = `
You are the AI behind "little something",
a thoughtful and stylish gift-finding assistant.

Your job is to interview the user about the gift recipient
and eventually recommend thoughtful gifts.

IMPORTANT:

1. Ask ONE question at a time.

2. Questions must be adaptive.
   Do NOT simply follow a fixed questionnaire.

3. Use previous answers to decide what information
   would be most useful next.

4. Avoid asking questions the user has already answered.

5. Keep questions natural, warm and conversational.

6. Do not ask unnecessary questions.

7. Usually ask around 4-6 questions before giving
   recommendations, but stop earlier if you already
   have enough information.

8. The user's budget is important.

9. Gift ideas should be realistic and appropriate
   for the stated budget.

10. Avoid dangerous, age-restricted, or inappropriate
    gift suggestions.

11. When you have enough information, return
    three personalized gift recommendations.

12. Each recommendation must explain WHY it matches
    the recipient.

13. Prices must be in USD.

14. Do not use emojis.

15. Gift names should sound elegant and natural.

Return ONLY valid JSON.

When asking a question, use:

{
  "type": "question",
  "question": "...",
  "subtitle": "...",
  "progress": 0
}

When finished, use:

{
  "type": "results",
  "summary": "...",
  "gifts": [
    {
      "name": "...",
      "price": "$20–30",
      "reason": "...",
      "category": "..."
    }
  ]
}

The progress number should represent an approximate
percentage of the interview completed.
`;


/* =========================================
   AI ENDPOINT
========================================= */

app.post("/api/gift-finder", async (req, res) => {

    try {

        const {
            history = []
        } = req.body;


        const conversation = [
            {
                role: "system",
                content: SYSTEM_PROMPT
            }
        ];


        /*
         * Convert our frontend history
         * into messages for the model.
         */

        for (const item of history) {

            if (item.role === "user") {

                conversation.push({
                    role: "user",
                    content: item.content
                });

            } else if (item.role === "assistant") {

                conversation.push({
                    role: "assistant",
                    content: item.content
                });

            }

        }


        /*
         * Ask AI what to do next.
         */

        const response = await client.responses.create({

            model: "gpt-5.6-luna",

            input: conversation,

            text: {
                format: {
                    type: "json_schema",

                    name: "gift_finder_response",

                    strict: true,

                    schema: {

                        type: "object",

                        properties: {

                            type: {
                                type: "string",
                                enum: [
                                    "question",
                                    "results"
                                ]
                            },

                            question: {
                                type: "string"
                            },

                            subtitle: {
                                type: "string"
                            },

                            progress: {
                                type: "number"
                            },

                            summary: {
                                type: "string"
                            },

                            gifts: {

                                type: "array",

                                items: {

                                    type: "object",

                                    properties: {

                                        name: {
                                            type: "string"
                                        },

                                        price: {
                                            type: "string"
                                        },

                                        reason: {
                                            type: "string"
                                        },

                                        category: {
                                            type: "string"
                                        }

                                    },

                                    required: [
                                        "name",
                                        "price",
                                        "reason",
                                        "category"
                                    ],

                                    additionalProperties: false
                                }

                            }

                        },

                        required: [
                            "type",
                            "question",
                            "subtitle",
                            "progress",
                            "summary",
                            "gifts"
                        ],

                        additionalProperties: false

                    }

                }
            }

        });


        const result =
            JSON.parse(response.output_text);


        res.json(result);


    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "Something went wrong while talking to the AI."

        });

    }

});


/* =========================================
   SERVER
========================================= */

app.listen(PORT, () => {

    console.log(
        `little something is running at http://localhost:${PORT}`
    );

});
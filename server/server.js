import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.disable('x-powered-by'); // Disable header to prevent framework fingerprinting

app.use(cors());
app.use(express.json());

// Initialize AI Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

const SYSTEM_PROMPT = `
You are the Kone AI Pathfinder, an advanced autonomous educational routing engine for Kone Code Academy. 
Your objective is to map a student's interests and level to a highly specific, 3-step learning roadmap using our physical hardware and digital courses.

The user will provide a query like: "Design a personalized path for Alex (Robotics & Games)".

You MUST return a pure JSON object containing EXACTLY this structure, nothing else:
{
  "logicTrace": [
    "Step 1 of your internal reasoning",
    "Step 2 of your internal reasoning",
    "Step 3 of your internal reasoning",
    "Step 4 of your internal reasoning",
    "Step 5 of your internal reasoning"
  ],
  "message": "A 2-3 sentence conversational response explaining the synthesized roadmap.",
  "roadmap": [
    { "id": "unique_id_1", "tag": "Logic", "name": "Mission Name 1", "reason": "Why they should do this first." },
    { "id": "unique_id_2", "tag": "Engineering", "name": "Mission Name 2", "reason": "How this connects to step 1." },
    { "id": "unique_id_3", "tag": "Intelligence", "name": "Mission Name 3", "reason": "The final capstone application." }
  ]
}

Ensure the output is strictly valid JSON without any markdown formatting wrappers like \`\`\`json.
`;

app.post('/api/synthesize', async (req, res) => {
    try {
        const { query, provider = 'gemini-flash' } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required.' });
        }

        let payload;

        if (provider.startsWith('openai')) {
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'paste_your_openai_key_here') {
                return res.status(500).json({ error: 'OPENAI_API_KEY is missing from server/.env' });
            }

            let modelName = "gpt-4o-mini";
            if (provider === 'openai-pro') modelName = "gpt-4o";
            if (provider === 'openai-next') modelName = "gpt-5.5"; // Bleeding edge requested by user

            const response = await openai.chat.completions.create({
                model: modelName,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: query }
                ],
                response_format: { type: "json_object" }
            });

            payload = JSON.parse(response.choices[0].message.content);

        } else {
            // Gemini logic
            if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'paste_your_key_here') {
                return res.status(500).json({ error: 'GEMINI_API_KEY is missing from server/.env' });
            }

            let modelName = "gemini-2.0-flash";
            if (provider === 'gemini-pro') modelName = "gemini-2.5-pro";
            if (provider === 'gemini-next') modelName = "gemini-3.1-pro-preview"; // Bleeding edge requested by user

            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: query }] }],
                systemInstruction: SYSTEM_PROMPT
            });

            const responseText = result.response.text();
            const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            payload = JSON.parse(cleanJsonString);
        }

        res.json(payload);

    } catch (error) {
        const safeProvider = typeof req.body.provider === 'string' ? req.body.provider.replace(/[^a-zA-Z0-9_-]/g, '') : 'unknown';
        console.error(`Error during ${safeProvider} synthesis:`, error);
        // Provide more detailed error info for OpenAI
        const errorMessage = error.message || "Unknown synthesis error";
        res.status(500).json({ error: `Synthesis failed: ${errorMessage}` });
    }
});

app.listen(port, () => {
    console.log(`Kone AI Orchestrator running on port ${port}`);
});

// Import required modules
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {OpenAI} = require("openai");
// Load environment variables
require('dotenv').config();

// Create an instance of GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create an Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200,
}));

const openai = new OpenAI({apiKey: process.env.GPT_API_KEY});

const prompt = 

// Route to get Gemini answer
app.post('/api/getGeminiAnswer', async (req, res, next) => {
    try {
        const { question, gemini_model } = req.body;
        if (question != "") {
            const model = genAI.getGenerativeModel({ model: gemini_model });

            const result = await model.generateContentStream([question]);
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                res.write(chunkText);
            }
        } else {
            res.write(err);
        }
        res.end();

    } catch (error) {
        return next(error)
    }
});


app.post('/api/getGPTAnswer', async (req, res) => {
    try {
        const { messages, model } = req.body;

        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        const stream = await openai.chat.completions.create({
            model: model || 'gpt-3.5-turbo',
            messages: messages,
            stream: true,
        });

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Start the server
app.listen(process.env.PORT);
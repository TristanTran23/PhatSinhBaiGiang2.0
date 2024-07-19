// Import required modules
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

// Start the server
app.listen(process.env.PORT);
import Groq from "groq-sdk";
import express from "express";
import { basePrompt as nodeBasePrompt } from "./default/node.js";
import { basePrompt as reactBasePrompt } from "./default/react.js";
import { BASE_PROMPT } from "./prompts.js"; 
import dotenv from "dotenv";
import { getSystemPrompt } from "./prompts.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors())
app.use(express.json())

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error("Error: GROQ_API_KEY environment variable is not set.");
    process.exit(1);
}
const groq = new Groq({ apiKey: GROQ_API_KEY });
app.use(express.json());

app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;

    const response = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
            },
            {
                role: "user",
                content: prompt
            }
        ],
        model: "openai/gpt-oss-20b",
    });
    
    const answer = response.choices[0].message.content.trim().toLowerCase();
    
    if(answer === "react") {
        return res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        });
    }
    
    if(answer === "node") {
        return res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        });
    }
    
    return res.status(403).json({message: "Invalid response from model"});
});

app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    const response = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: getSystemPrompt()
            },
            ...messages
        ],
        model: "openai/gpt-oss-20b",
    });
    res.json({
        response: response.choices[0].message.content
    });
});

app.listen(3000);
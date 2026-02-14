
import Groq from "groq-sdk";
import express from "express";
import { basePrompt as nodeBasePrompt } from "./default/node.js";
import { basePrompt as reactBasePrompt } from "./default/react.js";
import { BASE_PROMPT } from "./prompts.js"; 
import dotenv from "dotenv";
import { getSystemPrompt } from "./prompts.js";
import { stripIndents } from "./stripindents.js";

dotenv.config();
const app = express();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error("Error: GROQ_API_KEY environment variable is not set.");
    process.exit(1);
}
const groq = new Groq({ apiKey: GROQ_API_KEY });
app.use(express.json());
app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    const systemPrompt = getSystemPrompt();
    console.log("System Prompt Preview:\n", stripIndents(systemPrompt.substring(0, 500)) + "...\n");

    const response = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt
            },
            {
                role: "system",
                content: "Return either node or react based on what do you think this proect should be. only return a single word, either 'node' or 'react'. Do not return anything extra",
            },
        ],
        model: "openai/gpt-oss-20b",
        max_tokens: 100
    });
    const answer = response.choices[0].message.content.trim().toLowerCase();
    if(answer === "react") {
        return res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiprompts: [reactBasePrompt]
        });
    }
    if(answer === "node") {
        return res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiprompts: [nodeBasePrompt]
        });
    }
    if(answer !== "react" && answer !== "node") {
        res.status(403).json({message: "Invalid response from model"});
    }
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
    res.json(response);
})
app.listen(3000);
// async function main() {
//     const systemPrompt = getSystemPrompt();
//     console.log("System Prompt Preview:\n", stripIndents(systemPrompt.substring(0, 500)) + "...\n");

//     const msg = await groq.chat.completions.create({
//         messages: [
//             {
//                 role: "user",
//                 content: "",
//             },
//             {
//                 role: "user",
//                 content: `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`
//             },
//             {
//                 role: "system",
//                 content: systemPrompt,
//             },
//         ],
//         model: "openai/gpt-oss-20b",
//     });
//     console.log(msg.choices[0].message.content);
// }

// Optionally, call main() if you want to run it directly
// main();
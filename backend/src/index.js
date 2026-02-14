const Groq = require("groq-sdk");
require("dotenv").config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error("Error: GROQ_API_KEY environment variable is not set.");
    process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function main() {
    const msg = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "what is 2+2",
            },
        ],
        model: "openai/gpt-oss-20b",
    });
    console.log(msg.choices[0].message.content);
}

// Optionally, call main() if you want to run it directly
main();

module.exports = { main };


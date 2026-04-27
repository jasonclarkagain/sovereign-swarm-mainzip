const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();
const PORT = 5000;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const conversations = new Map();

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const id = sessionId || "default";
    if (!conversations.has(id)) conversations.set(id, []);
    const history = conversations.get(id);

    history.push({ role: "user", content: message });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      messages: [
        { role: "system", content: "You are a helpful AI assistant. Be concise and friendly." },
        ...history,
      ],
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    history.push({ role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
});

app.post("/api/reset", (req, res) => {
  const { sessionId } = req.body;
  const id = sessionId || "default";
  conversations.delete(id);
  res.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Assistant running on port ${PORT}`);
});

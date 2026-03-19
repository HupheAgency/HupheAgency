import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function callAI(
  provider: "openai" | "gemini" | "claude",
  prompt: string,
  system: string
): Promise<string> {
  switch (provider) {
    case "openai": {
      const model = process.env.OPENAI_MODEL || "gpt-4";
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      });
      return completion.choices[0]?.message?.content?.trim() ?? "";
    }

    case "gemini": {
      if (!process.env.GEMINI_API_KEY) return "not yet configured";
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        systemInstruction: system,
      });
      const result = await geminiModel.generateContent(prompt);
      return result.response.text().trim();
    }

    case "claude": {
      if (!process.env.ANTHROPIC_API_KEY) return "not yet configured";
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: prompt }],
      });
      const block = message.content[0];
      return block.type === "text" ? block.text.trim() : "";
    }
  }
}

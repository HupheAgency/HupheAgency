import 'dotenv/config'
import { callAI } from "../ai-client";

const tests: { label: string; provider: "openai" | "gemini" | "claude"; message: string }[] = [
  { label: "OpenAI (Dennis)", provider: "openai", message: "Zeg hallo als Dennis" },
  { label: "Gemini (Felix)",  provider: "gemini",  message: "Zeg hallo als Felix" },
  { label: "Claude (Koen)",   provider: "claude",  message: "Zeg hallo als Koen" },
];

async function run() {
  for (const test of tests) {
    process.stdout.write(`\n[${test.label}] ... `);
    try {
      const result = await callAI(test.provider, test.message, "Reageer kort en in het Nederlands.");
      if (result === "not yet configured") {
        console.log(`⚠️  not yet configured`);
      } else {
        console.log(`✅ ${result}`);
      }
    } catch (err: any) {
      console.log(`❌ FOUT: ${err?.message ?? err}`);
    }
  }
}

run();

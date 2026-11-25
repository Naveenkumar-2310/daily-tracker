import Anthropic from "@anthropic-ai/sdk";
import { PillLogService } from "../pill-log/pill-log.service";
import { FuelLogService } from "../fuel-log/fuel-log.service";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY Automatically
const pillLogService = new PillLogService();
const fuelLogService = new FuelLogService();

// 1) The Menu : What Claude is allowed to ask for
const tools: Anthropic.Tool[] = [
  {
    name: "get_pill_logs",
    description:
      "Get which days the user took or missed a medicine in a month.",
    input_schema: {
      type: "object",
      properties: {
        month: { type: "string", description: "Format YYYY-MM, e.g. 2026-11" },
      },
      required: ["month"],
    },
  },
  {
    name: "log_pill_taken",
    description: "Mark the medicine as taken for a date.",
    input_schema: {
      type: "object",
      properties: {
        medicineId: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["medicineId", "date"],
    },
  },
  {
    name: "get_fuel_logs",
    description: "Get recent petrol fill-ups with distance and mileage (km/L).",
    input_schema: { type: "object", properties: {} },
  },
];

//  2) The KITCHEN : Connect Each tool name to your real Code
async function runTool(name: string, input: any) {
  try {
    switch (name) {
      case "get_pill_logs":
        return await pillLogService.getCalendarMonth(input.month);
      case "log_pill_taken":
        return await pillLogService.markPill({
          medicineId: input.medicineId,
          date: input.date,
          status: "TAKEN",
        });
      case "get_fuel_logs":
        return await fuelLogService.getHistory();
      default:
        return { error: "Unknown tool" };
    }
  } catch (err: any) {
    return { error: err?.message || "Tool execution failed" };
  }
}

// 3) The LOOP (orchestration)
export async function askTracker(question: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: question },
  ];

  for (let step = 0; step < 5; step++) {
    // safety limit: max 5 rounds
    const res = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 1024,
      system: `You are a helpful assistant inside a pill and petrol tracker app. Today is ${today}. Use tools to get real data. Never guess. Answer briefly.`,
      tools,
      messages,
    });

    // Claude is done: return the final text
    if (res.stop_reason !== "tool_use") {
      const text = res.content.find((b) => b.type === "text");
      return text && text.type === "text" ? text.text : "";
    }

    // Claude asked for tools: run them and send the results back
    messages.push({ role: "assistant", content: res.content });
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type === "tool_use") {
        const output = await runTool(block.name, block.input);
        results.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(output),
        });
      }
    }
    messages.push({ role: "user", content: results });
  }
  return "Sorry, that took too many steps. Please try again.";
}

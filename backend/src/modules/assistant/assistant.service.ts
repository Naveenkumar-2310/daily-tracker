import { GoogleGenAI, Type, FunctionDeclaration, Content } from "@google/genai";
import { PillLogService } from "../pill-log/pill-log.service";
import { FuelLogService } from "../fuel-log/fuel-log.service";

const pillLogService = new PillLogService();
const fuelLogService = new FuelLogService();

// 1) The Menu: What Gemini is allowed to ask for
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "get_pill_logs",
    description:
      "Get which days the user took or missed a medicine in a month.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        month: {
          type: Type.STRING,
          description: "Format YYYY-MM, e.g. 2026-11",
        },
      },
      required: ["month"],
    },
  },
  {
    name: "log_pill_taken",
    description: "Mark the medicine as taken for a date.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        medicineId: { type: Type.STRING },
        date: { type: Type.STRING, description: "YYYY-MM-DD" },
      },
      required: ["medicineId", "date"],
    },
  },
  {
    name: "get_fuel_logs",
    description: "Get recent petrol fill-ups with distance and mileage (km/L).",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

// 2) The Kitchen: Connect each tool name to your real code
async function runTool(name: string, input: Record<string, any> = {}) {
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

// 3) The Loop (orchestration)
export async function askTracker(question: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add GEMINI_API_KEY=... to backend/.env",
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const today = new Date().toISOString().slice(0, 10);

  const contents: Content[] = [
    { role: "user", parts: [{ text: question }] },
  ];

  for (let step = 0; step < 5; step++) {
    let res;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction: `You are a helpful assistant inside a pill and petrol tracker app. Today is ${today}. Use tools to get real data. Never guess. Answer briefly.`,
            tools: [{ functionDeclarations }],
          },
        });
        break;
      } catch (err: any) {
        const status = err?.status || err?.statusCode;
        if ((status === 503 || status === 429) && attempt < 2) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
    if (!res) break;

    const calls = res.functionCalls;
    if (!calls || calls.length === 0) {
      return res.text || "";
    }

    // Append model's tool-call turn
    if (res.candidates?.[0]?.content) {
      contents.push(res.candidates[0].content);
    }

    // Execute requested tools and send results back
    const responseParts = [];
    for (const call of calls) {
      const toolName = call.name || "";
      const output = await runTool(toolName, (call.args as Record<string, any>) || {});
      responseParts.push({
        functionResponse: {
          name: toolName,
          response: { result: output },
        },
      });
    }

    contents.push({ role: "user", parts: responseParts });
  }

  return "Sorry, that took too many steps. Please try again.";
}

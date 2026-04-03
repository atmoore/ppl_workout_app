import { convertToModelMessages, streamText, UIMessage } from "ai";
import { buildSystemPrompt } from "@/lib/chat-context";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { getCurrentWorkout } from "@/db/queries";
import { createChatTools, getOrCreateSession } from "@/lib/chat-tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  let systemPrompt: string;
  let workoutData: Awaited<ReturnType<typeof getCurrentWorkout>>;
  try {
    workoutData = await getCurrentWorkout();
    systemPrompt = await buildSystemPrompt(workoutData);
  } catch (e) {
    console.error("Chat setup failed:", e);
    return Response.json({ error: "Failed to load workout data" }, { status: 500 });
  }

  // Save user message to DB
  const lastUserMsg = messages[messages.length - 1];
  if (lastUserMsg?.role === "user") {
    const session = await getOrCreateSession(workoutData);
    const textPart = lastUserMsg.parts?.find((p: { type: string }) => p.type === "text");
    const textContent = textPart && "text" in textPart ? (textPart as { text: string }).text : "";
    if (textContent) {
      await db.insert(chatMessages).values({
        sessionId: session.id,
        role: "user",
        content: textContent,
      });
    }
  }

  const result = streamText({
    model: "anthropic/claude-sonnet-4.6",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (text) {
        try {
          const session = await getOrCreateSession(workoutData);
          await db.insert(chatMessages).values({
            sessionId: session.id,
            role: "assistant",
            content: text,
          });
        } catch (e) {
          console.error("Failed to save assistant message:", e);
        }
      }
    },
    tools: createChatTools(workoutData),
  });

  return result.toUIMessageStreamResponse({ originalMessages: messages });
}

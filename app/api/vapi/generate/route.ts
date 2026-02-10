import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  // 🔐 AUTH CHECK
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.VAPI_BACKEND_SECRET) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  // 🧠 SMART DETECTION
  let toolCallId = "manual-call";
  let role, level, techstack, type, amount, userid;

  if (body?.message?.toolCallList?.length) {
    // ✅ VAPI MODE
    const toolCall = body.message.toolCallList[0];
    toolCallId = toolCall.id;

    ({ role, level, techstack, type, amount, userid } = toolCall.arguments);
  } else {
    // ✅ NORMAL API / POSTMAN MODE
    ({ role, level, techstack, type, amount, userid } = body);
  }

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
      `,
    });

    const interviewData = {
      role: String(role),
      type: String(type),
      level: String(level),
      techstack: String(techstack).split(",").map(s => s.trim()),
      questions: JSON.parse(questions || "[]"),
      userId: String(userid),
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString()
    };

    await db.collection("interviews").add(interviewData);

    // ✅ VAPI RESPONSE FORMAT (SAFE)
    return Response.json({
      results: [
        {
          toolCallId,
          result: "Interview generated and saved successfully",
        },
      ],
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true });
}

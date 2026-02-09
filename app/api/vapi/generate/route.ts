import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {

  /* 🔐 AUTH CHECK (VERY IMPORTANT) */
  const authHeader = request.headers.get("authorization");

  if (
    !authHeader ||
    authHeader !== `Bearer ${process.env.VAPI_BACKEND_SECRET}`
  ) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  /* BODY */
  const { type, role, level, techstack, amount, userid } =
    await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
      The job role is ${role}.
      The job experience level is ${level}.
      The tech stack used in the job is: ${techstack}.
      The focus between behavioural and technical questions should lean towards: ${type}.
      The amount of questions required is: ${amount}.
      Please return only the questions.
      Avoid special characters.
      Return format:
      ["Question 1", "Question 2"]`,
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
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interviewData);

    return Response.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { success: false, error: "Internal Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true }, { status: 200 });
}

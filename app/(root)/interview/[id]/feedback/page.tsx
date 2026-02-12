import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  let feedback = await getFeedbackByInterviewId({
    interviewId: id || `${interview.id}`,
    userId: user?.id!,
  });

  // Fake data for Python Developer interview
  const fakeFeedback = {
    totalScore: 78,
    createdAt: new Date(),
    finalAssessment:
      "Good problem-solving approach with solid Python fundamentals. You demonstrated a clear understanding of data structures and algorithms. However, there's room for improvement in code optimization and explaining time complexities. Your communication was clear, and you asked clarifying questions before diving into the solution.",
    categoryScores: [
      {
        name: "Problem Solving",
        score: 82,
        comment:
          "Excellent approach to breaking down the problem. You identified edge cases and thought about scalability.",
      },
      {
        name: "Python Knowledge",
        score: 80,
        comment:
          "Strong grasp of Python syntax and built-in functions. Could improve on using more Pythonic idioms.",
      },
      {
        name: "Code Quality",
        score: 75,
        comment:
          "Clean code with good variable naming. Consider adding type hints and docstrings for better maintainability.",
      },
      {
        name: "Communication",
        score: 76,
        comment:
          "You explained your thought process well. Work on articulating the time and space complexity of your solution.",
      },
      {
        name: "Efficiency",
        score: 72,
        comment:
          "Solution works correctly but has room for optimization. Explore alternative approaches for better time complexity.",
      },
    ],
    strengths: [
      "Strong logical thinking and problem decomposition skills",
      "Good understanding of Python standard library and data structures",
      "Clear communication and ability to explain your reasoning",
      "Proactive in asking clarifying questions",
      "Handled follow-up questions and improvements well",
    ],
    areasForImprovement: [
      "Analyze and verbalize time and space complexity of solutions",
      "Practice using more advanced Python features (comprehensions, decorators, etc.)",
      "Write cleaner code with type hints and documentation",
      "Optimize solutions for edge cases and large datasets",
      "Practice explaining trade-offs between different approaches",
    ],
  };

  // Use fake data if no real feedback is available
  if (!feedback) {
    feedback = fakeFeedback as any;
  }

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback on the Interview -{" "}
          <span className="capitalize">{interview.role || "Python Developer"}</span> Interview
        </h1>
      </div>

      <div className="flex flex-row justify-center ">
        <div className="flex flex-row gap-5">
          {/* Overall Impression */}
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Overall Impression:{" "}
              <span className="text-primary-200 font-bold">
                {feedback?.totalScore || "60"}
              </span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                : "12th Aug, 2024 3:30 PM"}  
            </p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback?.finalAssessment}</p>

      {/* Interview Breakdown */}
      <div className="flex flex-col gap-4">
        <h2>Breakdown of the Interview:</h2>
        {feedback?.categoryScores?.map((category, index) => (
          <div key={index}>
            <p className="font-bold">
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Strengths</h3>
        <ul>
          {feedback?.strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas for Improvement</h3>
        <ul>
          {feedback?.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Back to dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center"
          >
            <p className="text-sm font-semibold text-black text-center">
              Retake Interview
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function QuizPlayer({
  playList = [],
  difficulty = "medium",
  current = 0,
  setAnswerForCurrent,
  answers = {},
  percent = 0,
  next,
  prev,
  submit,
}) {
  const totalPlay = playList.length;
  const item = playList[current];
  if (!totalPlay || !item) return null;

  const originalIndex = item._i;
  const userAns = originalIndex != null ? answers[originalIndex] : undefined;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>
          <span className="font-semibold text-slate-800">
            Question {current + 1} of {totalPlay}
          </span>{" "}
          •{" "}
          {item.type === "mcq"
            ? "Multiple Choice"
            : item.type === "tf"
            ? "True/False"
            : "Short Answer"}{" "}
          • {difficulty[0].toUpperCase() + difficulty.slice(1)}
        </div>
        <div>
          <span className="text-slate-500">Progress </span>
          <span className="font-semibold text-slate-800">{percent}%</span>
        </div>
      </div>

      <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        {item.type === "mcq" && (
          <>
            <p className="font-medium text-lg text-slate-900">
              {item.question}
            </p>
            <div className="mt-4 space-y-2">
              {item.options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 cursor-pointer ${
                    userAns === idx
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    className="h-4 w-4"
                    checked={userAns === idx}
                    onChange={() => setAnswerForCurrent(idx)}
                    name={`mcq-${originalIndex}`}
                  />
                  <span className="text-slate-800 text-sm">
                    {String.fromCharCode(65 + idx)}. {opt}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}

        {item.type === "tf" && (
          <>
            <p className="font-medium text-lg text-slate-900">
              {item.statement}
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "True", val: true },
                { label: "False", val: false },
              ].map((o) => (
                <label
                  key={String(o.val)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 cursor-pointer ${
                    userAns === o.val
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    className="h-4 w-4"
                    checked={userAns === o.val}
                    onChange={() => setAnswerForCurrent(o.val)}
                    name={`tf-${originalIndex}`}
                  />
                  <span className="text-slate-800 text-sm">{o.label}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {item.type === "short" && (
          <>
            <p className="font-medium text-lg text-slate-900">{item.prompt}</p>
            <textarea
              rows={5}
              className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Type your answer here..."
              value={userAns || ""}
              onChange={(e) => setAnswerForCurrent(e.target.value)}
            />
            <p className="mt-2 text-xs text-slate-500">
              (Short answers are not auto-graded. A sample answer is provided in
              preview.)
            </p>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={current === 0}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
            current === 0
              ? "border-slate-200 text-slate-400 cursor-not-allowed"
              : "border-slate-300 bg-white hover:bg-slate-50"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          {current < totalPlay - 1 ? (
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
            >
              Next Question
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

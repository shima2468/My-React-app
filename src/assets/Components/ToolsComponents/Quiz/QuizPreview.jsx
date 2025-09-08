import React, { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function QuizPreview({
  quiz,
  difficulty = "medium",
  brand,
  browse = false,
}) {
  if (!quiz || quiz.length === 0) return null;

  if (!browse) {
    return (
      <div className="space-y-4">
        {quiz.map((q, i) => (
          <Card key={i} q={q} brand={brand} index={i} />
        ))}
      </div>
    );
  }

  const [current, setCurrent] = useState(0);
  const [tempAns, setTempAns] = useState({});
  const total = quiz.length;
  const percent = Math.round(((current + 1) / total) * 100);
  const item = quiz[current];

  const next = () => setCurrent((c) => Math.min(total - 1, c + 1));
  const prev = () => setCurrent((c) => Math.max(0, c - 1));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              Question {current + 1} of {total}
            </p>
            <p className="text-sm text-slate-500">
              {item.type === "mcq"
                ? "Multiple Choice"
                : item.type === "tf"
                ? "True / False"
                : "Short Answer"}{" "}
              • {difficulty[0].toUpperCase() + difficulty.slice(1)}
            </p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="text-slate-500">Progress</p>
            <p className="font-semibold text-slate-900">{percent}%</p>
          </div>
        </div>

        <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${percent}%`,
              backgroundColor: brand?.main || "#3B82F6",
            }}
          />
        </div>

        <div className="mt-6">
          {item.type === "mcq" && (
            <>
              <h3 className="text-2xl font-semibold text-slate-900">
                {item.question}
              </h3>
              <div className="mt-4 space-y-3">
                {item.options.map((opt, idx) => {
                  const checked = tempAns[current] === idx;
                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
                        checked
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() =>
                          setTempAns((a) => ({ ...a, [current]: idx }))
                        }
                      />
                      <span className="text-slate-800 text-sm">
                        {String.fromCharCode(65 + idx)}. {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {item.type === "tf" && (
            <>
              <h3 className="text-2xl font-semibold text-slate-900">
                {item.statement}
              </h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "True", val: true },
                  { label: "False", val: false },
                ].map((o) => {
                  const checked = tempAns[current] === o.val;
                  return (
                    <label
                      key={String(o.val)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
                        checked
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() =>
                          setTempAns((a) => ({ ...a, [current]: o.val }))
                        }
                      />
                      <span className="text-slate-800 text-sm">{o.label}</span>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {item.type === "short" && (
            <>
              <h3 className="text-2xl font-semibold text-slate-900">
                {item.prompt}
              </h3>
              <textarea
                rows={5}
                className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="Type your answer (preview)"
                value={tempAns[current] || ""}
                onChange={(e) =>
                  setTempAns((a) => ({ ...a, [current]: e.target.value }))
                }
              />
            </>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between">
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
          <button
            onClick={() =>
              current < total - 1 ? setCurrent(current + 1) : setCurrent(0)
            }
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white hover:opacity-90"
            style={{ backgroundColor: brand?.main || "#3B82F6" }}
          >
            {current < total - 1 ? "Next Question" : "Restart Preview"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ q, brand, index }) {
  if (q.type === "mcq") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs uppercase tracking-wide ${
              brand?.tagMCQ || "text-sky-600"
            }`}
          >
            Multiple Choice
          </span>
          <span className="text-xs text-slate-500">Q{index + 1}</span>
        </div>
        <p className="mt-2 font-medium text-slate-900">{q.question}</p>
        <ul className="mt-3 space-y-2">
          {q.options.map((opt, idx) => (
            <li
              key={idx}
              className="rounded-lg border px-3 py-2 text-sm border-slate-200 bg-white"
            >
              {String.fromCharCode(65 + idx)}. {opt}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (q.type === "tf") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span
            className={`text-xs uppercase tracking-wide ${
              brand?.tagTF || "text-blue-600"
            }`}
          >
            True / False
          </span>
          <span className="text-xs text-slate-500">Q{index + 1}</span>
        </div>
        <p className="mt-2 font-medium text-slate-900">{q.statement}</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span
          className={`text-xs uppercase tracking-wide ${
            brand?.tagShort || "text-cyan-600"
          }`}
        >
          Short Answer
        </span>
        <span className="text-xs text-slate-500">Q{index + 1}</span>
      </div>
      <p className="mt-2 font-medium text-slate-900">{q.prompt}</p>
    </div>
  );
}

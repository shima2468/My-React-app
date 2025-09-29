import { Plus } from "lucide-react";

const defaultGoals = [
  { title: "Complete Psychology Chapter 1-3", due: "Tomorrow", progress: 75 },
  { title: "Review Biology Notes", due: "This Week", progress: 40 },
  { title: "Prepare for Chemistry Quiz", due: "Friday", progress: 90 },
];

export default function StudyGoals({ goals = defaultGoals, onAdd }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-serif text-lg font-bold text-gray-900">
        Study Goals
      </h3>

      <ul className="space-y-5">
        {goals.map((g, i) => (
          <li key={i}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-slate-900">{g.title}</span>
              <span className="text-sm text-slate-500">{g.due}</span>
            </div>

            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-gray-900"
                style={{ width: `${g.progress}%` }}
              />
            </div>

            <div className="mt-1.5 text-xs text-slate-600">
              {g.progress}% complete
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" />
        Add New Goal
      </button>
    </section>
  );
}

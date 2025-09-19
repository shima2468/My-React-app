// src/assets/Components/Overview/StatsRow.jsx
import { FileText, BookOpen, Brain, Bolt, Clock3 } from "lucide-react";

export default function StatsRow({
  items = [
    { id: 1, icon: <FileText className="h-6 w-6 text-blue-500" />, value: 2, label: "Materials" },
    { id: 2, icon: <BookOpen className="h-6 w-6 text-cyan-500" />, value: 12, label: "Summaries" },
    { id: 3, icon: <Brain className="h-6 w-6 text-emerald-600" />, value: 8, label: "Quizzes" },
    { id: 4, icon: <Bolt className="h-6 w-6 text-orange-500" />, value: 5, label: "Day Streak" },
    { id: 5, icon: <Clock3 className="h-6 w-6 text-purple-600" />, value: "24.5h", label: "This Week" },
  ],
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {items.map(({ id, icon, value, label }) => (
        <div
          key={id}
          className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="shrink-0">{icon}</div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</div>
            <div className="mt-1 text-slate-600">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

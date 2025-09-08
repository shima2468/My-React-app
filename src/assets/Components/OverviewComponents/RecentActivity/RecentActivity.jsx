// src/assets/Components/RecentActivity/RecentActivity.jsx
import { FileText, Share2, Zap, Brain } from "lucide-react";

const ICONS = {
  summary: { Icon: FileText, dot: "text-sky-500", bg: "bg-sky-100" },
  mindmap: { Icon: Share2, dot: "text-teal-500", bg: "bg-teal-100" },
  quiz: { Icon: Zap, dot: "text-orange-500", bg: "bg-orange-100" },
  knowledge: { Icon: Brain, dot: "text-green-600", bg: "bg-green-100" },
};

const SAMPLE = [
  {
    id: 1,
    type: "summary",
    title: "Generated summary",
    file: "Introduction to Psychology.pdf",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "mindmap",
    title: "Created mind map",
    file: "Biology Chapter 5 Notes.docx",
    time: "1 day ago",
  },
  {
    id: 3,
    type: "quiz",
    title: "Took quiz",
    file: "Chemistry Basics.pdf",
    time: "2 days ago",
  },
  {
    id: 4,
    type: "knowledge",
    title: "Generated knowledge graph",
    file: "History Timeline.docx",
    time: "3 days ago",
  },
];


export default function RecentActivity({ items = SAMPLE }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-serif text-lg font-bold text-gray-900">
        Recent Activity
      </h3>

      <ul className="space-y-5">
        {items.map(({ id, type, title, file, time }) => {
          const { Icon, dot, bg } = ICONS[type] || ICONS.summary;
          return (
            <li key={id} className="flex items-start gap-3">
              <span
                className={`mt-0.5 grid h-8 w-8 place-items-center rounded-full ${bg}`}
              >
                <Icon className={`h-4 w-4 ${dot}`} />
              </span>

              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                {file ? <p className="text-sm text-slate-600">{file}</p> : null}
                <p className="text-xs text-slate-500">{time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

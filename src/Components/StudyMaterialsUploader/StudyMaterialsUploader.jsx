
import { useRef, useState, useEffect } from "react";
import { Upload, X, FileText } from "lucide-react";

const ACCEPT = ".pdf,.doc,.docx,.txt,.ppt,.pptx";
const MAX_MB = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function readMaterials() {
  try {
    return JSON.parse(localStorage.getItem("materials") || "[]");
  } catch {
    return [];
  }
}
function writeMaterials(arr) {
  localStorage.setItem("materials", JSON.stringify(arr));
}
function fmtBytes(n) {
  if (!n && n !== 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudyMaterialsUploader({
  exposePick,
  parentId = null,
  onDone,
  autoPickOnMount = false,
}) {
  const inputRef = useRef(null);
  const [isDrag, setIsDrag] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState([]);

  const pickFiles = () => inputRef.current?.click();
  useEffect(() => {
    if (typeof exposePick === "function") exposePick(pickFiles);
  }, [exposePick]);

  useEffect(() => {
    if (autoPickOnMount) pickFiles();
  }, [autoPickOnMount]);

  const acceptSet = ACCEPT.split(",");

  const filterFiles = (list) => {
    const files = Array.from(list || []);
    const valid = [];
    for (const f of files) {
      const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
      if (acceptSet.includes(ext) && f.size <= MAX_BYTES) valid.push(f);
    }
    if (files.length && !valid.length) {
      setError(
        `Only PDF, DOC, DOCX, TXT, PPT, PPTX up to ${MAX_MB}MB each are allowed.`
      );
      setTimeout(() => setError(""), 3000);
    }
    if (valid.length) {
      setPending((prev) => {
        const next = [...prev];
        for (const f of valid) {
          const dup = next.some((p) => p.name === f.name && p.size === f.size);
          if (!dup) next.push(f);
        }
        return next;
      });
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    filterFiles(e.dataTransfer.files);
  };
  const removeOne = (idx) =>
    setPending((prev) => prev.filter((_, i) => i !== idx));
  const clearAll = () => setPending([]);

  const confirmAdd = () => {
    if (!pending.length) return;
    const now = new Date().toISOString();
    const newItems = pending.map((f, i) => ({
      id: (crypto.randomUUID && crypto.randomUUID()) || `m-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      type: f.type || "",
      uploadedAt: now,
      parentId,
      isFolder: false,
    }));
    const current = readMaterials();
    writeMaterials([...current, ...newItems]);
    window.dispatchEvent(new CustomEvent("materials:updated"));
    setPending([]);
    if (typeof onDone === "function") onDone();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload study materials"
      onClick={pickFiles}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pickFiles()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDrag(true);
      }}
      onDragLeave={() => setIsDrag(false)}
      onDrop={onDrop}
      className={[
        "w-full rounded-2xl border-2 border-dashed",
        isDrag ? "border-slate-400 bg-slate-50" : "border-slate-300 bg-white",
        "min-h-[220px] px-6 sm:px-10 py-6 sm:py-8",
        "text-center transition-colors flex items-center justify-center cursor-pointer",
      ].join(" ")}
    >
      <div
        className="mx-auto w-full max-w-3xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-slate-500">
          <Upload className="h-8 w-8" strokeWidth={1.75} />
        </div>
        <h2 className="mb-1 font-serif text-lg sm:text-xl font-bold text-gray-900">
          Upload Study Materials
        </h2>
        <p className="mx-auto mb-4 max-w-xl text-slate-600 text-sm">
          Drag and drop your PDFs, documents, or notes here, or click to browse
        </p>

        <div className="mb-4 flex items-center justify-center">
          <button
            type="button"
            onClick={pickFiles}
            className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Upload className="h-4 w-4" /> Choose Files
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => filterFiles(e.target.files)}
          />
        </div>

        <p className="text-xs text-slate-500">
          Supported formats: PDF, DOC, DOCX, TXT, PPT, PPTX (Max {MAX_MB}MB
          each)
        </p>
        {error && (
          <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>
        )}

        {pending.length > 0 && (
          <div className="mt-5 w-full">
            <div className="mb-2 text-left text-sm font-semibold text-slate-700">
              Files to add ({pending.length})
            </div>
            <ul className="space-y-2">
              {pending.map((f, idx) => (
                <li
                  key={`${f.name}-${f.size}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </span>
                    <div className="truncate">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {f.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {fmtBytes(f.size)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOne(idx)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={confirmAdd}
                className="rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Done
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

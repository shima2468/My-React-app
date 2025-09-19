// src/assets/Components/MaterialsComponents/MaterialsList/MaterialsList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import StudyMaterialsUploader from "../../StudyMaterialsUploader/StudyMaterialsUploader";
import { AnimatePresence, motion } from "framer-motion";
import { Folder, FolderOpen, FileText, Upload, PlusSquare, Trash2 } from "lucide-react";

const read = () => { try { return JSON.parse(localStorage.getItem("materials") || "[]"); } catch { return []; } };
const write = (arr) => localStorage.setItem("materials", JSON.stringify(arr));

function removeWithChildren(list, id) {
  const ids = new Set([id]);
  const collect = (parentId) => {
    for (const it of list) {
      if ((it.parentId ?? null) === parentId) {
        ids.add(it.id);
        collect(it.id);
      }
    }
  };
  collect(id);
  return list.filter((it) => !ids.has(it.id));
}

export default function MaterialsList({ exposeAskUpload, onOpenCreate }) {
  const [allItems, setAllItems] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);   
  const [inlineUploadFor, setInlineUploadFor] = useState(null);   
  const [autoPick, setAutoPick] = useState(false);
  const uploaderPickRef = useRef(null);

  useEffect(() => {
    const load = () => setAllItems(read());
    load();
    const h = () => load();
    window.addEventListener("materials:updated", h);
    return () => window.removeEventListener("materials:updated", h);
  }, []);

  const visibleItems = useMemo(
    () => allItems.filter((it) => (it.parentId ?? null) === (currentFolderId ?? null)),
    [allItems, currentFolderId]
  );
  const currentFolder = useMemo(
    () => allItems.find((x) => x.id === currentFolderId) || null,
    [allItems, currentFolderId]
  );

  // خليه يفتح الرافع داخل الكرت الحالي
  const openInlineUploaderHere = (withAutoPick = false) => {
    setInlineUploadFor(currentFolderId ?? "__root__");
    setAutoPick(!!withAutoPick);
  };
  const closeInlineUploader = () => {
    setInlineUploadFor(null);
    setAutoPick(false);
  };

  // خلّي زر Upload في الهيدر يطلب فتح الرافع داخل الكرت الحالي
  useEffect(() => {
    if (typeof exposeAskUpload === "function") {
      exposeAskUpload(() => openInlineUploaderHere(true)); // مع AutoPick
    }
  }, [exposeAskUpload, currentFolderId]);

  // إنشاء فولدر (من الليست)
  const createFolderHere = () => {
    if (typeof onOpenCreate === "function") { onOpenCreate(); return; }
    const name = prompt("Folder name:");
    if (!name) return;
    const folderItem = {
      id: crypto.randomUUID(),
      name,
      isFolder: true,
      itemsCount: 0,
      uploadedAt: new Date().toISOString(),
      parentId: currentFolderId,
    };
    write([...allItems, folderItem]);
    window.dispatchEvent(new CustomEvent("materials:updated"));
  };

  const openFolder = (folderId) => { setCurrentFolderId(folderId); setInlineUploadFor(null); };
  const goBackRoot = () => { setCurrentFolderId(null); setInlineUploadFor(null); };
  const deleteItem = (id) => {
    const next = removeWithChildren(allItems, id);
    write(next);
    window.dispatchEvent(new CustomEvent("materials:updated"));
    if (currentFolderId === id) goBackRoot();
  };

  const hereKey = currentFolderId ?? "__root__";
  const count = visibleItems.length;

  return (
    <div className="space-y-8">
      

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`materials-${hereKey}-${count}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {count === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                {currentFolder ? `${currentFolder.name}(0 items)` : "All Materials(0 items)"}
              </h3>
              {inlineUploadFor === hereKey ? (
                <StudyMaterialsUploader
                  parentId={currentFolderId}
                  exposePick={(fn) => (uploaderPickRef.current = fn)}
                  autoPickOnMount={autoPick}
                  onDone={closeInlineUploader}
                />
              ) : (
                <div className="grid place-items-center rounded-2xl border-2 border-dashed border-slate-300 py-14">
                  <Folder className="h-12 w-12 text-slate-400 mb-3" strokeWidth={1.5} />
                  <div className="text-xl font-serif font-bold text-slate-800 mb-2">Empty folder</div>
                  <div className="text-slate-600 mb-4 text-center max-w-md">
                    This folder is empty. Upload files or create subfolders to organize your materials.
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => openInlineUploaderHere()} className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                      <Upload className="h-4 w-4" /> Upload Files
                    </button>
                    <button onClick={createFolderHere} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                      <PlusSquare className="h-4 w-4" /> Create Folder
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {currentFolder ? `${currentFolder.name}(${count} items)` : `All Materials(${count} items)`}
                </h3>

                <div className="flex items-center gap-2">
                  <button onClick={() => openInlineUploaderHere(true)} className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90">
                    <Upload className="h-4 w-4" /> Upload
                  </button>
                  <button onClick={createFolderHere} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    <PlusSquare className="h-4 w-4" /> Folder
                  </button>
                </div>
              </div>

              {inlineUploadFor === hereKey && (
                <div className="mb-6">
                  <StudyMaterialsUploader
                    parentId={currentFolderId}
                    exposePick={(fn) => (uploaderPickRef.current = fn)}
                    autoPickOnMount={autoPick}
                    onDone={closeInlineUploader}
                  />
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((it) => (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100">
                        {it.isFolder ? (
                          currentFolderId === it.id ? <FolderOpen className="h-5 w-5 text-slate-700" /> : <Folder className="h-5 w-5 text-slate-700" />
                        ) : (
                          <FileText className="h-5 w-5 text-slate-700" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{it.name}</div>
                        <div className="text-xs text-slate-500">
                          {it.isFolder
                            ? `${allItems.filter(x => (x.parentId ?? null) === it.id).length} items`
                            : (it.size ? `${(it.size / (1024 * 1024)).toFixed(1)} MB` : "")}
                          {it.uploadedAt ? ` • ${new Date(it.uploadedAt).toLocaleDateString()}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {it.isFolder && (
                        <button title="Open folder" onClick={() => openFolder(it.id)} className="rounded-lg p-2 hover:bg-slate-100">
                          <FolderOpen className="h-5 w-5" />
                        </button>
                      )}
                      <button title="Delete" onClick={() => deleteItem(it.id)} className="rounded-lg p-2 hover:bg-slate-100 text-rose-600">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

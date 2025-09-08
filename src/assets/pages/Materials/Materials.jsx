import { useRef, useState } from "react";
import { List, PlusSquare, Plus } from "lucide-react";
import Header from "@/assets/Components/Header/Header";
import MaterialsList from "@/assets/Components/MaterialsComponents/MaterialsList/MaterialsList";
import StudyMaterialsUploader from "../../Components/StudyMaterialsUploader/StudyMaterialsUploader";

const btn =
  "rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold hover:bg-slate-100 flex justify-content-center shadow-sm";
const iconBtn =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-100 flex justify-content-center shadow-sm";
const primaryBtn =
  "rounded-lg border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 flex justify-content-center shadow-sm";

export default function Materials() {
  const [showCreate, setShowCreate] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [currentFolder, setCurrentFolder] = useState(null);
  const askUploadRef = useRef(null);

  const onClickNewFolder = () => setShowCreate(true);
  const onCancelCreate = () => {
    setFolderName("");
    setShowCreate(false);
  };

  const onCreateFolder = (e) => {
    e.preventDefault();
    const name = folderName.trim();
    if (!name) return;

    const current = JSON.parse(localStorage.getItem("materials") || "[]");
    const folderItem = {
      id: crypto.randomUUID(),
      name,
      isFolder: true,
      uploadedAt: new Date().toISOString(),
      parentId: currentFolder?.id ?? null,
      itemsCount: 0,
    };
    localStorage.setItem("materials", JSON.stringify([...current, folderItem]));
    window.dispatchEvent(new CustomEvent("materials:updated"));

    setFolderName("");
    setShowCreate(false);
  };

  const handleOpenFolder = (folder) =>
    setCurrentFolder({ id: folder.id, name: folder.name });
  const goRoot = () => setCurrentFolder(null);

  return (
    <div className="space-y-6">
      <Header
        title="My Materials"
        subtitle="Organize and manage your study materials"
        right={
          <>
            <button className={iconBtn} aria-label="List view">
              <List className="h-4 w-4" />
            </button>

            <button className={btn} onClick={onClickNewFolder}>
              <span className="inline-flex items-center gap-2">
                <PlusSquare className="h-4 w-4" /> New Folder
              </span>
            </button>

            <button
              className={primaryBtn}
              onClick={() => askUploadRef.current && askUploadRef.current()}
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Upload Files
              </span>
            </button>
          </>
        }
      />

      <div className="text-sm text-slate-700">
        <button onClick={goRoot} className="hover:underline">
          All Materials
        </button>
        {currentFolder && (
          <>
            <span className="mx-2">›</span>
            <span className="font-semibold">{currentFolder.name}</span>
          </>
        )}
      </div>

      {showCreate && (
        <form
          onSubmit={onCreateFolder}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
        >
          <input
            type="text"
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            className="rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Create
          </button>
          <button
            type="button"
            onClick={onCancelCreate}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </form>
      )}
      <StudyMaterialsUploader />
      <MaterialsList
        currentFolderId={currentFolder?.id ?? null}
        currentFolderName={currentFolder?.name ?? null}
        onOpenFolder={handleOpenFolder}
        onOpenCreate={() => setShowCreate(true)}
        exposeAskUpload={(fn) => (askUploadRef.current = fn)}
      />
    </div>
  );
}

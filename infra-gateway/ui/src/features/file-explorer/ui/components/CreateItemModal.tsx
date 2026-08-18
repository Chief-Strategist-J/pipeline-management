import React, { useState } from "react";
import { X, FolderPlus, FilePlus } from "lucide-react";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: "file" | "folder", content?: string) => void;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<"file" | "folder">("file");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), type, content);
      setName("");
      setContent("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl w-full max-w-md shadow-2xl text-white overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#252526]">
          <div className="flex items-center gap-2 font-bold text-sm">
            {type === "folder" ? (
              <FolderPlus className="h-4 w-4 text-amber-400" />
            ) : (
              <FilePlus className="h-4 w-4 text-blue-400" />
            )}
            <span>Create Folder / File Structure Node</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
              Node Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("file")}
                className={`py-2 px-3 rounded flex items-center justify-center gap-2 border font-semibold transition-all cursor-pointer ${
                  type === "file"
                    ? "bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30"
                    : "bg-[#2a2d2e] border-white/5 text-slate-300 hover:bg-[#37373d]"
                }`}
              >
                <FilePlus className="h-4 w-4" />
                <span>File</span>
              </button>
              <button
                type="button"
                onClick={() => setType("folder")}
                className={`py-2 px-3 rounded flex items-center justify-center gap-2 border font-semibold transition-all cursor-pointer ${
                  type === "folder"
                    ? "bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-600/30"
                    : "bg-[#2a2d2e] border-white/5 text-slate-300 hover:bg-[#37373d]"
                }`}
              >
                <FolderPlus className="h-4 w-4" />
                <span>Folder</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
              {type === "folder" ? "Folder Name" : "File Name (with extension)"}
            </label>
            <input
              type="text"
              required
              placeholder={type === "folder" ? "components" : "CustomComponent.tsx"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#2a2d2e] border border-white/10 text-white px-3 py-2 rounded outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>

          {type === "file" && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                Initial File Content (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="// Enter code or content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#2a2d2e] border border-white/10 text-white p-3 rounded outline-none focus:border-blue-500 font-mono text-xs resize-none"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#2a2d2e] hover:bg-[#37373d] text-slate-300 rounded font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold shadow-md shadow-blue-600/30 transition-colors cursor-pointer"
            >
              Add Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

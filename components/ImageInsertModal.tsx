"use client";
import { useState } from "react";
import { uploadLargeAsset } from "@/lib/utils";

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

export default function ImageInsertModal({ isOpen, onClose, onInsert }: ImageInsertModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadLargeAsset(file);
      setImageUrl(url);
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsert = () => {
    if (imageUrl.trim()) {
      onInsert(imageUrl.trim());
      setImageUrl("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-red-600"
        >
          ✕
        </button>
        <h3 className="text-lg font-black mb-4">Insert Image</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <label className="flex-1 text-center bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-widest cursor-pointer hover:bg-slate-200">
              {isUploading ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                }}
              />
            </label>
            <button
              onClick={handleInsert}
              disabled={!imageUrl.trim()}
              className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50"
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
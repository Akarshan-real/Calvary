"use client";

import React, { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Camera,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Save,
  X,
  SlidersHorizontal,
} from "lucide-react";
import type { GalleryItem } from "@/types/database";
import { motion, AnimatePresence } from "motion/react";

interface AdminGalleryManagementProps {
  initialItems: GalleryItem[];
}

export default function AdminGalleryManagement({
  initialItems,
}: AdminGalleryManagementProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Modal State for Add & Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GalleryItem["category"]>("dishes");
  const [tag, setTag] = useState("Artisanal Showcase");
  const [aspect, setAspect] = useState("aspect-[4/3]");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setCategory("dishes");
    setTag("Artisanal Showcase");
    setAspect("aspect-[4/3]");
    setImageMode("upload");
    setImageUrl("");
    setSelectedFile(null);
    setModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setTag(item.tag);
    setAspect(item.aspect || "aspect-[4/3]");
    setImageMode("url");
    setImageUrl(item.image);
    setSelectedFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setStatusMsg(null);

    try {
      if (editingItem) {
        // UPDATE Existing
        if (!editingItem.isCustom) {
          // Static base photo fallback in UI state
          setItems((prev) =>
            prev.map((i) =>
              i.id === editingItem.id
                ? {
                    ...i,
                    title: title.trim(),
                    category,
                    tag: tag.trim(),
                    image: imageUrl.trim() || i.image,
                    aspect,
                  }
                : i
            )
          );
          setStatusMsg({ type: "success", text: "Gallery photo details updated!" });
          setModalOpen(false);
        } else {
          const res = await fetch("/api/gallery", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: String(editingItem.id),
              title,
              category,
              tag,
              imageUrl: imageUrl.trim() || undefined,
              aspect,
            }),
          });
          const resJson = await res.json();

          if (resJson.success) {
            setItems((prev) =>
              prev.map((i) =>
                i.id === editingItem.id
                  ? {
                      ...i,
                      title: title.trim(),
                      category,
                      tag: tag.trim(),
                      image: imageUrl.trim() || i.image,
                      aspect,
                    }
                  : i
              )
            );
            setStatusMsg({ type: "success", text: "Gallery photo updated successfully!" });
            setModalOpen(false);
          } else {
            setStatusMsg({ type: "error", text: resJson.error || "Failed to update gallery photo." });
          }
        }
      } else {
        // CREATE New
        if (imageMode === "upload") {
          if (!selectedFile) {
            setStatusMsg({ type: "error", text: "Please select an image file to upload." });
            setUploading(false);
            return;
          }
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("folder", "displayAssets");
          formData.append("fileName", title.trim() || selectedFile.name);
          formData.append(
            "altText",
            JSON.stringify({ category, tag: tag.trim() || "Artisanal Craft", aspect })
          );

          const res = await fetch("/api/media", {
            method: "POST",
            body: formData,
          });
          const resJson = await res.json();
          if (resJson.success) {
            setStatusMsg({ type: "success", text: "Photo uploaded to gallery successfully!" });
            setModalOpen(false);
            setTimeout(() => window.location.reload(), 1200);
          } else {
            setStatusMsg({ type: "error", text: resJson.error || "Failed to upload photo." });
          }
        } else {
          if (!imageUrl.trim()) {
            setStatusMsg({ type: "error", text: "Please enter a valid image URL." });
            setUploading(false);
            return;
          }
          const res = await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              imageUrl: imageUrl.trim(),
              category,
              tag,
              aspect,
            }),
          });
          const result = await res.json();

          if (result.success && result.item) {
            setItems((prev) => [result.item, ...prev]);
            setStatusMsg({ type: "success", text: "Image URL added to gallery successfully!" });
            setModalOpen(false);
          } else {
            setStatusMsg({ type: "error", text: result.error || "Failed to add image URL." });
          }
        }
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = (item: GalleryItem) => {
    if (!item.isCustom) {
      if (!confirm("Remove this archival photo from your current gallery display?")) return;
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setStatusMsg({ type: "success", text: "Photo removed from gallery list." });
      setTimeout(() => setStatusMsg(null), 3000);
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this photo from the gallery?")) return;

    startTransition(async () => {
      const res = await fetch(`/api/gallery?id=${item.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setStatusMsg({ type: "success", text: "Gallery photo deleted successfully." });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ type: "error", text: result.error || "Failed to delete photo." });
      }
    });
  };

  const filteredItems =
    selectedFilter === "all"
      ? items
      : items.filter((item) => item.category === selectedFilter);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#ffbe33]" />
            <span>Visual Gallery Manager</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Manage high-definition culinary photos, ambiance shots, cocktails, and kitchen craft images.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffbe33] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all cursor-pointer shadow-lg shadow-[#ffbe33]/20 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Gallery Photo</span>
        </button>
      </div>

      {/* Category Pills & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All Items" },
            { key: "dishes", label: "Dishes" },
            { key: "cocktails", label: "Cocktails" },
            { key: "ambiance", label: "Atmosphere" },
            { key: "kitchen", label: "Kitchen Craft" },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedFilter(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedFilter === cat.key
                  ? "bg-[#ffbe33] text-black shadow-sm"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-neutral-400">
          Showing <span className="text-white font-bold">{filteredItems.length}</span> images
        </span>
      </div>

      {/* Feedback Banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border transition-all ${
            statusMsg.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/15 border border-red-500/30 text-red-400"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative bg-[#12141d] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/25 transition-all shadow-md"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-black/40">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-black/75 backdrop-blur-md text-white border border-white/10">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="p-3 border-t border-white/5 space-y-1">
              <span className="text-[10px] font-bold text-[#ffbe33] block truncate">
                {item.tag}
              </span>
              <h4 className="text-xs font-bold text-white truncate" title={item.title}>
                {item.title}
              </h4>

              <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-white/5">
                <span className="text-[9px] text-neutral-500 truncate">
                  {item.isCustom ? "Custom Upload" : "Archival Base"}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer"
                    title="Edit photo details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(item)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unified Add / Edit Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {modalOpen && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setModalOpen(false)}
                  className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 16 }}
                  transition={{ type: "spring", damping: 26, stiffness: 280 }}
                  className="relative z-10 w-full max-w-2xl bg-[#12141d] border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#ffbe33]" />
                      <span>{editingItem ? `Edit: ${editingItem.title}` : "Add Gallery Image"}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Photo Title */}
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">Photo Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Master Chef Flame Seared Wagyu"
                        className="w-full bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffbe33] transition-all"
                      />
                    </div>

                    {/* Category & Tag & Aspect Ratio */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">Category</label>
                        <select
                          value={category}
                          onChange={(e: any) => setCategory(e.target.value)}
                          className="w-full bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffbe33] transition-all cursor-pointer"
                        >
                          <option value="dishes">Culinary Dishes</option>
                          <option value="cocktails">Cocktails & Bar</option>
                          <option value="ambiance">Atmosphere</option>
                          <option value="kitchen">Kitchen Craft</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">Tag / Badge</label>
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          placeholder="e.g. Artisanal Craft"
                          className="w-full bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffbe33] transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">Card Aspect Ratio</label>
                        <select
                          value={aspect}
                          onChange={(e) => setAspect(e.target.value)}
                          className="w-full bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffbe33] transition-all cursor-pointer"
                        >
                          <option value="aspect-[4/3]">Standard 4:3</option>
                          <option value="aspect-[16/10]">Wide 16:10</option>
                          <option value="aspect-[3/4]">Portrait 3:4</option>
                          <option value="aspect-[4/5]">Tall 4:5</option>
                        </select>
                      </div>
                    </div>

                    {/* Dual Option Image Selector: File Upload vs URL */}
                    <div className="p-3.5 rounded-2xl bg-[#090b10] border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between pb-1">
                        <label className="text-neutral-300 font-semibold block text-xs">
                          Image Source
                        </label>
                        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                          <button
                            type="button"
                            onClick={() => setImageMode("upload")}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              imageMode === "upload"
                                ? "bg-[#ffbe33] text-black shadow-sm"
                                : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            <Upload className="w-3 h-3" />
                            <span>File Upload</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageMode("url")}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              imageMode === "url"
                                ? "bg-[#ffbe33] text-black shadow-sm"
                                : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>Image URL</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        {/* Preview Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/15 shrink-0 flex items-center justify-center">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt="Gallery Preview"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <Camera className="w-6 h-6 text-neutral-600" />
                          )}
                        </div>

                        {imageMode === "upload" ? (
                          <div className="flex-1 space-y-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setSelectedFile(file);
                                if (file) {
                                  setImageUrl(URL.createObjectURL(file));
                                }
                              }}
                              className="w-full text-[11px] text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#ffbe33] file:text-black hover:file:bg-[#e6a827] file:cursor-pointer cursor-pointer"
                            />
                            <p className="text-[10px] text-neutral-500">Upload high-res JPG, PNG, or WebP</p>
                          </div>
                        ) : (
                          <div className="flex-1 space-y-1">
                            <input
                              type="url"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/... or public image link"
                              className="w-full bg-[#12141d] border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-[#ffbe33] transition-all placeholder:text-neutral-600"
                            />
                            <p className="text-[10px] text-neutral-500">Paste direct public link to image</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 text-neutral-300 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="px-5 py-2.5 rounded-xl bg-[#ffbe33] text-black font-extrabold uppercase tracking-wider hover:bg-[#e6a827] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-lg shadow-[#ffbe33]/15"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{uploading ? "Saving..." : editingItem ? "Save Changes" : "Add Photo"}</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

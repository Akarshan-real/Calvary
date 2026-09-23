"use client";

import React, { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Utensils,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  X,
  Tag,
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  HeartPulse,
  ShieldAlert,
  Link as LinkIcon,
  Upload,
  Search,
} from "lucide-react";
import type { MenuItem, MenuCategory, MenuItemNutrition } from "@/types/database";
import { motion, AnimatePresence } from "motion/react";
import { api, getApiErrorMessage } from "@/lib/api";

interface AdminMenuManagementProps {
  initialItems: MenuItem[];
  categories: MenuCategory[];
}

export default function AdminMenuManagement({
  initialItems,
  categories,
}: AdminMenuManagementProps) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<"ALL" | "VEG" | "NON_VEG" | "FEATURED">("ALL");
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [editingNutrition, setEditingNutrition] = useState<{
    calories: string;
    protein_g: string;
    carbs_g: string;
    fat_g: string;
    fiber_g: string;
    allergens: string;
  }>({
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    fiber_g: "",
    allergens: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and prevent viewport drift when modal opens
  useEffect(() => {
    if (editingItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [editingItem]);

  const filteredItems = items.filter((item) => {
    // 1. Category filter
    if (selectedCategory !== "ALL" && item.category_id !== selectedCategory) {
      return false;
    }
    // 2. Dietary / Featured filter
    if (dietaryFilter === "VEG" && !item.is_vegetarian) return false;
    if (dietaryFilter === "NON_VEG" && item.is_vegetarian) return false;
    if (dietaryFilter === "FEATURED" && !item.is_featured) return false;

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = (item.description || "").toLowerCase().includes(q);
      const matchPortion = (item.portion_size || "").toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchPortion) return false;
    }

    return true;
  });

  const handleToggleAvailability = (item: MenuItem) => {
    startTransition(async () => {
      try {
        const { data } = await api.patch("/api/menu", { id: item.id, is_available: !item.is_available });
        if (data.success) {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i))
          );
        }
      } catch (err) {
        console.error("Failed to toggle availability:", err);
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this menu item?")) return;
    startTransition(async () => {
      try {
        const { data } = await api.delete(`/api/menu?id=${id}`);
        if (data.success) {
          setItems((prev) => prev.filter((i) => i.id !== id));
          setStatusMsg({ type: "success", text: "Menu dish deleted successfully." });
          setTimeout(() => setStatusMsg(null), 3000);
        } else {
          setStatusMsg({ type: "error", text: data.error || "Failed to delete dish." });
        }
      } catch (err: any) {
        setStatusMsg({ type: "error", text: getApiErrorMessage(err, "Failed to delete dish.") });
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "items");
      formData.append("fileName", editingItem?.name || file.name);

      const { data: resJson } = await api.post("/api/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (resJson.success && resJson.data) {
        setEditingItem((prev) => ({
          ...prev,
          image_url: resJson.data.public_url,
          image_id: resJson.data.id,
        }));
      } else {
        setStatusMsg({ type: "error", text: resJson.error || "Failed to upload image." });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Upload error." });
    } finally {
      setUploadingImage(false);
    }
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    const nut = item.menu_item_nutrition;
    setEditingNutrition({
      calories: nut?.calories !== null && nut?.calories !== undefined ? String(nut.calories) : "",
      protein_g: nut?.protein_g !== null && nut?.protein_g !== undefined ? String(nut.protein_g) : "",
      carbs_g: nut?.carbs_g !== null && nut?.carbs_g !== undefined ? String(nut.carbs_g) : "",
      fat_g: nut?.fat_g !== null && nut?.fat_g !== undefined ? String(nut.fat_g) : "",
      fiber_g: nut?.fiber_g !== null && nut?.fiber_g !== undefined ? String(nut.fiber_g) : "",
      allergens: nut?.allergens ? nut.allergens.join(", ") : "",
    });
  };

  const openCreateModal = () => {
    setEditingItem({
      name: "",
      description: "",
      price: 250,
      category_id: categories[0]?.id || null,
      portion_size: "Regular",
      is_available: true,
      is_vegetarian: false,
      is_featured: false,
    });
    setEditingNutrition({
      calories: "",
      protein_g: "",
      carbs_g: "",
      fat_g: "",
      fiber_g: "",
      allergens: "",
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || editingItem?.price === undefined) {
      setStatusMsg({ type: "error", text: "Title and price are required." });
      return;
    }

    const currentItem = editingItem;
    const currentNut = editingNutrition;

    startTransition(async () => {
      try {
        const allergensList = currentNut.allergens
          ? currentNut.allergens
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const hasNutrition =
          currentNut.calories ||
          currentNut.protein_g ||
          currentNut.carbs_g ||
          currentNut.fat_g ||
          currentNut.fiber_g ||
          allergensList.length > 0;

        const payload: any = {
          ...(currentItem.id ? { id: currentItem.id } : {}),
          name: currentItem.name!.trim(),
          description: currentItem.description?.trim() || null,
          price: Number(currentItem.price),
          category_id: currentItem.category_id ? Number(currentItem.category_id) : null,
          image_url: currentItem.image_url || null,
          portion_size: currentItem.portion_size || "Regular",
          is_vegetarian: !!currentItem.is_vegetarian,
          is_featured: !!currentItem.is_featured,
          is_available: currentItem.is_available ?? true,
        };

        if (hasNutrition) {
          payload.nutrition = {
            calories: currentNut.calories ? parseFloat(currentNut.calories) : null,
            protein_g: currentNut.protein_g ? parseFloat(currentNut.protein_g) : null,
            carbs_g: currentNut.carbs_g ? parseFloat(currentNut.carbs_g) : null,
            fat_g: currentNut.fat_g ? parseFloat(currentNut.fat_g) : null,
            fiber_g: currentNut.fiber_g ? parseFloat(currentNut.fiber_g) : null,
            allergens: allergensList,
          };
        }

        const { data: resJson } = await api.post("/api/menu", payload);
        if (resJson.success && resJson.item) {
          const completeDish: MenuItem = resJson.item;

          if (editingItem.id) {
            setItems((prev) => prev.map((i) => (i.id === completeDish.id ? { ...i, ...completeDish } : i)));
          } else {
            setItems((prev) => [completeDish, ...prev]);
          }
          setEditingItem(null);
          setStatusMsg({ type: "success", text: "Menu dish & nutritional macros saved successfully!" });
          setTimeout(() => setStatusMsg(null), 3500);
        } else {
          setStatusMsg({ type: "error", text: resJson.error || "Failed to save menu dish." });
        }
      } catch (err: any) {
        setStatusMsg({ type: "error", text: err.message || "Failed to save." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#ffbe33]" />
            <span>Menu Catalog Manager</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Create new artisanal culinary dishes, edit pricing, toggle availability, and assign high-res images.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffbe33] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#e6a827] transition-all cursor-pointer shadow-lg shadow-[#ffbe33]/20 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Dish</span>
        </button>
      </div>

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

      {/* Category Pills, Dietary Badges & Live Search Filter Bar */}
      <div className="space-y-3 border-b border-white/10 pb-4">
        {/* Top Row: Category Pills and Dish Count */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-[#ffbe33] text-black shadow-sm"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              All Items ({items.length})
            </button>
            {categories.map((cat) => {
              const count = items.filter((i) => i.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-[#ffbe33] text-black shadow-sm"
                      : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          <span className="text-xs text-neutral-400">
            Showing <span className="text-white font-bold">{filteredItems.length}</span> of {items.length} dishes
          </span>
        </div>

        {/* Second Row: Search Field & Dietary Badges */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dish by name, description..."
              className="w-full bg-[#12141d] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-[#ffbe33] transition-all placeholder:text-neutral-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Dietary Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: "ALL", label: "Any Type" },
              { key: "VEG", label: "Vegetarian 🟢" },
              { key: "NON_VEG", label: "Non-Veg 🔴" },
              { key: "FEATURED", label: "Featured ⭐" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setDietaryFilter(f.key as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                  dietaryFilter === f.key
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/5 text-neutral-400 hover:text-white border border-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <motion.div
            layoutId={`menu-dish-${item.id}`}
            key={item.id}
            className="bg-[#12141d] border border-white/10 rounded-3xl p-5 hover:border-[#ffbe33]/30 transition-colors flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <motion.div 
                  layoutId={`dish-img-${item.id}`}
                  className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0"
                >
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <motion.h3 
                      layoutId={`dish-title-${item.id}`}
                      className="font-bold text-sm sm:text-base text-white truncate"
                    >
                      {item.name}
                    </motion.h3>
                    {item.is_vegetarian && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Vegetarian" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#ffbe33] mt-0.5">₹{Number(item.price).toLocaleString("en-IN")}</p>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                  {categories.find((c) => c.id === item.category_id)?.name || "Uncategorized"}
                </span>
                {item.portion_size && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                    {item.portion_size}
                  </span>
                )}
                {item.is_featured && (
                  <span className="px-2 py-0.5 rounded-md bg-[#ffbe33]/15 text-[#ffbe33] font-bold border border-[#ffbe33]/25">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Item Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleToggleAvailability(item)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  item.is_available
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                }`}
              >
                {item.is_available ? "In Stock" : "Unavailable"}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer"
                  title="Edit dish"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all cursor-pointer"
                  title="Delete dish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expandable Edit / Create Item Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {editingItem && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingItem(null)}
                  className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
                />

                {/* Card Container with Expandable Layout Animation */}
                <motion.div
                  layoutId={editingItem.id ? `menu-dish-${editingItem.id}` : undefined}
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 16 }}
                  transition={{ type: "spring", damping: 26, stiffness: 280 }}
                  className="relative z-10 w-full max-w-3xl bg-[#12141d] border border-white/20 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-[#ffbe33]" />
                      <motion.span layoutId={editingItem.id ? `dish-title-${editingItem.id}` : undefined}>
                        {editingItem.id ? `Edit: ${editingItem.name || "Menu Dish"}` : "Create New Menu Dish"}
                      </motion.span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
                    {/* Dish Title */}
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold block">Dish Title *</label>
                      <input
                        type="text"
                        required
                        value={editingItem.name || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        placeholder="e.g. Signature Truffle Pizza"
                        className="w-full bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffbe33] transition-all"
                      />
                    </div>

                    {/* Price in INR and Category */}
                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block text-xs">
                          Price (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ffbe33] font-bold text-sm select-none">
                            ₹
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            required
                            value={editingItem.price !== undefined && editingItem.price !== null ? String(editingItem.price) : ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                setEditingItem({
                                  ...editingItem,
                                  price: val === "" ? ("" as any) : Number(val),
                                });
                              }
                            }}
                            placeholder="450"
                            className="w-full bg-[#0e111a] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white font-semibold outline-none focus:border-[#ffbe33] transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block text-xs">
                          Category *
                        </label>
                        <select
                          value={editingItem.category_id || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              category_id: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          className="w-full bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffbe33] transition-all cursor-pointer"
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Portion Size & Description */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-neutral-400 font-semibold block">Portion / Weight</label>
                        <input
                          type="text"
                          value={editingItem.portion_size || ""}
                          onChange={(e) => setEditingItem({ ...editingItem, portion_size: e.target.value })}
                          placeholder="e.g. 250g / Serves 1-2"
                          className="w-full bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffbe33] transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-neutral-400 font-semibold block">Description</label>
                        <input
                          type="text"
                          value={editingItem.description || ""}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          placeholder="Artisanal sourdough crust, fresh fior di latte..."
                          className="w-full bg-[#0e111a] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffbe33] transition-all"
                        />
                      </div>
                    </div>

                    {/* ========================================================= */}
                    {/* FOOD MACRONUTRIENTS & MICRONUTRIENTS SECTION */}
                    {/* ========================================================= */}
                    <div className="p-3.5 rounded-2xl bg-[#090b10] border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                          <Flame className="w-3.5 h-3.5 text-[#ffbe33]" />
                          <span>Food Macros &amp; Nutrition</span>
                        </span>
                        <span className="text-[10px] text-neutral-400">Values per serving</span>
                      </div>

                      {/* Calories & 4 Major Macros without placeholders */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {/* Calories */}
                        <div className="bg-[#12141d] border border-white/10 rounded-xl p-2 space-y-1 focus-within:border-amber-400/60 transition-colors">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 text-center">
                            Calories
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editingNutrition.calories}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setEditingNutrition({ ...editingNutrition, calories: val });
                                }
                              }}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none text-center focus:bg-black/60 transition-all"
                            />
                            <span className="absolute right-2 text-[9px] text-neutral-500 font-medium pointer-events-none">
                              kcal
                            </span>
                          </div>
                        </div>

                        {/* Protein */}
                        <div className="bg-[#12141d] border border-white/10 rounded-xl p-2 space-y-1 focus-within:border-[#ff2d55]/60 transition-colors">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff2d55] text-center">
                            Protein
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editingNutrition.protein_g}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setEditingNutrition({ ...editingNutrition, protein_g: val });
                                }
                              }}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none text-center focus:bg-black/60 transition-all"
                            />
                            <span className="absolute right-2.5 text-[9px] text-neutral-500 font-medium pointer-events-none">
                              g
                            </span>
                          </div>
                        </div>

                        {/* Carbs */}
                        <div className="bg-[#12141d] border border-white/10 rounded-xl p-2 space-y-1 focus-within:border-[#a3f900]/60 transition-colors">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#a3f900] text-center">
                            Carbs
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editingNutrition.carbs_g}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setEditingNutrition({ ...editingNutrition, carbs_g: val });
                                }
                              }}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none text-center focus:bg-black/60 transition-all"
                            />
                            <span className="absolute right-2.5 text-[9px] text-neutral-500 font-medium pointer-events-none">
                              g
                            </span>
                          </div>
                        </div>

                        {/* Fats */}
                        <div className="bg-[#12141d] border border-white/10 rounded-xl p-2 space-y-1 focus-within:border-[#04c7dd]/60 transition-colors">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#04c7dd] text-center">
                            Fats
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editingNutrition.fat_g}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setEditingNutrition({ ...editingNutrition, fat_g: val });
                                }
                              }}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none text-center focus:bg-black/60 transition-all"
                            />
                            <span className="absolute right-2.5 text-[9px] text-neutral-500 font-medium pointer-events-none">
                              g
                            </span>
                          </div>
                        </div>

                        {/* Fiber */}
                        <div className="bg-[#12141d] border border-white/10 rounded-xl p-2 space-y-1 focus-within:border-purple-400/60 transition-colors col-span-2 sm:col-span-1">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 text-center">
                            Fiber
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editingNutrition.fiber_g}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setEditingNutrition({ ...editingNutrition, fiber_g: val });
                                }
                              }}
                              className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs font-bold outline-none text-center focus:bg-black/60 transition-all"
                            />
                            <span className="absolute right-2.5 text-[9px] text-neutral-500 font-medium pointer-events-none">
                              g
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Allergens & Micronutrient / Advisory tags without placeholder */}
                      <div className="space-y-1 pt-0.5">
                        <label className="text-[11px] font-semibold text-neutral-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                            <span>Allergens &amp; Dietary Flags</span>
                          </span>
                          <span className="text-[10px] text-neutral-500">Comma-separated</span>
                        </label>
                        <input
                          type="text"
                          value={editingNutrition.allergens}
                          onChange={(e) => setEditingNutrition({ ...editingNutrition, allergens: e.target.value })}
                          className="w-full bg-[#12141d] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffbe33] transition-all"
                        />
                      </div>
                    </div>

                    {/* ========================================================= */}
                    {/* DUAL OPTION IMAGE SELECTOR: FILE UPLOAD OR URL */}
                    {/* ========================================================= */}
                    <div className="space-y-2 p-4 rounded-2xl bg-[#090b10] border border-white/10">
                      <div className="flex items-center justify-between pb-1">
                        <label className="text-neutral-300 font-semibold block text-xs">
                          Dish Image
                        </label>
                        {/* Two options tabs */}
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

                      <div className="flex items-center gap-3.5 pt-1">
                        {/* Image Preview Thumbnail */}
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-black/60 border border-white/15 shrink-0 flex items-center justify-center">
                          {editingItem.image_url ? (
                            <Image
                              src={editingItem.image_url}
                              alt="Dish Preview"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <Utensils className="w-5 h-5 text-neutral-600" />
                          )}
                        </div>

                        {/* Option 1: File Upload */}
                        {imageMode === "upload" ? (
                          <div className="flex-1 space-y-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="w-full text-[11px] text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#ffbe33] file:text-black hover:file:bg-[#e6a827] file:cursor-pointer cursor-pointer"
                            />
                            {uploadingImage && (
                              <span className="text-[11px] text-[#ffbe33] font-semibold animate-pulse block">
                                Uploading image to storage...
                              </span>
                            )}
                          </div>
                        ) : (
                          /* Option 2: Image URL */
                          <div className="flex-1 space-y-1">
                            <input
                              type="url"
                              value={editingItem.image_url || ""}
                              onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                              placeholder="https://images.unsplash.com/... or cloud image link"
                              className="w-full bg-[#12141d] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#ffbe33] transition-all placeholder:text-neutral-600"
                            />
                            <p className="text-[10px] text-neutral-500">Paste direct public link to image (.jpg, .png, .webp)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                        <input
                          type="checkbox"
                          checked={!!editingItem.is_vegetarian}
                          onChange={(e) => setEditingItem({ ...editingItem, is_vegetarian: e.target.checked })}
                          className="accent-[#ffbe33] w-4 h-4 cursor-pointer"
                        />
                        <span>Vegetarian Dish</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                        <input
                          type="checkbox"
                          checked={!!editingItem.is_featured}
                          onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                          className="accent-[#ffbe33] w-4 h-4 cursor-pointer"
                        />
                        <span>Featured Specialty</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 text-neutral-300 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPending || uploadingImage}
                        className="px-5 py-2.5 rounded-xl bg-[#ffbe33] text-black font-extrabold uppercase tracking-wider hover:bg-[#e6a827] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-lg shadow-[#ffbe33]/15"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isPending ? "Saving..." : "Save Dish"}</span>
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

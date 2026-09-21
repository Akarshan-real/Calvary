"use client";

import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit03Icon,
  Tick02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons/index";
import { BirthdayCalendar } from "@/components/ui/simple-calender";
import { toast } from "sonner";

export interface ProfileEditableFieldProps {
  icon: any;
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  type?: "text" | "email" | "date" | "tel";
  placeholder?: string;
  readOnly?: boolean;
  verifiedBadge?: boolean;
  helperText?: string;
  multiline?: boolean;
}

export const ProfileEditableField: React.FC<ProfileEditableFieldProps> = ({
  icon,
  label,
  value,
  onSave,
  type = "text",
  placeholder = "",
  readOnly = false,
  verifiedBadge = false,
  helperText,
  multiline = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const inputId = useId();

  React.useEffect(() => {
    setVal(value);
  }, [value]);

  const handleSave = () => {
    onSave(val);
    setEditing(false);
    setShowCalendarPicker(false);
    toast.info(`${label} updated`, {
      description: "Click 'Save All' on top to persist your changes.",
    });
  };

  const handleCancel = () => {
    setVal(value);
    setEditing(false);
    setShowCalendarPicker(false);
  };

  return (
    <div className="relative w-full flex flex-col gap-1.5 p-3 sm:p-4 rounded-2xl bg-[#0e111a] border border-white/10 hover:border-[#ffbe33]/40 transition-all duration-200">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2"
        >
          <HugeiconsIcon icon={icon} size={18} color="#ffbe33" strokeWidth={1.8} />
          <span>{label}</span>
        </label>

        {!readOnly && (
          <div>
            <AnimatePresence mode="popLayout" initial={false}>
              {editing ? (
                <motion.div
                  key="editing-actions"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5"
                >
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex size-7 items-center justify-center rounded-lg bg-[#ffbe33] text-black hover:bg-[#e6a827] shadow-sm transition-transform active:scale-95"
                    title="Save"
                  >
                    <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex size-7 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-transform active:scale-95"
                    title="Cancel"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  </button>
                </motion.div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    if (type === "date") setShowCalendarPicker(true);
                  }}
                  className="flex size-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-[#ffbe33] hover:border-[#ffbe33]/50 transition-all"
                  title="Edit"
                >
                  <HugeiconsIcon icon={Edit03Icon} size={16} />
                </button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1 relative">
        {multiline ? (
          <textarea
            id={inputId}
            rows={2}
            value={val}
            readOnly={!editing}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-transparent text-sm font-medium outline-none resize-none transition-all ${
              editing
                ? "text-white bg-[#141824] p-2.5 rounded-xl border border-[#ffbe33]/60 focus:ring-2 focus:ring-[#ffbe33]/20"
                : "text-neutral-200"
            }`}
          />
        ) : type === "date" ? (
          <div className="w-full">
            <div
              onClick={() => {
                if (editing) setShowCalendarPicker(!showCalendarPicker);
              }}
              className={`w-full text-sm font-medium transition-all flex items-center justify-between ${
                editing
                  ? "text-white bg-[#141824] px-3 py-2 rounded-xl border border-[#ffbe33]/60 cursor-pointer"
                  : "text-white py-1"
              }`}
            >
              <span>{val ? val : placeholder || "Select birthday"}</span>
              {editing && (
                <span className="text-xs text-[#ffbe33] font-semibold">
                  {showCalendarPicker ? "Hide Calendar" : "Pick Date"}
                </span>
              )}
            </div>

            {/* Custom Birthday Calendar Dropdown Popover */}
            {editing && showCalendarPicker && (
              <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[340px] animate-in fade-in zoom-in-95 duration-150">
                <BirthdayCalendar
                  value={val}
                  onChange={(newDate) => {
                    setVal(newDate);
                    setShowCalendarPicker(false);
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <input
            id={inputId}
            type={type}
            value={val}
            readOnly={!editing || readOnly}
            disabled={readOnly}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder={placeholder}
            className={`w-full bg-transparent text-sm font-medium outline-none transition-all ${
              readOnly
                ? "text-neutral-400 cursor-not-allowed"
                : editing
                ? "text-white bg-[#141824] px-3 py-2 rounded-xl border border-[#ffbe33]/60 focus:ring-2 focus:ring-[#ffbe33]/20"
                : "text-white"
            }`}
          />
        )}

        {verifiedBadge && (
          <span className="shrink-0 text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            Verified
          </span>
        )}
      </div>

      {helperText && (
        <span className="text-[11px] text-neutral-500 leading-tight">
          {helperText}
        </span>
      )}
    </div>
  );
};

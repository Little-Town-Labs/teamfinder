"use client";

import { Bug, Lightbulb, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FeedbackSubmissionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "bug_report", label: "Bug Report", icon: Bug, color: "text-red-600" },
  { value: "feature_request", label: "Feature Request", icon: Lightbulb, color: "text-yellow-600" },
  { value: "general_feedback", label: "General Feedback", icon: MessageSquare, color: "text-blue-600" },
  { value: "other", label: "Other", icon: MessageSquare, color: "text-gray-600" },
] as const;

export default function FeedbackSubmissionModal({ onClose, onSuccess }: FeedbackSubmissionModalProps) {
  const [category, setCategory] = useState<string>("general_feedback");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (description.length > 5000) {
      newErrors.description = "Description must be less than 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting feedback...");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, description }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      toast.success("Feedback submitted successfully!", { id: toastId });
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === category) || CATEGORIES[2];
  const CategoryIcon = selectedCategory.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 shadow-2xl dark:from-gray-800 dark:to-gray-900/50">
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-purple-50/30 p-6 dark:border-gray-700/50 dark:from-blue-950/20 dark:to-purple-950/10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Feedback</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Help us make TeamFinder better</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2.5 text-gray-500 transition-all hover:bg-white/80 hover:text-gray-700 hover:shadow-md dark:hover:bg-gray-700 dark:hover:text-gray-300"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Category Selection */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Category
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all duration-200 ${
                      category === cat.value
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-500/20 dark:border-blue-400 dark:from-blue-900/30 dark:to-blue-800/20"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-600"
                    }`}
                  >
                    <div className={`rounded-lg p-2 transition-colors ${
                      category === cat.value
                        ? "bg-blue-500/10"
                        : "bg-gray-100 group-hover:bg-blue-50 dark:bg-gray-700 dark:group-hover:bg-blue-900/20"
                    }`}>
                      <Icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${category === cat.value ? "text-blue-600 dark:text-blue-400" : cat.color}`} />
                    </div>
                    <span className={`text-xs font-semibold ${category === cat.value ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"}`}>
                      {cat.label}
                    </span>
                    {category === cat.value && (
                      <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white dark:ring-gray-800" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CategoryIcon className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${selectedCategory.color}`} />
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="Brief summary of your feedback"
                className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 font-medium transition-all dark:bg-gray-800/50 dark:text-white ${
                  errors.title
                    ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:focus:border-blue-500"
                }`}
                maxLength={100}
                disabled={submitting}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              {errors.title ? (
                <p className="text-sm font-medium text-red-500">{errors.title}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">Minimum 5 characters</p>
              )}
              <span className={`text-xs font-medium ${title.length > 90 ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}`}>
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: undefined });
              }}
              placeholder="Please provide as much detail as possible..."
              rows={8}
              className={`w-full rounded-xl border-2 p-4 font-medium transition-all dark:bg-gray-800/50 dark:text-white ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:focus:border-blue-500"
              }`}
              maxLength={5000}
              disabled={submitting}
            />
            <div className="mt-2 flex items-center justify-between">
              {errors.description ? (
                <p className="text-sm font-medium text-red-500">{errors.description}</p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">Minimum 20 characters</p>
              )}
              <span className={`text-xs font-medium ${description.length > 4800 ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"}`}>
                {description.length}/5000
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="group flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:from-blue-600 dark:to-blue-700"
              disabled={submitting}
            >
              <span className="flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
